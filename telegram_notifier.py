import asyncio
import logging
from typing import Optional
import httpx
from config import settings

logger = logging.getLogger("telegram_notifier")


async def send_telegram_alert(
    bot_token: Optional[str],
    chat_id: Optional[str],
    message: str,
    parse_mode: str = "HTML",
) -> bool:
    """
    Sends an instant notification message to a Telegram user or channel via Telegram Bot API.
    """
    token = bot_token or getattr(settings, "TELEGRAM_BOT_TOKEN", None)
    target_chat = chat_id or getattr(settings, "TELEGRAM_ADMIN_CHAT_ID", None)

    if not token or not target_chat:
        return False

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": target_chat,
        "text": message,
        "parse_mode": parse_mode,
        "disable_web_page_preview": True,
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.post(url, json=payload)
            if res.status_code == 200:
                logger.info(f"Telegram alert successfully sent to chat_id: {target_chat}")
                return True
            else:
                logger.warning(f"Telegram alert failed ({res.status_code}): {res.text}")
                return False
    except Exception as e:
        logger.warning(f"Error sending telegram alert: {e}")
        return False


def format_payment_paid_alert(invoice_data: dict, merchant_data: Optional[dict] = None) -> str:
    """
    Formats transaction settlement notification for Telegram.
    """
    biz_name = (merchant_data.get("business_name") if merchant_data else None) or "NirvaPay Merchant"
    inv_id = invoice_data.get("invoice_id", "-")
    cust_name = invoice_data.get("customer_name", "Pelanggan")
    amount = invoice_data.get("amount", 0.0)
    unique_code = invoice_data.get("unique_code", 0)
    total_amount = invoice_data.get("total_amount", 0.0)
    channel = invoice_data.get("payment_channel", "QRIS")
    desc = invoice_data.get("description", "-")

    fmt_total = f"Rp {total_amount:,.0f}".replace(",", ".")
    fmt_amount = f"Rp {amount:,.0f}".replace(",", ".")

    text = (
        f"💰 <b>PEMBAYARAN QRIS MASUK!</b>\n"
        f"━━━━━━━━━━━━━━━━━━━━━\n"
        f"🏪 <b>Merchant:</b> {biz_name}\n"
        f"🆔 <b>No. Invoice:</b> <code>#{inv_id}</code>\n"
        f"👤 <b>Pelanggan:</b> {cust_name}\n"
        f"💵 <b>Total Lunas:</b> <code>{fmt_total}</code>\n"
        f"📊 <b>Rincian:</b> {fmt_amount} + Kode Unik {unique_code}\n"
        f"⚡ <b>Metode:</b> {channel}\n"
        f"📝 <b>Catatan:</b> {desc}\n"
        f"━━━━━━━━━━━━━━━━━━━━━\n"
        f"✅ <i>Status: PAID (Lunas Otomatis)</i>\n"
        f"🌐 <i>NirvaPay Gateway Engine</i>"
    )
    return text
