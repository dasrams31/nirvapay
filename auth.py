import hashlib
import hmac
import json
import time
import base64
from typing import Optional
from config import settings


def hash_password(password: str) -> str:
    """Hashes a password using PBKDF2-HMAC-SHA256 with a unique salt."""
    salt = hashlib.sha256(str(time.time()).encode()).hexdigest()[:16]
    pw_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000).hex()
    return f"pbkdf2:sha256:100000${salt}${pw_hash}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Constant-time password verification."""
    try:
        parts = hashed_password.split("$")
        if len(parts) != 3:
            return False
        salt, stored_hash = parts[1], parts[2]
        calc_hash = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), 100_000).hex()
        return hmac.compare_digest(stored_hash, calc_hash)
    except Exception:
        return False


def create_jwt_token(payload: dict, expires_in_seconds: int = 86400 * 7) -> str:
    """Generates a secure HMAC-SHA256 signed session token."""
    header = {"alg": "HS256", "typ": "JWT"}
    body = {**payload, "exp": int(time.time()) + expires_in_seconds}
    
    hdr_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    body_b64 = base64.urlsafe_b64encode(json.dumps(body).encode()).decode().rstrip("=")
    signature_data = f"{hdr_b64}.{body_b64}"
    
    sig = hmac.new(settings.SECRET_KEY.encode(), signature_data.encode(), hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(sig).decode().rstrip("=")
    return f"{hdr_b64}.{body_b64}.{sig_b64}"


def decode_jwt_token(token: str) -> Optional[dict]:
    """Decodes and validates HMAC-SHA256 session token."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        hdr_b64, body_b64, sig_b64 = parts
        
        # Verify Signature
        signature_data = f"{hdr_b64}.{body_b64}"
        expected_sig = hmac.new(settings.SECRET_KEY.encode(), signature_data.encode(), hashlib.sha256).digest()
        actual_sig = base64.urlsafe_b64decode(sig_b64 + "=" * (-len(sig_b64) % 4))
        
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
            
        body_json = base64.urlsafe_b64decode(body_b64 + "=" * (-len(body_b64) % 4)).decode()
        payload = json.loads(body_json)
        
        # Check Expiry
        if payload.get("exp", 0) < time.time():
            return None
            
        return payload
    except Exception:
        return None
