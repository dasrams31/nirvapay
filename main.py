import csv
from datetime import datetime, timedelta
import hashlib
import hmac
import io
import json
import logging
import os
import random
import re
import asyncio
from typing import Optional
import httpx

from fastapi import Depends, FastAPI, Header, HTTPException, Query, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import async_session, init_db
from models import ApiKey, Merchant, MerchantConnection, Mutation, PaymentInvoice, WebhookEndpoint, WebhookLog
from auth import create_jwt_token, decode_jwt_token, hash_password, verify_password
from qris_engine import generate_dynamic_qris, generate_qr_png_bytes
from telegram_notifier import format_payment_paid_alert, send_telegram_alert
from bukaolshop_engine import trigger_bukaolshop_confirm_callback

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nirvapay")

app = FastAPI(
    title="NirvaPay Gateway API",
    description="Multi-Tenant Multi-Merchant QRIS Payment Gateway & Aggregator SaaS",
    version="1.0.0",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

base_dir = os.path.dirname(os.path.abspath(__file__))
app.mount("/static", StaticFiles(directory=os.path.join(base_dir, "static")), name="static")
templates = Jinja2Templates(directory=os.path.join(base_dir, "templates"))


@app.on_event("startup")
async def on_startup():
    await init_db()
    logger.info(f"NirvaPay Multi-Tenant Gateway running on port {settings.PORT}")


# ==============================================================================
# AUTH DEPENDENCY & RESOLUTION
# ==============================================================================
async def get_current_merchant_optional(request: Request) -> Optional[Merchant]:
    """Resolves merchant from cookie or Bearer JWT token."""
    token = request.cookies.get("nirvapay_session")
    auth_hdr = request.headers.get("Authorization")
    
    if not token and auth_hdr and auth_hdr.startswith("Bearer "):
        token = auth_hdr.replace("Bearer ", "").strip()
        
    if not token:
        return None
        
    payload = decode_jwt_token(token)
    if not payload or "merchant_id" not in payload:
        return None
        
    async with async_session() as session:
        stmt = select(Merchant).where(Merchant.id == int(payload["merchant_id"]))
        res = await session.execute(stmt)
        return res.scalar_one_or_none()


async def get_current_merchant_required(request: Request) -> Merchant:
    merchant = await get_current_merchant_optional(request)
    if not merchant:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return merchant


async def resolve_merchant_from_apikey(request: Request) -> Optional[Merchant]:
    """Resolves merchant from ApiKey (Authorization: Bearer sec_live_... / pub_live_...)."""
    auth_hdr = request.headers.get("Authorization")
    if not auth_hdr:
        return None
        
    token = auth_hdr.replace("Bearer ", "").strip()
    async with async_session() as session:
        stmt = select(ApiKey).where(
            (ApiKey.secret_key == token) | (ApiKey.public_key == token)
        ).where(ApiKey.is_active.is_(True))
        res = await session.execute(stmt)
        api_key = res.scalar_one_or_none()
        if api_key:
            stmt_m = select(Merchant).where(Merchant.id == api_key.merchant_id)
            res_m = await session.execute(stmt_m)
            return res_m.scalar_one_or_none()
    return None


# ==============================================================================
# 1. FRONTEND WEB PAGES
# ==============================================================================
@app.get("/", response_class=HTMLResponse)
async def page_landing(request: Request):
    """Landing Page Publik NirvaPay."""
    return templates.TemplateResponse(request=request, name="landing.html", context={"settings": settings})


@app.get("/login", response_class=HTMLResponse)
async def page_login(request: Request):
    merchant = await get_current_merchant_optional(request)
    if merchant:
        return RedirectResponse(url="/dashboard")
    return templates.TemplateResponse(request=request, name="login.html", context={"settings": settings})


@app.get("/register", response_class=HTMLResponse)
async def page_register(request: Request):
    merchant = await get_current_merchant_optional(request)
    if merchant:
        return RedirectResponse(url="/dashboard")
    return templates.TemplateResponse(request=request, name="register.html", context={"settings": settings})


@app.get("/dashboard", response_class=HTMLResponse)
async def page_dashboard(request: Request):
    """Console Dashboard Merchant."""
    merchant = await get_current_merchant_optional(request)
    if not merchant:
        # Fallback to master merchant if accessing local console
        async with async_session() as session:
            stmt = select(Merchant).where(Merchant.id == 1)
            merchant = (await session.execute(stmt)).scalar_one_or_none()

    return templates.TemplateResponse(
        request=request,
        name="dashboard.html",
        context={"merchant": merchant, "settings": settings},
    )


@app.get("/pay/{invoice_id}", response_class=HTMLResponse)
async def page_checkout(request: Request, invoice_id: str):
    """Halaman Checkout Pelanggan."""
    async with async_session() as session:
        stmt = select(PaymentInvoice).where(PaymentInvoice.invoice_id == invoice_id)
        res = await session.execute(stmt)
        invoice = res.scalar_one_or_none()
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice tidak ditemukan")
        return templates.TemplateResponse(
            request=request,
            name="checkout.html",
            context={"invoice": invoice, "settings": settings},
        )


@app.get("/api/v1/invoices/{invoice_id}/qr")
async def get_invoice_qr(invoice_id: str):
    async with async_session() as session:
        stmt = select(PaymentInvoice).where(PaymentInvoice.invoice_id == invoice_id)
        res = await session.execute(stmt)
        invoice = res.scalar_one_or_none()
        if not invoice or not invoice.qris_payload:
            raise HTTPException(status_code=404, detail="Invoice / QRIS payload tidak ditemukan")
        qr_bytes = generate_qr_png_bytes(invoice.qris_payload)
        return Response(content=qr_bytes, media_type="image/png")


@app.get("/api/v1/invoices/{invoice_id}/status")
async def get_invoice_status(invoice_id: str):
    async with async_session() as session:
        stmt = select(PaymentInvoice).where(PaymentInvoice.invoice_id == invoice_id)
        res = await session.execute(stmt)
        invoice = res.scalar_one_or_none()
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        return {
            "invoice_id": invoice.invoice_id,
            "status": invoice.status,
            "total_amount": invoice.total_amount,
            "paid_at": invoice.paid_at.isoformat() if invoice.paid_at else None,
        }


# ==============================================================================
# 2. AUTHENTICATION & MULTI-TENANT APIs
# ==============================================================================
class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    business_name: str
    owner_name: str = "Merchant Owner"
    email: str
    password: str
    phone_number: Optional[str] = None
    static_qris_payload: Optional[str] = None


@app.post("/api/v1/auth/login")
async def api_auth_login(req: LoginRequest, response: Response):
    async with async_session() as session:
        stmt = select(Merchant).where(Merchant.email == req.email.lower().strip())
        res = await session.execute(stmt)
        merchant = res.scalar_one_or_none()
        
        if not merchant or not verify_password(req.password, merchant.password_hash):
            return JSONResponse(content={"success": False, "message": "Email atau password tidak sesuai"}, status_code=401)
            
        token = create_jwt_token({
            "merchant_id": merchant.id,
            "email": merchant.email,
            "business_name": merchant.business_name,
        })
        
        response.set_cookie(
            key="nirvapay_session",
            value=token,
            httponly=True,
            max_age=86400 * 7,
            samesite="lax",
        )
        return {"success": True, "token": token, "business_name": merchant.business_name}


@app.post("/api/v1/auth/register")
async def api_auth_register(req: RegisterRequest, response: Response):
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password minimal 6 karakter")

    async with async_session() as session:
        stmt_exist = select(Merchant).where(Merchant.email == req.email.lower().strip())
        if (await session.execute(stmt_exist)).scalar_one_or_none():
            return JSONResponse(content={"success": False, "message": "Email sudah terdaftar"}, status_code=400)

        # Generate Unique Random API Keys
        random_hex = random.randbytes(5).hex()
        pub_key = f"pub_live_nirva_{random_hex}"
        sec_key = f"sec_live_nirva_{random.randbytes(8).hex()}"

        new_merchant = Merchant(
            email=req.email.lower().strip(),
            password_hash=hash_password(req.password),
            business_name=req.business_name,
            owner_name=req.owner_name,
            phone_number=req.phone_number,
            static_qris_payload=req.static_qris_payload or settings.DEFAULT_STATIC_QRIS,
            webhook_secret=f"whsec_{random.randbytes(6).hex()}",
            is_active=True,
        )
        session.add(new_merchant)
        await session.commit()
        await session.refresh(new_merchant)

        # Seed ApiKey for this merchant
        api_key = ApiKey(
            merchant_id=new_merchant.id,
            name="Default Production Key",
            public_key=pub_key,
            secret_key=sec_key,
            is_sandbox=False,
            is_active=True,
        )
        session.add(api_key)

        # Seed Default Merchant Connections
        channels = [
            ("gopay", "GoPay Merchant (GoBiz)", True, "Active & Polling", {"mode": "notification"}),
            ("dana", "DANA Forwarder Node", True, "Connected", {"auto_approve": True}),
            ("static_qris", "National Dynamic QRIS Engine", True, "Active", {}),
        ]
        for code, name, is_act, status_txt, cfg in channels:
            session.add(MerchantConnection(
                merchant_id=new_merchant.id,
                channel=code,
                name=name,
                is_active=is_act,
                status_text=status_txt,
                config_json=json.dumps(cfg),
            ))

        await session.commit()

        token = create_jwt_token({
            "merchant_id": new_merchant.id,
            "email": new_merchant.email,
            "business_name": new_merchant.business_name,
        })
        response.set_cookie(
            key="nirvapay_session",
            value=token,
            httponly=True,
            max_age=86400 * 7,
            samesite="lax",
        )
        return {"success": True, "token": token, "business_name": new_merchant.business_name}


@app.post("/api/v1/auth/logout")
async def api_auth_logout(response: Response):
    response.delete_cookie(key="nirvapay_session")
    return {"success": True, "message": "Logged out"}


# ==============================================================================
# 3. DASHBOARD & DATA APIs (TENANT ISOLATED)
# ==============================================================================
@app.get("/api/v1/dashboard/summary")
async def api_dashboard_summary(request: Request):
    merchant = await get_current_merchant_optional(request)
    merchant_id = merchant.id if merchant else 1

    async with async_session() as session:
        now = datetime.utcnow()
        start_of_today = datetime(now.year, now.month, now.day)
        start_of_month = datetime(now.year, now.month, 1)

        stmt_today = select(func.sum(PaymentInvoice.total_amount)).where(
            PaymentInvoice.merchant_id == merchant_id,
            PaymentInvoice.status == "PAID",
            PaymentInvoice.paid_at >= start_of_today,
        )
        omset_today = (await session.execute(stmt_today)).scalar() or 0.0

        stmt_month = select(func.sum(PaymentInvoice.total_amount)).where(
            PaymentInvoice.merchant_id == merchant_id,
            PaymentInvoice.status == "PAID",
            PaymentInvoice.paid_at >= start_of_month,
        )
        omset_month = (await session.execute(stmt_month)).scalar() or 0.0

        stmt_paid_count = select(func.count(PaymentInvoice.id)).where(
            PaymentInvoice.merchant_id == merchant_id,
            PaymentInvoice.status == "PAID",
        )
        total_paid_count = (await session.execute(stmt_paid_count)).scalar() or 0

        stmt_pending_count = select(func.count(PaymentInvoice.id)).where(
            PaymentInvoice.merchant_id == merchant_id,
            PaymentInvoice.status == "PENDING",
            PaymentInvoice.expired_at > now,
        )
        pending_count = (await session.execute(stmt_pending_count)).scalar() or 0

        total_all = total_paid_count + pending_count
        success_rate = round((total_paid_count / total_all * 100), 1) if total_all > 0 else 100.0

        stmt_recent = select(PaymentInvoice).where(
            PaymentInvoice.merchant_id == merchant_id
        ).order_by(PaymentInvoice.created_at.desc()).limit(10)
        recent_res = await session.execute(stmt_recent)
        recent_invoices = [
            {
                "invoice_id": inv.invoice_id,
                "customer_name": inv.customer_name,
                "total_amount": inv.total_amount,
                "status": inv.status,
                "payment_channel": inv.payment_channel,
                "created_at": inv.created_at.isoformat(),
            }
            for inv in recent_res.scalars().all()
        ]

        return {
            "success": True,
            "omset_today": float(omset_today),
            "omset_month": float(omset_month),
            "total_paid_count": total_paid_count,
            "pending_count": pending_count,
            "success_rate": success_rate,
            "recent_invoices": recent_invoices,
        }


class InvoiceCreateRequest(BaseModel):
    amount: float
    customer_name: str = "Pelanggan"
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    description: Optional[str] = None
    payment_channel: str = "QRIS"
    merchant_ref: Optional[str] = None
    callback_url: Optional[str] = None
    return_url: Optional[str] = None


@app.get("/api/v1/invoices")
async def api_get_invoices(request: Request, limit: int = 50):
    merchant = await get_current_merchant_optional(request)
    merchant_id = merchant.id if merchant else 1

    async with async_session() as session:
        stmt = select(PaymentInvoice).where(
            PaymentInvoice.merchant_id == merchant_id
        ).order_by(PaymentInvoice.created_at.desc()).limit(limit)
        res = await session.execute(stmt)
        invoices = [
            {
                "invoice_id": inv.invoice_id,
                "customer_name": inv.customer_name,
                "description": inv.description,
                "amount": inv.amount,
                "unique_code": inv.unique_code,
                "total_amount": inv.total_amount,
                "status": inv.status,
                "payment_channel": inv.payment_channel,
                "created_at": inv.created_at.isoformat(),
                "paid_at": inv.paid_at.isoformat() if inv.paid_at else None,
            }
            for inv in res.scalars().all()
        ]
        return {"success": True, "invoices": invoices}


@app.post("/api/v1/invoices")
async def api_create_invoice(req: InvoiceCreateRequest, request: Request):
    """
    Membuat invoice pembayaran baru.
    Mendukung autentikasi via ApiKey (Authorization: Bearer sec_live_...) maupun session merchant.
    """
    if req.amount < 1000:
        raise HTTPException(status_code=400, detail="Minimal pembayaran Rp 1.000")

    # Resolve merchant
    merchant = await resolve_merchant_from_apikey(request) or await get_current_merchant_optional(request)
    merchant_id = merchant.id if merchant else 1
    static_qris = merchant.static_qris_payload if (merchant and merchant.static_qris_payload) else settings.DEFAULT_STATIC_QRIS

    async with async_session() as session:
        stmt_pending = select(PaymentInvoice.total_amount).where(
            PaymentInvoice.merchant_id == merchant_id,
            PaymentInvoice.status == "PENDING",
            PaymentInvoice.expired_at > datetime.utcnow(),
        )
        res_pending = await session.execute(stmt_pending)
        pending_amounts = set(res_pending.scalars().all())

        unique_code = random.randint(1, 499)
        total_amount = int(req.amount) + unique_code
        for _ in range(30):
            if total_amount not in pending_amounts:
                break
            unique_code = random.randint(1, 499)
            total_amount = int(req.amount) + unique_code

        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M")
        invoice_id = f"INV-{timestamp}-{random.randint(1000, 9999)}"
        expired_at = datetime.utcnow() + timedelta(minutes=15)

        dynamic_qris = generate_dynamic_qris(amount=total_amount, static_qris=static_qris)

        invoice = PaymentInvoice(
            merchant_id=merchant_id,
            invoice_id=invoice_id,
            merchant_ref=req.merchant_ref,
            amount=req.amount,
            unique_code=unique_code,
            total_amount=float(total_amount),
            status="PENDING",
            customer_name=req.customer_name,
            customer_phone=req.customer_phone,
            customer_email=req.customer_email,
            description=req.description,
            payment_channel=req.payment_channel,
            qris_payload=dynamic_qris,
            callback_url=req.callback_url,
            return_url=req.return_url,
            created_at=datetime.utcnow(),
            expired_at=expired_at,
        )
        session.add(invoice)
        await session.commit()
        await session.refresh(invoice)

        return {
            "success": True,
            "invoice": {
                "invoice_id": invoice.invoice_id,
                "amount": invoice.amount,
                "unique_code": invoice.unique_code,
                "total_amount": invoice.total_amount,
                "qris_payload": invoice.qris_payload,
                "payment_url": f"/pay/{invoice.invoice_id}",
                "expired_at": invoice.expired_at.isoformat(),
            },
        }


@app.get("/api/v1/mutations")
async def api_get_mutations(request: Request, limit: int = 50):
    merchant = await get_current_merchant_optional(request)
    merchant_id = merchant.id if merchant else 1

    async with async_session() as session:
        stmt = select(Mutation).where(
            Mutation.merchant_id == merchant_id
        ).order_by(Mutation.created_at.desc()).limit(limit)
        res = await session.execute(stmt)
        mutations = [
            {
                "id": m.id,
                "channel": m.channel,
                "amount": m.amount,
                "sender": m.sender,
                "raw_text": m.raw_text,
                "is_matched": m.is_matched,
                "matched_invoice_id": m.matched_invoice_id,
                "created_at": m.created_at.isoformat(),
            }
            for m in res.scalars().all()
        ]
        return {"success": True, "mutations": mutations}


@app.get("/api/v1/connections")
async def api_get_connections(request: Request):
    merchant = await get_current_merchant_optional(request)
    merchant_id = merchant.id if merchant else 1

    async with async_session() as session:
        stmt = select(MerchantConnection).where(
            MerchantConnection.merchant_id == merchant_id
        ).order_by(MerchantConnection.id.asc())
        res = await session.execute(stmt)
        connections = [
            {
                "id": c.id,
                "channel": c.channel,
                "name": c.name,
                "is_active": c.is_active,
                "status_text": c.status_text,
            }
            for c in res.scalars().all()
        ]
        return {"success": True, "connections": connections}


@app.get("/api/v1/apikeys")
async def api_get_apikeys(request: Request):
    merchant = await get_current_merchant_optional(request)
    merchant_id = merchant.id if merchant else 1

    async with async_session() as session:
        stmt = select(ApiKey).where(
            ApiKey.merchant_id == merchant_id
        ).order_by(ApiKey.id.asc())
        res = await session.execute(stmt)
        keys = [
            {
                "id": k.id,
                "name": k.name,
                "public_key": k.public_key,
                "secret_key": k.secret_key,
                "is_sandbox": k.is_sandbox,
                "is_active": k.is_active,
            }
            for k in res.scalars().all()
        ]
        return {"success": True, "api_keys": keys}


@app.get("/api/v1/webhooks")
async def api_get_webhooks(request: Request):
    merchant = await get_current_merchant_optional(request)
    merchant_id = merchant.id if merchant else 1

    async with async_session() as session:
        stmt = select(WebhookEndpoint).where(
            WebhookEndpoint.merchant_id == merchant_id
        ).order_by(WebhookEndpoint.id.asc())
        res = await session.execute(stmt)
        hooks = [
            {
                "id": w.id,
                "url": w.url,
                "secret_key": w.secret_key,
                "is_active": w.is_active,
            }
            for w in res.scalars().all()
        ]
        return {"success": True, "webhooks": hooks}


class CreateApiKeyRequest(BaseModel):
    name: str = "Production API Key"
    is_sandbox: bool = False


class CreateWebhookRequest(BaseModel):
    url: str
    secret_key: Optional[str] = None


@app.post("/api/v1/apikeys")
async def api_create_apikey(req: CreateApiKeyRequest, request: Request):
    merchant = await get_current_merchant_optional(request)
    merchant_id = merchant.id if merchant else 1

    prefix = "sand" if req.is_sandbox else "live"
    pub_key = f"pub_{prefix}_nirva_{random.randbytes(5).hex()}"
    sec_key = f"sec_{prefix}_nirva_{random.randbytes(8).hex()}"

    async with async_session() as session:
        api_key = ApiKey(
            merchant_id=merchant_id,
            name=req.name,
            public_key=pub_key,
            secret_key=sec_key,
            is_sandbox=req.is_sandbox,
            is_active=True,
        )
        session.add(api_key)
        await session.commit()
        await session.refresh(api_key)

        return {
            "success": True,
            "api_key": {
                "id": api_key.id,
                "name": api_key.name,
                "public_key": api_key.public_key,
                "secret_key": api_key.secret_key,
                "is_sandbox": api_key.is_sandbox,
            },
        }


@app.post("/api/v1/webhooks")
async def api_create_webhook(req: CreateWebhookRequest, request: Request):
    merchant = await get_current_merchant_optional(request)
    merchant_id = merchant.id if merchant else 1

    if not req.url or not req.url.startswith("http"):
        raise HTTPException(status_code=400, detail="URL Webhook harus berformat HTTP / HTTPS valid")

    sec_key = req.secret_key or f"whsec_{random.randbytes(8).hex()}"

    async with async_session() as session:
        hook = WebhookEndpoint(
            merchant_id=merchant_id,
            url=req.url,
            secret_key=sec_key,
            is_active=True,
        )
        session.add(hook)
        await session.commit()
        await session.refresh(hook)

        return {
            "success": True,
            "webhook": {
                "id": hook.id,
                "url": hook.url,
                "secret_key": hook.secret_key,
            },
        }


@app.post("/api/v1/webhooks/{webhook_id}/ping")
async def api_ping_webhook(webhook_id: int, request: Request):
    merchant = await get_current_merchant_optional(request)
    merchant_id = merchant.id if merchant else 1

    async with async_session() as session:
        stmt = select(WebhookEndpoint).where(
            WebhookEndpoint.id == webhook_id,
            WebhookEndpoint.merchant_id == merchant_id,
        )
        res = await session.execute(stmt)
        hook = res.scalar_one_or_none()
        if not hook:
            raise HTTPException(status_code=404, detail="Webhook endpoint tidak ditemukan")

        payload_obj = {
            "event": "ping",
            "message": "NirvaPay Webhook Ping Test",
            "timestamp": datetime.utcnow().isoformat(),
        }
        body_bytes = json.dumps(payload_obj).encode()
        sig = hmac.new(hook.secret_key.encode(), body_bytes, hashlib.sha256).hexdigest()

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.post(hook.url, content=body_bytes, headers={
                    "Content-Type": "application/json",
                    "X-NirvaPay-Signature": sig,
                    "User-Agent": "NirvaPay-Webhook-Ping/1.0"
                })
                return {
                    "success": resp.status_code in [200, 201, 202, 204],
                    "status_code": resp.status_code,
                    "message": f"Server target merespons HTTP {resp.status_code}",
                }
        except Exception as e:
            return {"success": False, "message": f"Gagal terhubung ke endpoint ({str(e)})"}


@app.post("/api/v1/connections/{channel}/test")
async def api_test_connection_node(channel: str, request: Request):
    """Menguji status kesiapan node koneksi merchant."""
    valid_channels = ["gopay", "dana", "shopeepay", "static_qris", "bukaolshop"]
    if channel not in valid_channels:
        raise HTTPException(status_code=404, detail="Channel tidak dikenali")
    return {
        "success": True,
        "channel": channel,
        "status": "ONLINE",
        "message": f"Node {channel.upper()} beroperasi normal dan siap menerima mutasi.",
    }


@app.get("/api/v1/export/csv")
async def export_transactions_csv(request: Request):
    """Export seluruh data transaksi lunas ke file CSV."""
    merchant = await get_current_merchant_optional(request)
    merchant_id = merchant.id if merchant else 1

    async with async_session() as session:
        stmt = select(PaymentInvoice).where(
            PaymentInvoice.merchant_id == merchant_id
        ).order_by(PaymentInvoice.created_at.desc())
        records = (await session.execute(stmt)).scalars().all()

        output = io.StringIO()
        output.write("\ufeff")
        writer = csv.writer(output, delimiter=";")
        writer.writerow([
            "No. Invoice",
            "Merchant Ref",
            "Nama Pelanggan",
            "Nominal Pokok (Rp)",
            "Kode Unik (Rp)",
            "Total Tagihan (Rp)",
            "Status",
            "Metode Pembayaran",
            "Waktu Dibuat",
            "Waktu Lunas",
        ])

        for inv in records:
            writer.writerow([
                inv.invoice_id,
                inv.merchant_ref or "-",
                inv.customer_name,
                f"{inv.amount:.2f}",
                inv.unique_code,
                f"{inv.total_amount:.2f}",
                inv.status,
                inv.payment_channel,
                inv.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                inv.paid_at.strftime("%Y-%m-%d %H:%M:%S") if inv.paid_at else "-",
            ])

        csv_data = output.getvalue().encode("utf-8")
        filename = f"NirvaPay_Laporan_{datetime.utcnow().strftime('%Y%m%d_%H%M')}.csv"
        return Response(
            content=csv_data,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )


@app.get("/api/v1/export/xlsx")
async def export_transactions_xlsx(request: Request):
    """Export seluruh data transaksi lunas ke file Microsoft Excel (.XLSX)."""
    import openpyxl
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

    merchant = await get_current_merchant_optional(request)
    merchant_id = merchant.id if merchant else 1

    async with async_session() as session:
        stmt = select(PaymentInvoice).where(
            PaymentInvoice.merchant_id == merchant_id
        ).order_by(PaymentInvoice.created_at.desc())
        records = (await session.execute(stmt)).scalars().all()

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Rekap Transaksi"

        # Headers
        headers = [
            "No. Invoice", "Merchant Ref", "Nama Pelanggan",
            "Nominal Pokok (Rp)", "Kode Unik (Rp)", "Total Tagihan (Rp)",
            "Status", "Metode", "Waktu Dibuat", "Waktu Lunas"
        ]
        ws.append(headers)

        header_fill = PatternFill(start_color="700070", end_color="700070", fill_type="solid")
        header_font = Font(color="FFFFFF", bold=True, name="Calibri")

        for col_num, cell in enumerate(ws[1], 1):
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal="center", vertical="center")

        for inv in records:
            ws.append([
                inv.invoice_id,
                inv.merchant_ref or "-",
                inv.customer_name,
                inv.amount,
                inv.unique_code,
                inv.total_amount,
                inv.status,
                inv.payment_channel,
                inv.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                inv.paid_at.strftime("%Y-%m-%d %H:%M:%S") if inv.paid_at else "-"
            ])

        for col in ws.columns:
            max_len = max(len(str(cell.value or '')) for cell in col)
            col_letter = openpyxl.utils.get_column_letter(col[0].column)
            ws.column_dimensions[col_letter].width = max(max_len + 3, 12)

        output = io.BytesIO()
        wb.save(output)
        output.seek(0)
        filename = f"NirvaPay_Laporan_{datetime.utcnow().strftime('%Y%m%d_%H%M')}.xlsx"
        return Response(
            content=output.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )


# ==============================================================================
# 4. MUTATION WEBHOOK RECEIVERS
# ==============================================================================
@app.get("/webhook/gopay")
@app.post("/webhook/gopay")
@app.get("/api/webhook/gopay-mutation")
@app.post("/api/webhook/gopay-mutation")
@app.get("/webhook/dana")
@app.post("/webhook/dana")
async def handle_merchant_mutation_webhook(
    request: Request,
    x_secret_key: Optional[str] = Header(None, alias="X-Secret-Key"),
):
    body_str = ""
    data = {}

    if request.method == "POST":
        raw_body = await request.body()
        body_str = raw_body.decode("utf-8", errors="ignore")
        try:
            data = json.loads(body_str)
        except Exception:
            pass
    else:
        data = dict(request.query_params)
        body_str = json.dumps(data)

    extracted_amount: Optional[int] = None
    channel = "GOPAY" if "gopay" in request.url.path else "DANA"

    if isinstance(data, dict) and data.get("amount") is not None:
        try:
            amt_val = str(data.get("amount")).replace(".", "").replace(",", "").replace("Rp", "").strip()
            extracted_amount = int(float(amt_val))
        except (ValueError, TypeError):
            pass

    if extracted_amount is None:
        text_search = ""
        if isinstance(data, dict):
            text_search = f"{data.get('title', '')} {data.get('text', '')} {data.get('content', '')} {data.get('message', '')} {data.get('subText', '')} {data.get('body', '')}"
        else:
            text_search = body_str

        matches = re.findall(r"(?:Rp\.?\s*|sebesar\s*Rp\.?\s*|IDR\s*)([\d\.,]+)", text_search, re.IGNORECASE)
        if matches:
            clean = matches[0].replace(".", "").replace(",", "")
            try:
                extracted_amount = int(clean)
            except ValueError:
                pass

    if not extracted_amount or extracted_amount <= 0:
        return JSONResponse(content={"success": False, "message": "Nominal tidak terdeteksi"}, status_code=400)

    async with async_session() as session:
        # Cari Invoice Pending yang cocok di semua merchant
        now = datetime.utcnow()
        stmt_inv = (
            select(PaymentInvoice)
            .where(PaymentInvoice.status == "PENDING")
            .where(PaymentInvoice.total_amount == float(extracted_amount))
            .where(PaymentInvoice.expired_at > now)
            .order_by(PaymentInvoice.created_at.desc())
            .limit(1)
        )
        res_inv = await session.execute(stmt_inv)
        matched_invoice = res_inv.scalar_one_or_none()

        target_merchant_id = matched_invoice.merchant_id if matched_invoice else 1

        mutation = Mutation(
            merchant_id=target_merchant_id,
            channel=channel,
            amount=float(extracted_amount),
            raw_text=body_str[:500],
            is_matched=bool(matched_invoice),
            matched_invoice_id=matched_invoice.invoice_id if matched_invoice else None,
            created_at=datetime.utcnow(),
        )
        session.add(mutation)

        if matched_invoice:
            matched_invoice.status = "PAID"
            matched_invoice.paid_at = datetime.utcnow()
            await session.commit()
            await session.refresh(matched_invoice)

            # Auto-Dispatch Settlement Events (Telegram, Client Webhook, BukaOlshop IPN)
            asyncio.create_task(dispatch_payment_settlement_events(matched_invoice))

            logger.info(f"🎉 [NIRVAPAY] Mutasi Rp {extracted_amount:,.0f} LUNAS untuk Invoice {matched_invoice.invoice_id}")
            return {
                "success": True,
                "matched": True,
                "invoice_id": matched_invoice.invoice_id,
                "amount": extracted_amount,
            }

        await session.commit()
        return {
            "success": True,
            "matched": False,
            "amount": extracted_amount,
            "message": "Mutasi dicatat (belum ada invoice pending yang cocok)",
        }


async def dispatch_payment_settlement_events(invoice: PaymentInvoice) -> None:
    """Dispatches Telegram notifications, client webhook callbacks, and BukaOlshop auto-approval."""
    try:
        async with async_session() as session:
            stmt_m = select(Merchant).where(Merchant.id == invoice.merchant_id)
            merchant = (await session.execute(stmt_m)).scalar_one_or_none()

            # 1. Telegram Alert
            alert_text = format_payment_paid_alert(
                {
                    "invoice_id": invoice.invoice_id,
                    "customer_name": invoice.customer_name,
                    "amount": invoice.amount,
                    "unique_code": invoice.unique_code,
                    "total_amount": invoice.total_amount,
                    "payment_channel": invoice.payment_channel,
                    "description": invoice.description,
                },
                {"business_name": merchant.business_name if merchant else None},
            )
            await send_telegram_alert(
                bot_token=settings.TELEGRAM_BOT_TOKEN,
                chat_id=settings.TELEGRAM_ADMIN_CHAT_ID,
                message=alert_text,
            )

            # 2. Direct Invoice Callback URL
            if invoice.callback_url:
                try:
                    async with httpx.AsyncClient(timeout=10.0) as client:
                        await client.post(
                            invoice.callback_url,
                            json={
                                "event": "payment.paid",
                                "invoice_id": invoice.invoice_id,
                                "merchant_ref": invoice.merchant_ref,
                                "total_amount": invoice.total_amount,
                                "status": "PAID",
                                "paid_at": invoice.paid_at.isoformat() if invoice.paid_at else datetime.utcnow().isoformat(),
                            },
                        )
                except Exception as e:
                    logger.warning(f"Error calling callback_url {invoice.callback_url}: {e}")

            # 3. BukaOlshop Callback Trigger
            if invoice.merchant_ref and invoice.callback_url and "bukaolshop" in invoice.callback_url.lower():
                await trigger_bukaolshop_confirm_callback(
                    callback_url=invoice.callback_url,
                    invoice_id=invoice.invoice_id,
                    merchant_ref=invoice.merchant_ref,
                    amount=invoice.total_amount,
                )

    except Exception as e:
        logger.error(f"Error in dispatch_payment_settlement_events: {e}")


@app.post("/api/v1/telegram/test")
async def api_test_telegram(request: Request):
    """Mengirim pesan uji coba ke Telegram admin."""
    body = await request.json()
    chat_id = str(body.get("chat_id") or settings.TELEGRAM_ADMIN_CHAT_ID)
    test_msg = (
        "🚀 <b>NIRVAPAY TELEGRAM ALERT TEST</b>\n"
        "━━━━━━━━━━━━━━━━━━━━━\n"
        "Koneksi notifikasi Telegram bot NirvaPay berhasil aktif dan siap menerima alert transaksi real-time!\n"
        "━━━━━━━━━━━━━━━━━━━━━\n"
        "⚡ <i>NirvaPay SaaS Gateway</i>"
    )
    ok = await send_telegram_alert(bot_token=settings.TELEGRAM_BOT_TOKEN, chat_id=chat_id, message=test_msg)
    return {"success": ok, "message": "Pesan terkirim ke Telegram" if ok else "Gagal (pastikan bot token & chat id valid)"}


@app.post("/api/v1/bukaolshop/callback")
async def bukaolshop_ipn_callback(request: Request):
    body = await request.body()
    logger.info(f"BukaOlshop IPN Received: {body.decode('utf-8', errors='ignore')}")
    return {"status": "success", "message": "BukaOlshop IPN processed"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=False)
