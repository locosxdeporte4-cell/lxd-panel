import os
import json
import hmac
import base64
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple

COOKIE_NAME = "lpd_session"

def _get_secret() -> bytes:
    secret = os.getenv("LPD_SESSION_SECRET", "")
    if not secret:
        raise ValueError("Missing LPD_SESSION_SECRET")
    return secret.encode("utf-8")

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")

def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)

def create_session_token(username: str) -> str:
    hours = int(os.getenv("LPD_SESSION_HOURS", "12"))
    expires_at = datetime.now(timezone.utc) + timedelta(hours=hours)

    payload = {
        "sub": username,
        "exp": int(expires_at.timestamp())
    }

    payload_bytes = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    payload_b64 = _b64url_encode(payload_bytes)

    signature = hmac.new(
        _get_secret(),
        payload_b64.encode("utf-8"),
        hashlib.sha256
    ).digest()

    signature_b64 = _b64url_encode(signature)
    return f"{payload_b64}.{signature_b64}"

def verify_session_token(token: str) -> Tuple[bool, Optional[dict]]:
    try:
        payload_b64, signature_b64 = token.split(".", 1)

        expected_sig = hmac.new(
            _get_secret(),
            payload_b64.encode("utf-8"),
            hashlib.sha256
        ).digest()

        actual_sig = _b64url_decode(signature_b64)

        if not hmac.compare_digest(expected_sig, actual_sig):
            return False, None

        payload = json.loads(_b64url_decode(payload_b64).decode("utf-8"))

        exp = payload.get("exp")
        if not exp or int(exp) < int(datetime.now(timezone.utc).timestamp()):
            return False, None

        return True, payload

    except Exception:
        return False, None

def parse_cookies(cookie_header: str) -> dict:
    cookies = {}
    if not cookie_header:
        return cookies

    parts = cookie_header.split(";")
    for part in parts:
        if "=" in part:
            k, v = part.strip().split("=", 1)
            cookies[k] = v
    return cookies

def get_session_from_headers(headers: dict) -> Tuple[bool, Optional[dict]]:
    cookie_header = headers.get("cookie") or headers.get("Cookie") or ""
    cookies = parse_cookies(cookie_header)
    token = cookies.get(COOKIE_NAME)
    if not token:
        return False, None
    return verify_session_token(token)

ddef build_set_cookie_header(token: str, max_age: int = 60 * 60 * 12) -> str:
    return (
        f"lpd_session={token}; "
        f"Path=/; "
        f"Max-Age={max_age}; "
        f"HttpOnly; "
        f"Secure; "
        f"SameSite=Lax"
    )

def build_clear_cookie_header() -> str:
    env_name = os.getenv("AZURE_FUNCTIONS_ENVIRONMENT", "").lower()
    is_local = env_name == "development"

    if is_local:
        return (
            f"{COOKIE_NAME}=; "
            f"Path=/; Max-Age=0; HttpOnly; SameSite=Lax"
        )

    return (
        f"{COOKIE_NAME}=; "
        f"Path=/; Max-Age=0; HttpOnly; Secure; SameSite=None"
    )

def build_clear_cookie_header() -> str:
    env_name = os.getenv("AZURE_FUNCTIONS_ENVIRONMENT", "").lower()
    is_local = env_name == "development"

    secure_part = "" if is_local else "Secure; "

    return (
        f"{COOKIE_NAME}=; "
        f"Path=/; Max-Age=0; HttpOnly; {secure_part}SameSite=Lax"
    )