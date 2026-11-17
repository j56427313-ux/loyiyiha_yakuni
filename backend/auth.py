"""Autentifikatsiya: parol xeshlash, imzolangan token va foydalanuvchi tekshiruvi."""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import secrets
import time
from pathlib import Path

from .http_utils import ApiError

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
SECRET_FILE = DATA_DIR / "secret.key"
TOKEN_TTL = 7 * 24 * 3600  # 7 kun
PBKDF2_ITERATIONS = 260_000


def _secret() -> bytes:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not SECRET_FILE.exists():
        SECRET_FILE.write_text(secrets.token_hex(32), encoding="utf-8")
    return SECRET_FILE.read_text(encoding="utf-8").strip().encode("utf-8")


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        algo, iterations, salt_hex, hash_hex = stored.split("$")
        if algo != "pbkdf2_sha256":
            return False
        digest = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), bytes.fromhex(salt_hex), int(iterations)
        )
        return hmac.compare_digest(digest.hex(), hash_hex)
    except (ValueError, TypeError):
        return False


def make_token(user_id: int) -> str:
    payload = {"uid": user_id, "exp": int(time.time()) + TOKEN_TTL}
    raw = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    body = base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")
    signature = hmac.new(_secret(), body.encode("ascii"), hashlib.sha256).digest()
    sig = base64.urlsafe_b64encode(signature).decode("ascii").rstrip("=")
    return f"{body}.{sig}"


def decode_token(token: str) -> int | None:
    try:
        body, sig = token.split(".", 1)
        expected = hmac.new(_secret(), body.encode("ascii"), hashlib.sha256).digest()
        given = base64.urlsafe_b64decode(sig + "=" * (-len(sig) % 4))
        if not hmac.compare_digest(expected, given):
            return None
        padded = body + "=" * (-len(body) % 4)
        payload = json.loads(base64.urlsafe_b64decode(padded).decode("utf-8"))
        if int(payload.get("exp", 0)) < int(time.time()):
            return None
        return int(payload.get("uid"))
    except (ValueError, TypeError, KeyError):
        return None


def public_user(row) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "role": row["role"],
        "title": row["title"],
        "bio": row["bio"],
        "avatar_color": row["avatar_color"],
        "created_at": row["created_at"],
    }


def load_user(req) -> dict | None:
    token = req.cookies.get("token")
    if not token:
        return None
    user_id = decode_token(token)
    if not user_id:
        return None
    from .db import db

    with db() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return public_user(row) if row else None


def require_user(req, roles: tuple[str, ...] | None = None) -> dict:
    user = req.user
    if not user:
        raise ApiError(401, "Avval tizimga kiring")
    if roles and user["role"] not in roles:
        raise ApiError(403, "Bu amal uchun ruxsat yo'q")
    return user


def auth_cookie(user_id: int) -> str:
    from .http_utils import cookie_header

    return cookie_header("token", make_token(user_id), max_age=TOKEN_TTL)


def logout_cookie() -> str:
    from .http_utils import cookie_header

    return cookie_header("token", "", max_age=0) + "; Max-Age=0"
