"""BilimNova — onlayn o'quv kurslari platformasi. Server ishga tushirish nuqtasi."""
from __future__ import annotations

import mimetypes
import os
import sys
import traceback
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

from backend.db import init_db
from backend.http_utils import ApiError, Request, json_response
from backend.auth import load_user
from backend.routes import build_router

BASE_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = BASE_DIR / "public"
MAX_BODY = 2 * 1024 * 1024  # 2 MB

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROUTER = build_router()

SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
}


def parse_cookies(raw: str) -> dict[str, str]:
    cookies = {}
    for part in raw.split(";"):
        if "=" not in part:
            continue
        key, value = part.split("=", 1)
        cookies[key.strip()] = value.strip()
    return cookies


class AppHandler(BaseHTTPRequestHandler):
    server_version = "BilimNova/1.0"
    protocol_version = "HTTP/1.1"

    # -- Yordamchi ---------------------------------------------------------
    def send_payload(self, response: dict) -> None:
        headers = dict(SECURITY_HEADERS)
        headers.update(response["headers"])
        self.send_response(response["status"])
        for key, value in headers.items():
            self.send_header(key, value)
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(response["body"])

    def log_message(self, fmt, *args):
        return

    def read_body(self) -> bytes:
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            length = 0
        if length < 0 or length > MAX_BODY:
            raise ApiError(413, "So'rov hajmi juda katta")
        return self.rfile.read(length) if length else b""

    # -- Asosiy oqim -------------------------------------------------------
    def handle_all(self, method: str) -> None:
        split = urlsplit(self.path)
        path = split.path

        try:
            if path.startswith("/api"):
                self.handle_api(method, split)
            else:
                self.handle_static(method, path)
        except ApiError as exc:
            self.send_payload(json_response(
                {"error": exc.message, "field": exc.field}, status=exc.status
            ))
        except (BrokenPipeError, ConnectionResetError):
            return
        except Exception:
            traceback.print_exc()
            self.send_payload(json_response(
                {"error": "Serverda kutilmagan xatolik yuz berdi"}, status=500
            ))

    def handle_api(self, method: str, split) -> None:
        body = self.read_body()
        req = Request(
            method=method,
            path=split.path,
            query_string=split.query,
            headers={k.lower(): v for k, v in self.headers.items()},
            body=body,
            cookies=parse_cookies(self.headers.get("Cookie", "")),
            remote=self.client_address[0] if self.client_address else "",
        )
        req.user = load_user(req)
        handler, params = ROUTER.resolve(method, split.path)
        req.params = params
        result = handler(req, **params)
        self.send_payload(result)
        print(f"  {method:6} {split.path:42} {result['status']}")

    def handle_static(self, method: str, path: str) -> None:
        if method not in ("GET", "HEAD"):
            raise ApiError(405, "Metod qo'llab-quvvatlanmaydi")

        relative = path.lstrip("/") or "index.html"
        candidate = (PUBLIC_DIR / relative).resolve()
        try:
            candidate.relative_to(PUBLIC_DIR.resolve())
        except ValueError:
            raise ApiError(403, "Ruxsat yo'q")

        if candidate.is_dir():
            candidate = candidate / "index.html"

        if not candidate.exists():
            if "." not in Path(relative).name:
                candidate = PUBLIC_DIR / "index.html"
            else:
                raise ApiError(404, "Fayl topilmadi")

        content_type, _ = mimetypes.guess_type(str(candidate))
        if candidate.suffix == ".js":
            content_type = "text/javascript; charset=utf-8"
        elif candidate.suffix == ".css":
            content_type = "text/css; charset=utf-8"
        elif candidate.suffix in (".html", ".htm"):
            content_type = "text/html; charset=utf-8"
        elif candidate.suffix == ".svg":
            content_type = "image/svg+xml"
        content_type = content_type or "application/octet-stream"

        data = candidate.read_bytes()
        headers = {
            "Content-Type": content_type,
            "Content-Length": str(len(data)),
            "Cache-Control": "no-cache",
        }
        self.send_payload({"status": 200, "headers": headers, "body": data})

    # -- HTTP metodlari ----------------------------------------------------
    def do_GET(self):
        self.handle_all("GET")

    def do_HEAD(self):
        self.handle_all("HEAD")

    def do_POST(self):
        self.handle_all("POST")

    def do_PATCH(self):
        self.handle_all("PATCH")

    def do_PUT(self):
        self.handle_all("PUT")

    def do_DELETE(self):
        self.handle_all("DELETE")


def main() -> None:
    init_db()
    requested = int(os.environ.get("PORT", "8000"))
    httpd = None
    port = requested
    for candidate in range(requested, requested + 20):
        try:
            httpd = ThreadingHTTPServer(("0.0.0.0", candidate), AppHandler)
            port = candidate
            break
        except OSError:
            continue
    if httpd is None:
        print("Bo'sh port topilmadi. Iltimos, PORT muhit o'zgaruvchisini belgilang.")
        sys.exit(1)

    print("=" * 58)
    print("  BilimNova — onlayn o'quv kurslari platformasi")
    print(f"  Server:  http://localhost:{port}")
    print(f"  Admin:   admin@bilimnova.uz / Admin123!")
    print(f"  O'quvchi: student@bilimnova.uz / Student123!")
    print("  To'xtatish uchun Ctrl+C bosing")
    print("=" * 58)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer to'xtatildi.")
    finally:
        httpd.server_close()


if __name__ == "__main__":
    main()
