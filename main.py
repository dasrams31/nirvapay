import csv
from datetime import datetime, timedelta
import io
import json
import logging
import os
import random
import re
from typing import Optional

from fastapi import FastAPI, Header, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from sqlalchemy import func, select

from config import settings
from database import async_session, init_db
from models import ApiKey, MerchantConnection, Mutation, PaymentInvoice, WebhookEndpoint, WebhookLog
from qris_engine import generate_dynamic_qris, generate_qr_png_bytes

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nirvapay")

app = FastAPI(
    title="NirvaPay Gateway API",
    description="Multi-Channel Merchant QRIS Payment Gateway & Aggregator SaaS",
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

# Mount Static Files
base_dir = os.path.dirname(os.path.abspath(__file__))
app.mount("/static", StaticFiles(directory=os.path.join(base_dir, "static")), name="static")

# Templates
templates = Jinja2Templates(directory=os.path.join(base_dir, "templates"))


@app.on_event("startup")
async def on_startup():
    await init_db()
    logger.info(f"NirvaPay Gateway server running on port {settings.PORT}")


# ==============================================================================
# 1. FRONTEND WEB PAGES
# ==============================================================================
@app.get("/", response_class=HTMLResponse)
async def page_landing(request: Request):
    """Halaman Landing Page Publik NirvaPay."""
    return templates.TemplateResponse(request=request, name="landing.html", context={"settings": settings})


@app.get("/dashboard", response_class=HTMLResponse)
async def page_dashboard(request: Request):
    """Console Dashboard Merchant (11 Modul)."""
    return templates.TemplateResponse(request=request, name="dashboard.html", context={"settings": settings})


@app.get("/pay/{invoice_id}", response_class=HTMLResponse)
async def page_checkout(request: Request, invoice_id: str):
    """Halaman Checkout Pembayaran Pelanggan."""
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
    """Menghasilkan gambar PNG QR Code untuk invoice terkait."""
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
    """Polling status pembayaran invoice (PENDING/PAID)."""
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
# 2. DASHBOARD JSON APIs
# ==============================================================================
@app.get("/api/v1/dashboard/summary")
async def api_dashboard_summary():
    """Metrik agregasi ringkasan omset dan performa transaksi."""
    async with async_session() as session:
        now = datetime.utcnow()
        start_of_today = datetime(now.year, now.month, now.day)
        start_of_month = datetime(now.year, now.month, 1)

        # Omset Hari Ini
        stmt_today = select(func.sum(PaymentInvoice.total_amount)).where(
            PaymentInvoice.status == "PAID",
            PaymentInvoice.paid_at >= start_of_today,
        )
        omset_today = (await session.execute(stmt_today)).scalar() or 0.0

        # Omset Bulan Ini
        stmt_month = select(func.sum(PaymentInvoice.total_amount)).where(
            PaymentInvoice.status == "PAID",
            PaymentInvoice.paid_at >= start_of_month,
        )
        omset_month = (await session.execute(stmt_month)).scalar() or 0.0

        # Count Paid & Pending
        stmt_paid_count = select(func.count(PaymentInvoice.id)).where(PaymentInvoice.status == "PAID")
        total_paid_count = (await session.execute(stmt_paid_count)).scalar() or 0

        stmt_pending_count = select(func.count(PaymentInvoice.id)).where(
            PaymentInvoice.status == "PENDING",
            PaymentInvoice.expired_at > now,
        )
        pending_count = (await session.execute(stmt_pending_count)).scalar() or 0

        total_all = total_paid_count + pending_count
        success_rate = round((total_paid_count / total_all * 100), 1) if total_all > 0 else 100.0

        # Recent Invoices
        stmt_recent = select(PaymentInvoice).order_by(PaymentInvoice.created_at.desc()).limit(10)
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
async def api_get_invoices(limit: int = 50):
    async with async_session() as session:
        stmt = select(PaymentInvoice).order_by(PaymentInvoice.created_at.desc()).limit(limit)
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
async def api_create_invoice(req: InvoiceCreateRequest):
    """Membuat invoice pembayaran baru dengan QRIS Dinamis & Kode Unik Anti-Collision."""
    if req.amount < 1000:
        raise HTTPException(status_code=400, detail="Minimal pembayaran Rp 1.000")

    async with async_session() as session:
        # Ambil daftar nominal pending aktif untuk mencegah tabrakan kode unik
        stmt_pending = select(PaymentInvoice.total_amount).where(
            PaymentInvoice.status == "PENDING",
            PaymentInvoice.expired_at > datetime.utcnow(),
        )
        res_pending = await session.execute(stmt_pending)
        pending_amounts = set(res_pending.scalars().all())

        # Generate unique code 1 - 499
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

        # Generate Dynamic QRIS payload
        dynamic_qris = generate_dynamic_qris(amount=total_amount)

        invoice = PaymentInvoice(
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
async def api_get_mutations(limit: int = 50):
    async with async_session() as session:
        stmt = select(Mutation).order_by(Mutation.created_at.desc()).limit(limit)
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
async def api_get_connections():
    async with async_session() as session:
        stmt = select(MerchantConnection).order_by(MerchantConnection.id.asc())
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
async def api_get_apikeys():
    async with async_session() as session:
        stmt = select(ApiKey).order_by(ApiKey.id.asc())
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
async def api_get_webhooks():
    async with async_session() as session:
        stmt = select(WebhookEndpoint).order_by(WebhookEndpoint.id.asc())
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


@app.get("/api/v1/export/csv")
async def export_transactions_csv():
    """Export seluruh data transaksi lunas ke file CSV."""
    async with async_session() as session:
        stmt = select(PaymentInvoice).order_by(PaymentInvoice.created_at.desc())
        res = await session.execute(stmt)
        records = res.scalars().all()

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


# ==============================================================================
# 3. WEBHOOK RECEIVERS (GOPAY, DANA, BUKAOLSHOP)
# ==============================================================================
@app.post("/webhook/gopay")
@app.post("/api/webhook/gopay-mutation")
@app.post("/webhook/dana")
async def handle_merchant_mutation_webhook(
    request: Request,
    x_secret_key: Optional[str] = Header(None, alias="X-Secret-Key"),
):
    """
    Menerima webhook mutasi masuk dari GoPay / DANA / MacroDroid.
    Melakukan pencocokan otomatis ke invoice PENDING berdasarkan nominal persis.
    """
    raw_body = await request.body()
    body_str = raw_body.decode("utf-8", errors="ignore")

    data = {}
    try:
        data = json.loads(body_str)
    except Exception:
        pass

    extracted_amount: Optional[int] = None
    channel = "GOPAY" if "gopay" in request.url.path else "DANA"

    # 1. Coba ambil dari field amount
    if isinstance(data, dict) and data.get("amount") is not None:
        try:
            amt_val = str(data.get("amount")).replace(".", "").replace(",", "").replace("Rp", "").strip()
            extracted_amount = int(float(amt_val))
        except (ValueError, TypeError):
            pass

    # 2. Coba parse regex dari teks notifikasi
    if extracted_amount is None:
        text_search = f"{data.get('title', '')} {data.get('text', '')} {data.get('message', '')}" if isinstance(data, dict) else body_str
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
        # Rekam Log Mutasi
        mutation = Mutation(
            channel=channel,
            amount=float(extracted_amount),
            raw_text=body_str[:500],
            is_matched=False,
            created_at=datetime.utcnow(),
        )
        session.add(mutation)

        # Cari Invoice Pending yang cocok
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

        if matched_invoice:
            matched_invoice.status = "PAID"
            matched_invoice.paid_at = datetime.utcnow()
            mutation.is_matched = True
            mutation.matched_invoice_id = matched_invoice.invoice_id
            await session.commit()

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


@app.post("/api/v1/bukaolshop/callback")
async def bukaolshop_ipn_callback(request: Request):
    """Callback IPN khusus BukaOlshop."""
    body = await request.body()
    logger.info(f"BukaOlshop IPN Received: {body.decode('utf-8', errors='ignore')}")
    return {"status": "success", "message": "BukaOlshop IPN processed"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=False)
