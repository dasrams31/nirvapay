import hashlib
import hmac
import logging
from typing import Any, Dict, Optional
import httpx

logger = logging.getLogger("bukaolshop_engine")


def verify_bukaolshop_auth(received_token: Optional[str], configured_secret: str) -> bool:
    """Verifies BukaOlshop callback secret in constant time."""
    if not configured_secret:
        return True
    if not received_token:
        return False
    return hmac.compare_digest(received_token.strip(), configured_secret.strip())


async def trigger_bukaolshop_confirm_callback(
    callback_url: str,
    invoice_id: str,
    merchant_ref: str,
    amount: float,
    secret_key: Optional[str] = None,
) -> bool:
    """
    Sends IPN settlement confirmation back to BukaOlshop store backend.
    """
    if not callback_url or not callback_url.startswith("http"):
        return False

    payload = {
        "status": "PAID",
        "invoice_id": invoice_id,
        "merchant_order_id": merchant_ref,
        "amount": amount,
        "action": "PAYMENT_CONFIRMED",
    }

    headers = {"Content-Type": "application/json"}
    if secret_key:
        signature = hmac.new(
            secret_key.encode(),
            f"{invoice_id}|{amount}|PAID".encode(),
            hashlib.sha256,
        ).hexdigest()
        headers["X-BukaOlshop-Signature"] = signature

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post(callback_url, json=payload, headers=headers)
            if res.status_code in [200, 201]:
                logger.info(f"BukaOlshop callback successfully delivered to {callback_url}")
                return True
            else:
                logger.warning(f"BukaOlshop callback returned status {res.status_code}: {res.text}")
                return False
    except Exception as e:
        logger.warning(f"Error delivering BukaOlshop callback: {e}")
        return False
