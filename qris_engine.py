import io
import random
from typing import Optional
import qrcode
from config import settings


def crc16_ccitt(data: str) -> str:
    """Calculates CRC16-CCITT checksum (Poly 0x1021, Init 0xFFFF)."""
    crc = 0xFFFF
    for ch in data:
        crc ^= ord(ch) << 8
        for _ in range(8):
            if crc & 0x8000:
                crc = ((crc << 1) ^ 0x1021) & 0xFFFF
            else:
                crc = (crc << 1) & 0xFFFF
    return f"{crc:04X}"


def generate_dynamic_qris(amount: int, static_qris: Optional[str] = None) -> str:
    """
    Transforms static EMVCo QRIS into dynamic QRIS with injected amount tag 54.
    """
    raw = (static_qris or settings.DEFAULT_STATIC_QRIS).strip()

    # Strip existing tag 63
    if len(raw) > 8 and raw[-8:-4] == "6304":
        base = raw[:-8]
    else:
        base = raw

    # Change tag 01 from static (11) to dynamic (12)
    if base.startswith("000201010211"):
        base = "000201010212" + base[12:]

    # Inject tag 54
    amt_str = str(int(amount))
    tag54 = f"54{len(amt_str):02d}{amt_str}"

    pos_58 = base.find("5802")
    if pos_58 != -1:
        dynamic_payload = base[:pos_58] + tag54 + base[pos_58:]
    else:
        dynamic_payload = base + tag54

    # Sign CRC16
    to_sign = dynamic_payload + "6304"
    crc = crc16_ccitt(to_sign)
    return to_sign + crc


def generate_qr_png_bytes(payload: str) -> bytes:
    """Generates PNG image bytes for QR Code."""
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
    )
    qr.add_data(payload)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()
