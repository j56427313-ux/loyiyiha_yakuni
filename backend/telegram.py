"""Telegram xabar yuborish funksiyalari"""
import os
import requests
from typing import Optional

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
ADMIN_CHAT_ID = os.getenv("TELEGRAM_ADMIN_CHAT_ID")

TELEGRAM_API = "https://api.telegram.org/bot"


def _post(method: str, data: dict) -> bool:
    """Telegram API ga so'rov yuborish"""
    if not BOT_TOKEN:
        return False
    try:
        url = f"{TELEGRAM_API}{BOT_TOKEN}/{method}"
        r = requests.post(url, json=data, timeout=10)
        return r.ok
    except Exception:
        return False


def send_message(text: str, chat_id: Optional[str] = None, parse_mode: str = "HTML") -> bool:
    """Oddiy xabar yuborish"""
    target = chat_id or ADMIN_CHAT_ID
    if not target:
        return False
    return _post("sendMessage", {
        "chat_id": target,
        "text": text,
        "parse_mode": parse_mode,
        "disable_web_page_preview": True
    })


# ===================== MAXSUS XABAR TURLARI =====================

def notify_new_enrollment(user_name: str, course_title: str, course_id: int = None) -> bool:
    """Yangi kursga yozilish haqida xabar"""
    lines = [
        "🎓 <b>Yangi yozilish!</b>",
        f"👤 <b>O'quvchi:</b> {user_name}",
        f"📚 <b>Kurs:</b> {course_title}",
    ]
    if course_id:
        lines.append(f"🔗 <b>Kurs ID:</b> {course_id}")
    return send_message("\n".join(lines))


def notify_new_course(title: str, instructor_name: str = None, course_id: int = None) -> bool:
    """Yangi kurs e'lon qilinishi haqida xabar"""
    lines = [
        "🆕 <b>Yangi kurs e'lon qilindi!</b>",
        f"📖 <b>Nomi:</b> {title}",
    ]
    if instructor_name:
        lines.append(f"👨‍🏫 <b>Mentor:</b> {instructor_name}")
    if course_id:
        lines.append(f"🆔 <b>ID:</b> {course_id}")
    return send_message("\n".join(lines))


def notify_course_published(title: str, course_id: int = None) -> bool:
    """Kurs nashr qilinishi (published) haqida xabar"""
    lines = [
        "✅ <b>Kurs nashr qilindi (e'lon qilindi)</b>",
        f"📖 {title}",
    ]
    if course_id:
        lines.append(f"🆔 ID: {course_id}")
    return send_message("\n".join(lines))


def notify_course_unpublished(title: str, course_id: int = None) -> bool:
    """Kurs qoralamaga o'tkazilishi haqida xabar"""
    lines = [
        "📝 <b>Kurs qoralamaga o'tkazildi</b>",
        f"📖 {title}",
    ]
    if course_id:
        lines.append(f"🆔 ID: {course_id}")
    return send_message("\n".join(lines))


def notify_new_review(course_title: str, rating: int, user_name: str, comment: str, course_id: int = None) -> bool:
    """Yangi sharh qoldirilishi haqida xabar"""
    stars = "⭐" * rating
    short_comment = comment[:300] + ("..." if len(comment) > 300 else "")
    lines = [
        "💬 <b>Yangi sharh!</b>",
        f"📚 <b>Kurs:</b> {course_title}",
        f"{stars} <b>({rating}/5)</b>",
        f"👤 <b>O'quvchi:</b> {user_name}",
        f"💭 <b>Sharh:</b> {short_comment}",
    ]
    if course_id:
        lines.append(f"🆔 <b>Kurs ID:</b> {course_id}")
    return send_message("\n".join(lines))


def notify_lesson_added(course_title: str, lesson_title: str, course_id: int = None) -> bool:
    """Yangi dars qo'shilishi haqida xabar"""
    lines = [
        "📝 <b>Yangi dars qo'shildi</b>",
        f"📚 <b>Kurs:</b> {course_title}",
        f"📖 <b>Dars:</b> {lesson_title}",
    ]
    if course_id:
        lines.append(f"🆔 <b>Kurs ID:</b> {course_id}")
    return send_message("\n".join(lines))


def notify_new_user(name: str, email: str, role: str) -> bool:
    """Yangi foydalanuvchi ro'yxatdan o'tishi haqida xabar (faqat admin/instructor uchun)"""
    role_label = {"admin": "👑 Administrator", "instructor": "👨‍🏫 O'qituvchi", "student": "🎓 O'quvchi"}.get(role, role)
    lines = [
        "👤 <b>Yangi foydalanuvchi ro'yxatdan o'tdi</b>",
        f"📛 <b>Ism:</b> {name}",
        f"📧 <b>Email:</b> {email}",
        f"🏷 <b>Rol:</b> {role_label}",
    ]
    return send_message("\n".join(lines))


def notify_error(error_text: str, context: str = "") -> bool:
    """Xatolik yuz berganda adminiga xabar"""
    lines = [
        "🚨 <b>XATOLIK YUZ BERDI</b>",
        "📍 <b>Kontext:</b> " + (context or "Noma'lum"),
        f"❌ <b>Xato:</b> {error_text[:500]}",
    ]
    return send_message("\n".join(lines))


# ===================== TEST UCHUN =====================

def test_connection() -> bool:
    """Bot token va chat ID to'g'riligini tekshirish"""
    if not BOT_TOKEN or not ADMIN_CHAT_ID:
        return False
    return send_message("🤖 <b>BilimNova bot ulandi!</b>\nTest xabari muvaffaqiyatli yuborildi.")