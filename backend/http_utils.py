"""Kichik yordamchi HTTP qatlami: so'rov, javob va router."""
from __future__ import annotations

import json
import re
from urllib.parse import parse_qs


class ApiError(Exception):
    """API darajasidagi xatolik (foydalanuvchiga ko'rsatiladi)."""

    def __init__(self, status: int = 400, message: str = "Xatolik yuz berdi", field: str | None = None):
        super().__init__(message)
        self.status = status
        self.message = message
        self.field = field


class Request:
    def __init__(self, method: str, path: str, query_string: str, headers: dict, body: bytes,
                 cookies: dict, remote: str):
        self.method = method
        self.path = path
        self.headers = headers
        self.body = body
        self.cookies = cookies
        self.remote = remote
        self.query = {k: v[-1] for k, v in parse_qs(query_string, keep_blank_values=True).items()}
        self.params: dict[str, str] = {}
        self.user: dict | None = None
        self._json = None

    def json(self) -> dict:
        if self._json is None:
            if not self.body:
                raise ApiError(400, "So'rovda ma'lumot yo'q")
            try:
                data = json.loads(self.body.decode("utf-8"))
            except (ValueError, UnicodeDecodeError):
                raise ApiError(400, "JSON noto'g'ri formatda")
            if not isinstance(data, dict):
                raise ApiError(400, "JSON obyekt bo'lishi kerak")
            self._json = data
        return self._json

    def get(self, key: str, default: str | None = None) -> str | None:
        return self.query.get(key, default)

    def get_int(self, key: str, default: int | None = None) -> int | None:
        raw = self.query.get(key)
        if raw is None or raw == "":
            return default
        try:
            return int(raw)
        except ValueError:
            return default


class Router:
    def __init__(self):
        self.routes: list[tuple[str, re.Pattern, callable]] = []

    def add(self, method: str, pattern: str, handler):
        self.routes.append((method, re.compile("^" + pattern + "$"), handler))

    def get(self, pattern, handler):
        self.add("GET", pattern, handler)

    def post(self, pattern, handler):
        self.add("POST", pattern, handler)

    def patch(self, pattern, handler):
        self.add("PATCH", pattern, handler)

    def put(self, pattern, handler):
        self.add("PUT", pattern, handler)

    def delete(self, pattern, handler):
        self.add("DELETE", pattern, handler)

    def resolve(self, method: str, path: str):
        path = path.rstrip("/") or "/"
        allowed = set()
        for m, regex, handler in self.routes:
            match = regex.match(path)
            if match:
                if m == method:
                    return handler, match.groupdict()
                allowed.add(m)
        if allowed:
            raise ApiError(405, f"Bu manzil uchun {method} metodi qo'llab-quvvatlanmaydi")
        raise ApiError(404, "So'ralgan manzil topilmadi")


def json_response(payload, status: int = 200, headers: dict | None = None) -> dict:
    body = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    hdrs = {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": str(len(body)),
        "Cache-Control": "no-store",
    }
    if headers:
        hdrs.update(headers)
    return {"status": status, "headers": hdrs, "body": body}


def cookie_header(name: str, value: str, max_age: int = 0) -> str:
    parts = [f"{name}={value}", "Path=/", "HttpOnly", "SameSite=Lax"]
    if max_age:
        parts.append(f"Max-Age={max_age}")
    return "; ".join(parts)
