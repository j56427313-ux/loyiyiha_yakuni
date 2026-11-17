"""Barcha API endpointlar va biznes-logika."""
from __future__ import annotations

import json
import math
import re
import sqlite3
from datetime import datetime, timedelta

from .auth import (auth_cookie, hash_password, load_user, logout_cookie,
                   public_user, require_user, verify_password)
from .db import db
from .http_utils import ApiError, Router, json_response
from .telegram import (
    notify_new_enrollment, notify_new_course, notify_course_published,
    notify_course_unpublished, notify_new_review, notify_lesson_added,
    notify_new_user, notify_error,
)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

COURSE_SELECT = """
SELECT c.*,
       cat.name  AS category_name,
       cat.slug  AS category_slug,
       cat.icon  AS category_icon,
       cat.color AS category_color,
       u.name         AS instructor_name,
       u.title        AS instructor_title,
       u.bio          AS instructor_bio,
       u.avatar_color AS instructor_color,
       (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) AS lessons_count,
       (SELECT COALESCE(SUM(l.duration), 0) FROM lessons l WHERE l.course_id = c.id) AS total_minutes,
       (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS enrolled_count,
       (SELECT COALESCE(ROUND(AVG(r.rating), 1), 0) FROM reviews r WHERE r.course_id = c.id) AS rating,
       (SELECT COUNT(*) FROM reviews r WHERE r.course_id = c.id) AS reviews_count
FROM courses c
JOIN categories cat ON cat.id = c.category_id
JOIN users u ON u.id = c.instructor_id
"""


# --------------------------------------------------------------------------- #
# Yordamchi funksiyalar
# --------------------------------------------------------------------------- #
def course_dict(row) -> dict:
    try:
        outcomes = json.loads(row["outcomes"] or "[]")
    except (ValueError, TypeError):
        outcomes = []
    return {
        "id": row["id"],
        "title": row["title"],
        "slug": row["slug"],
        "summary": row["summary"],
        "description": row["description"],
        "outcomes": outcomes,
        "level": row["level"],
        "price": row["price"],
        "old_price": row["old_price"],
        "icon": row["icon"],
        "accent": row["accent"],
        "lessons_count": row["lessons_count"],
        "duration_minutes": row["total_minutes"],
        "students_count": row["enrolled_count"] + row["base_students"],
        "rating": float(row["rating"] or 0),
        "reviews_count": row["reviews_count"],
        "is_featured": bool(row["is_featured"]),
        "is_published": bool(row["is_published"]),
        "created_at": row["created_at"],
        "category": {
            "id": row["category_id"],
            "name": row["category_name"],
            "slug": row["category_slug"],
            "icon": row["category_icon"],
            "color": row["category_color"],
        },
        "instructor": {
            "id": row["instructor_id"],
            "name": row["instructor_name"],
            "title": row["instructor_title"],
            "bio": row["instructor_bio"],
            "avatar_color": row["instructor_color"],
        },
    }


def lesson_public(row, unlocked: bool) -> dict:
    access = unlocked or bool(row["is_preview"])
    data = {
        "id": row["id"],
        "title": row["title"],
        "duration": row["duration"],
        "position": row["position"],
        "is_preview": bool(row["is_preview"]),
        "unlocked": access,
    }
    if access:
        data["content"] = row["content"]
        data["video_url"] = row["video_url"]
    return data


def parse_int(value, field: str, minimum: int = 0, maximum: int = 10**9) -> int:
    try:
        number = int(float(value))
    except (TypeError, ValueError):
        raise ApiError(400, f"{field} raqam bo'lishi kerak", field)
    if number < minimum or number > maximum:
        raise ApiError(400, f"{field} {minimum} va {maximum} oralig'ida bo'lishi kerak", field)
    return number


def clean_text(data: dict, key: str, label: str, required: bool = True, max_len: int = 5000) -> str:
    value = data.get(key)
    if value is None:
        if required:
            raise ApiError(400, f"{label} kiritilishi shart", key)
        return ""
    if not isinstance(value, str):
        raise ApiError(400, f"{label} matn bo'lishi kerak", key)
    value = value.strip()
    if required and not value:
        raise ApiError(400, f"{label} kiritilishi shart", key)
    if len(value) > max_len:
        raise ApiError(400, f"{label} juda uzun (maksimal {max_len} belgi)", key)
    return value


def slugify(text: str) -> str:
    text = text.lower()
    for char in ("'", "ʻ", "’", "`"):
        text = text.replace(char, "")
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-") or "kurs"


def unique_slug(conn, base: str, exclude_id: int | None = None) -> str:
    slug = base
    counter = 2
    while True:
        row = conn.execute("SELECT id FROM courses WHERE slug = ?", (slug,)).fetchone()
        if not row or (exclude_id and row["id"] == exclude_id):
            return slug
        slug = f"{base}-{counter}"
        counter += 1


def get_course_row(conn, course_id: int):
    row = conn.execute(COURSE_SELECT + " WHERE c.id = ?", (course_id,)).fetchone()
    if not row:
        raise ApiError(404, "Kurs topilmadi")
    return row


def get_enrollment(conn, user_id: int, course_id: int):
    return conn.execute(
        "SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?", (user_id, course_id)
    ).fetchone()


def progress_for(conn, user_id: int, course_id: int) -> dict:
    total = conn.execute(
        "SELECT COUNT(*) AS c FROM lessons WHERE course_id = ?", (course_id,)
    ).fetchone()["c"]
    completed = conn.execute(
        "SELECT COUNT(*) AS c FROM lesson_completions WHERE user_id = ? AND course_id = ?",
        (user_id, course_id),
    ).fetchone()["c"]
    percent = round(completed * 100 / total) if total else 0
    return {"completed": completed, "total": total, "percent": percent}


def review_dict(row) -> dict:
    return {
        "id": row["id"],
        "rating": row["rating"],
        "comment": row["comment"],
        "created_at": row["created_at"],
        "user": {
            "id": row["user_id"],
            "name": row["user_name"],
            "avatar_color": row["user_color"],
        },
    }


def admin_required(req) -> dict:
    return require_user(req, ("admin",))


def can_access_course(conn, user: dict, course_id: int) -> bool:
    if user["role"] == "admin":
        return True
    enrollment = get_enrollment(conn, user["id"], course_id)
    if enrollment:
        return True
    if user["role"] == "instructor":
        course = conn.execute("SELECT instructor_id FROM courses WHERE id = ?", (course_id,)).fetchone()
        if course and course["instructor_id"] == user["id"]:
            return True
    return False


# --------------------------------------------------------------------------- #
# Auth
# --------------------------------------------------------------------------- #
def register(req):
    data = req.json()
    name = clean_text(data, "name", "Ism", max_len=80)
    email = clean_text(data, "email", "Email", max_len=120).lower()
    password = data.get("password") or ""
    if len(name) < 2:
        raise ApiError(400, "Ism kamida 2 ta belgidan iborat bo'lishi kerak", "name")
    if not EMAIL_RE.match(email):
        raise ApiError(400, "Email manzil noto'g'ri", "email")
    if not isinstance(password, str) or len(password) < 6:
        raise ApiError(400, "Parol kamida 6 ta belgidan iborat bo'lishi kerak", "password")

    colors = ["#6366f1", "#0ea5e9", "#ec4899", "#f97316", "#10b981", "#8b5cf6", "#ef4444", "#14b8a6"]
    with db() as conn:
        exists = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if exists:
            raise ApiError(409, "Bu email allaqachon ro'yxatdan o'tgan", "email")
        try:
            user_id = conn.execute(
                "INSERT INTO users (name, email, password_hash, role, avatar_color) VALUES (?, ?, ?, 'student', ?)",
                (name, email, hash_password(password), colors[hash(email) % len(colors)]),
            ).lastrowid
        except sqlite3.IntegrityError:
            raise ApiError(409, "Bu email allaqachon ro'yxatdan o'tgan", "email")
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()

    # Telegramga xabar yuborish (faqat instructor/admin uchun)
    try:
        if row["role"] in ("instructor", "admin"):
            notify_new_user(name, email, row["role"])
    except Exception:
        pass

    return json_response(
        {"user": public_user(row), "message": "Ro'yxatdan muvaffaqiyatli o'tdingiz!"},
        status=201,
        headers={"Set-Cookie": auth_cookie(user_id)},
    )


def login(req):
    data = req.json()
    email = clean_text(data, "email", "Email", max_len=120).lower()
    password = data.get("password") or ""
    with db() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    if not row or not verify_password(password, row["password_hash"]):
        raise ApiError(401, "Email yoki parol noto'g'ri")
    return json_response(
        {"user": public_user(row), "message": "Xush kelibsiz!"},
        headers={"Set-Cookie": auth_cookie(row["id"])},
    )


def logout(req):
    return json_response({"message": "Tizimdan chiqdingiz"}, headers={"Set-Cookie": logout_cookie()})


def me(req):
    return json_response({"user": req.user})


# --------------------------------------------------------------------------- #
# Public
# --------------------------------------------------------------------------- #
def home(req):
    with db() as conn:
        stats = conn.execute(
            """SELECT
                 (SELECT COUNT(*) FROM courses WHERE is_published = 1) AS courses,
                 (SELECT COUNT(*) FROM users WHERE role = 'instructor') AS instructors,
                 (SELECT COUNT(*) FROM lessons) AS lessons,
                 (SELECT COALESCE(ROUND(AVG(rating), 1), 0) FROM reviews) AS rating,
                 (SELECT COALESCE(SUM(base_students), 0) FROM courses WHERE is_published = 1) AS base_students,
                 (SELECT COUNT(*) FROM enrollments) AS enrollments"""
        ).fetchone()

        categories = conn.execute(
            """SELECT cat.*, COUNT(c.id) AS courses_count
               FROM categories cat
               LEFT JOIN courses c ON c.category_id = cat.id AND c.is_published = 1
               GROUP BY cat.id ORDER BY cat.id"""
        ).fetchall()

        featured = conn.execute(
            COURSE_SELECT + " WHERE c.is_published = 1 AND c.is_featured = 1 ORDER BY c.base_students DESC LIMIT 6"
        ).fetchall()
        newest = conn.execute(
            COURSE_SELECT + " WHERE c.is_published = 1 ORDER BY c.created_at DESC LIMIT 4"
        ).fetchall()

        instructors = conn.execute(
            """SELECT u.id, u.name, u.title, u.bio, u.avatar_color,
                      COUNT(c.id) AS courses_count,
                      COALESCE(SUM(c.base_students), 0) AS students_count,
                      COALESCE((SELECT ROUND(AVG(r.rating), 1) FROM reviews r
                                JOIN courses cc ON cc.id = r.course_id
                                WHERE cc.instructor_id = u.id), 0) AS rating
               FROM users u
               JOIN courses c ON c.instructor_id = u.id AND c.is_published = 1
               WHERE u.role = 'instructor'
               GROUP BY u.id
               ORDER BY students_count DESC LIMIT 4"""
        ).fetchall()

        testimonials = conn.execute(
            """SELECT r.rating, r.comment, u.name AS user_name, u.avatar_color,
                      c.title AS course_title, c.slug AS course_slug
               FROM reviews r
               JOIN users u ON u.id = r.user_id
               JOIN courses c ON c.id = r.course_id
               WHERE r.rating = 5 AND LENGTH(r.comment) > 60
               ORDER BY r.id LIMIT 3"""
        ).fetchall()

    total_students = stats["base_students"] + stats["enrollments"]
    return json_response({
        "stats": {
            "courses": stats["courses"],
            "instructors": stats["instructors"],
            "lessons": stats["lessons"],
            "students": total_students,
            "rating": float(stats["rating"] or 0),
        },
        "categories": [
            {
                "id": r["id"], "name": r["name"], "slug": r["slug"], "icon": r["icon"],
                "color": r["color"], "description": r["description"],
                "courses_count": r["courses_count"],
            }
            for r in categories
        ],
        "featured": [course_dict(r) for r in featured],
        "newest": [course_dict(r) for r in newest],
        "instructors": [
            {
                "id": r["id"], "name": r["name"], "title": r["title"], "bio": r["bio"],
                "avatar_color": r["avatar_color"], "courses_count": r["courses_count"],
                "students_count": r["students_count"], "rating": float(r["rating"] or 0),
            }
            for r in instructors
        ],
        "testimonials": [
            {
                "rating": r["rating"], "comment": r["comment"], "user_name": r["user_name"],
                "avatar_color": r["avatar_color"], "course_title": r["course_title"],
                "course_slug": r["course_slug"],
            }
            for r in testimonials
        ],
    })


def categories(req):
    with db() as conn:
        rows = conn.execute(
            """SELECT cat.*, COUNT(c.id) AS courses_count
               FROM categories cat
               LEFT JOIN courses c ON c.category_id = cat.id AND c.is_published = 1
               GROUP BY cat.id ORDER BY cat.name"""
        ).fetchall()
    return json_response({"items": [
        {
            "id": r["id"], "name": r["name"], "slug": r["slug"], "icon": r["icon"],
            "color": r["color"], "description": r["description"], "courses_count": r["courses_count"],
        } for r in rows
    ]})


def courses(req):
    where = ["c.is_published = 1"]
    params: list = []

    q = (req.get("q") or "").strip()
    if q:
        like = f"%{q}%"
        where.append("(c.title LIKE ? OR c.summary LIKE ? OR c.description LIKE ? OR u.name LIKE ? OR cat.name LIKE ?)")
        params += [like, like, like, like, like]

    category = (req.get("category") or "").strip()
    if category:
        where.append("cat.slug = ?")
        params.append(category)

    level = (req.get("level") or "").strip()
    if level:
        where.append("c.level = ?")
        params.append(level)

    price = (req.get("price") or "").strip()
    if price == "free":
        where.append("c.price = 0")
    elif price == "paid":
        where.append("c.price > 0")

    instructor_id = req.get_int("instructor")
    if instructor_id:
        where.append("c.instructor_id = ?")
        params.append(instructor_id)

    sort = (req.get("sort") or "popular").strip()
    order_by = {
        "popular": "c.base_students DESC, enrolled_count DESC",
        "new": "c.created_at DESC",
        "rating": "rating DESC, reviews_count DESC",
        "price_asc": "c.price ASC",
        "price_desc": "c.price DESC",
    }.get(sort, "c.base_students DESC")

    page = max(1, req.get_int("page", 1) or 1)
    limit = min(24, max(3, req.get_int("limit", 9) or 9))
    offset = (page - 1) * limit
    where_sql = " WHERE " + " AND ".join(where)

    with db() as conn:
        total = conn.execute(
            "SELECT COUNT(*) AS c FROM courses c JOIN categories cat ON cat.id = c.category_id "
            "JOIN users u ON u.id = c.instructor_id" + where_sql,
            params,
        ).fetchone()["c"]
        rows = conn.execute(
            COURSE_SELECT + where_sql + f" ORDER BY {order_by} LIMIT ? OFFSET ?",
            params + [limit, offset],
        ).fetchall()

    return json_response({
        "items": [course_dict(r) for r in rows],
        "total": total,
        "page": page,
        "pages": max(1, math.ceil(total / limit)) if total else 1,
        "limit": limit,
    })


def course_detail(req, course_id: str):
    cid = parse_int(course_id, "Kurs ID", minimum=1)
    user = req.user
    with db() as conn:
        row = get_course_row(conn, cid)
        if not row["is_published"] and not (user and (user["role"] == "admin" or user["id"] == row["instructor_id"])):
            raise ApiError(404, "Kurs topilmadi")

        lessons = conn.execute(
            "SELECT * FROM lessons WHERE course_id = ? ORDER BY position, id", (cid,)
        ).fetchall()
        reviews = conn.execute(
            """SELECT r.*, u.name AS user_name, u.avatar_color AS user_color
               FROM reviews r JOIN users u ON u.id = r.user_id
               WHERE r.course_id = ? ORDER BY r.created_at DESC LIMIT 20""",
            (cid,),
        ).fetchall()

        enrolled = False
        progress = {"completed": 0, "total": len(lessons), "percent": 0}
        my_review = None
        if user:
            enrolled = get_enrollment(conn, user["id"], cid) is not None
            if enrolled:
                progress = progress_for(conn, user["id"], cid)
                review_row = conn.execute(
                    "SELECT * FROM reviews WHERE course_id = ? AND user_id = ?", (cid, user["id"])
                ).fetchone()
                if review_row:
                    review_row = conn.execute(
                        """SELECT r.*, u.name AS user_name, u.avatar_color AS user_color
                           FROM reviews r JOIN users u ON u.id = r.user_id WHERE r.id = ?""",
                        (review_row["id"],),
                    ).fetchone()
                    my_review = review_dict(review_row)

        unlocked = bool(user and (user["role"] == "admin" or enrolled or user["id"] == row["instructor_id"]))
        related = conn.execute(
            COURSE_SELECT + " WHERE c.is_published = 1 AND c.category_id = ? AND c.id != ? "
            "ORDER BY c.base_students DESC LIMIT 3",
            (row["category_id"], cid),
        ).fetchall()

    return json_response({
        "course": course_dict(row),
        "lessons": [lesson_public(l, unlocked) for l in lessons],
        "reviews": [review_dict(r) for r in reviews],
        "related": [course_dict(r) for r in related],
        "enrolled": enrolled,
        "progress": progress,
        "my_review": my_review,
    })


def instructors_list(req):
    with db() as conn:
        rows = conn.execute(
            """SELECT u.id, u.name, u.title, u.bio, u.avatar_color,
                      COUNT(c.id) AS courses_count,
                      COALESCE(SUM(c.base_students), 0) AS students_count,
                      COALESCE((SELECT ROUND(AVG(r.rating), 1) FROM reviews r
                                JOIN courses cc ON cc.id = r.course_id
                                WHERE cc.instructor_id = u.id), 0) AS rating
               FROM users u
               LEFT JOIN courses c ON c.instructor_id = u.id AND c.is_published = 1
               WHERE u.role = 'instructor'
               GROUP BY u.id ORDER BY students_count DESC"""
        ).fetchall()
    return json_response({"items": [
        {
            "id": r["id"], "name": r["name"], "title": r["title"], "bio": r["bio"],
            "avatar_color": r["avatar_color"], "courses_count": r["courses_count"],
            "students_count": r["students_count"], "rating": float(r["rating"] or 0),
        } for r in rows
    ]})


# --------------------------------------------------------------------------- #
# O'quvchi amallari
# --------------------------------------------------------------------------- #
def enroll(req, course_id: str):
    user = require_user(req)
    cid = parse_int(course_id, "Kurs ID", minimum=1)
    with db() as conn:
        row = get_course_row(conn, cid)
        if not row["is_published"]:
            raise ApiError(404, "Kurs topilmadi")
        existing = get_enrollment(conn, user["id"], cid)
        if existing:
            return json_response({
                "already": True,
                "message": "Siz allaqachon bu kursga yozilgansiz",
                "course_id": cid,
            })
        conn.execute(
            "INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)", (user["id"], cid)
        )
        first_lesson = conn.execute(
            "SELECT id FROM lessons WHERE course_id = ? ORDER BY position, id LIMIT 1", (cid,)
        ).fetchone()
        if first_lesson:
            conn.execute(
                "UPDATE enrollments SET last_lesson_id = ? WHERE user_id = ? AND course_id = ?",
                (first_lesson["id"], user["id"], cid),
            )
        progress = progress_for(conn, user["id"], cid)

    # Telegramga xabar yuborish
    try:
        notify_new_enrollment(user["name"], row["title"], cid)
    except Exception:
        pass

    return json_response({
        "already": False,
        "message": "Kursga muvaffaqiyatli yozildingiz!",
        "course_id": cid,
        "progress": progress,
    }, status=201)


def my_courses(req):
    user = require_user(req)
    with db() as conn:
        rows = conn.execute(
            COURSE_SELECT.replace(
                "FROM courses c",
                ", e.id AS enrollment_id, e.created_at AS enrolled_at, e.last_lesson_id, "
                "(SELECT COUNT(*) FROM lesson_completions lc WHERE lc.user_id = e.user_id "
                "AND lc.course_id = c.id) AS completed_count "
                "FROM enrollments e JOIN courses c ON c.id = e.course_id",
            ) + " WHERE e.user_id = ? ORDER BY e.created_at DESC",
            (user["id"],),
        ).fetchall()

        items = []
        for row in rows:
            course = course_dict(row)
            total = course["lessons_count"]
            completed = row["completed_count"]
            percent = round(completed * 100 / total) if total else 0
            next_lesson = conn.execute(
                """SELECT l.id, l.title, l.position FROM lessons l
                   WHERE l.course_id = ? AND l.id NOT IN (
                       SELECT lesson_id FROM lesson_completions WHERE user_id = ? AND course_id = ?
                   ) ORDER BY l.position, l.id LIMIT 1""",
                (row["id"], user["id"], row["id"]),
            ).fetchone()
            if not next_lesson:
                next_lesson = conn.execute(
                    "SELECT id, title, position FROM lessons WHERE course_id = ? ORDER BY position, id LIMIT 1",
                    (row["id"],),
                ).fetchone()
            course.update({
                "enrolled_at": row["enrolled_at"],
                "completed_lessons": completed,
                "percent": percent,
                "last_lesson_id": row["last_lesson_id"],
                "next_lesson": (
                    {"id": next_lesson["id"], "title": next_lesson["title"], "position": next_lesson["position"]}
                    if next_lesson else None
                ),
            })
            items.append(course)
    return json_response({"items": items})


def my_stats(req):
    user = require_user(req)
    with db() as conn:
        enrolled = conn.execute(
            "SELECT COUNT(*) AS c FROM enrollments WHERE user_id = ?", (user["id"],)
        ).fetchone()["c"]
        completed = conn.execute(
            "SELECT COUNT(*) AS c FROM lesson_completions WHERE user_id = ?", (user["id"],)
        ).fetchone()["c"]
        minutes = conn.execute(
            """SELECT COALESCE(SUM(l.duration), 0) AS m FROM lesson_completions lc
               JOIN lessons l ON l.id = lc.lesson_id WHERE lc.user_id = ?""",
            (user["id"],),
        ).fetchone()["m"]
        certificates = conn.execute(
            """SELECT COUNT(*) AS c FROM (
                   SELECT e.course_id FROM enrollments e
                   JOIN lessons l ON l.course_id = e.course_id
                   WHERE e.user_id = ?
                   GROUP BY e.course_id
                   HAVING COUNT(DISTINCT l.id) = (
                       SELECT COUNT(*) FROM lesson_completions lc
                       WHERE lc.user_id = e.user_id AND lc.course_id = e.course_id
                   ) AND COUNT(DISTINCT l.id) > 0
               )""",
            (user["id"],),
        ).fetchone()["c"]
        reviews = conn.execute(
            "SELECT COUNT(*) AS c FROM reviews WHERE user_id = ?", (user["id"],)
        ).fetchone()["c"]
        days = []
        for offset in range(6, -1, -1):
            day = (datetime.now() - timedelta(days=offset)).strftime("%Y-%m-%d")
            count = conn.execute(
                "SELECT COUNT(*) AS c FROM lesson_completions WHERE user_id = ? AND DATE(completed_at) = ?",
                (user["id"], day),
            ).fetchone()["c"]
            days.append({"date": day, "count": count})
    return json_response({
        "enrolled": enrolled,
        "completed_lessons": completed,
        "minutes_learned": minutes,
        "hours_learned": round(minutes / 60, 1),
        "certificates": certificates,
        "reviews": reviews,
        "activity": days,
    })


def learn_course(req, course_id: str):
    user = require_user(req)
    cid = parse_int(course_id, "Kurs ID", minimum=1)
    with db() as conn:
        row = get_course_row(conn, cid)
        if not can_access_course(conn, user, cid):
            raise ApiError(403, "Bu kursga yozilmagansiz. Avval kursga yoziling.")
        lessons = conn.execute(
            "SELECT * FROM lessons WHERE course_id = ? ORDER BY position, id", (cid,)
        ).fetchall()
        enrollment = get_enrollment(conn, user["id"], cid)
        completed_ids = [r["lesson_id"] for r in conn.execute(
            "SELECT lesson_id FROM lesson_completions WHERE user_id = ? AND course_id = ?",
            (user["id"], cid),
        ).fetchall()]
        progress = progress_for(conn, user["id"], cid)
    return json_response({
        "course": course_dict(row),
        "lessons": [lesson_public(l, True) for l in lessons],
        "completed_lesson_ids": completed_ids,
        "last_lesson_id": enrollment["last_lesson_id"] if enrollment else None,
        "progress": progress,
        "is_enrolled": enrollment is not None,
    })


def complete_lesson(req, lesson_id: str):
    user = require_user(req)
    lid = parse_int(lesson_id, "Dars ID", minimum=1)
    data = req.json() if req.body else {}
    completed = data.get("completed", True)
    if not isinstance(completed, bool):
        raise ApiError(400, "completed true yoki false bo'lishi kerak", "completed")
    with db() as conn:
        lesson = conn.execute("SELECT * FROM lessons WHERE id = ?", (lid,)).fetchone()
        if not lesson:
            raise ApiError(404, "Dars topilmadi")
        cid = lesson["course_id"]
        if not can_access_course(conn, user, cid):
            raise ApiError(403, "Bu darsga ruxsat yo'q")
        if completed:
            conn.execute(
                "INSERT OR IGNORE INTO lesson_completions (user_id, course_id, lesson_id) VALUES (?, ?, ?)",
                (user["id"], cid, lid),
            )
        else:
            conn.execute(
                "DELETE FROM lesson_completions WHERE user_id = ? AND lesson_id = ?", (user["id"], lid)
            )
        conn.execute(
            "UPDATE enrollments SET last_lesson_id = ? WHERE user_id = ? AND course_id = ?",
            (lid, user["id"], cid),
        )
        progress = progress_for(conn, user["id"], cid)
    return json_response({
        "completed": completed,
        "progress": progress,
        "message": "Dars yakunlandi! 🎉" if completed else "Belgi olib tashlandi",
    })


def course_reviews(req, course_id: str):
    cid = parse_int(course_id, "Kurs ID", minimum=1)
    if req.method == "GET":
        with db() as conn:
            rows = conn.execute(
                """SELECT r.*, u.name AS user_name, u.avatar_color AS user_color
                   FROM reviews r JOIN users u ON u.id = r.user_id
                   WHERE r.course_id = ? ORDER BY r.created_at DESC""",
                (cid,),
            ).fetchall()
        return json_response({"items": [review_dict(r) for r in rows]})

    user = require_user(req)
    data = req.json()
    rating = parse_int(data.get("rating"), "Reyting", minimum=1, maximum=5)
    comment = clean_text(data, "comment", "Izoh", required=False, max_len=1000)
    with db() as conn:
        course = get_course_row(conn, cid)
        if not get_enrollment(conn, user["id"], cid):
            raise ApiError(403, "Sharh qoldirish uchun avval kursga yozilishingiz kerak")
        conn.execute(
            """INSERT INTO reviews (course_id, user_id, rating, comment)
               VALUES (?, ?, ?, ?)
               ON CONFLICT(course_id, user_id) DO UPDATE SET
                 rating = excluded.rating, comment = excluded.comment, created_at = datetime('now')""",
            (cid, user["id"], rating, comment),
        )
        row = conn.execute(
            """SELECT r.*, u.name AS user_name, u.avatar_color AS user_color
               FROM reviews r JOIN users u ON u.id = r.user_id
               WHERE r.course_id = ? AND r.user_id = ?""",
            (cid, user["id"]),
        ).fetchone()

    # Telegramga xabar yuborish
    try:
        notify_new_review(course["title"], rating, user["name"], comment, cid)
    except Exception:
        pass

    return json_response({"review": review_dict(row), "message": "Sharhingiz uchun rahmat!"}, status=201)


def update_profile(req):
    user = require_user(req)
    data = req.json()
    name = clean_text(data, "name", "Ism", max_len=80)
    if len(name) < 2:
        raise ApiError(400, "Ism kamida 2 ta belgidan iborat bo'lishi kerak", "name")
    title = clean_text(data, "title", "Lavozim", required=False, max_len=120)
    bio = clean_text(data, "bio", "Bio", required=False, max_len=500)
    with db() as conn:
        conn.execute(
            "UPDATE users SET name = ?, title = ?, bio = ? WHERE id = ?",
            (name, title, bio, user["id"]),
        )
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user["id"],)).fetchone()
    return json_response({"user": public_user(row), "message": "Profil yangilandi"})


def change_password(req):
    user = require_user(req)
    data = req.json()
    current = data.get("current_password") or ""
    new = data.get("new_password") or ""
    if len(new) < 6:
        raise ApiError(400, "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak", "new_password")
    with db() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user["id"],)).fetchone()
        if not verify_password(current, row["password_hash"]):
            raise ApiError(400, "Joriy parol noto'g'ri", "current_password")
        conn.execute("UPDATE users SET password_hash = ? WHERE id = ?", (hash_password(new), user["id"]))
    return json_response({"message": "Parol muvaffaqiyatli o'zgartirildi"})


# --------------------------------------------------------------------------- #
# Admin
# --------------------------------------------------------------------------- #
def admin_overview(req):
    admin_required(req)
    with db() as conn:
        stats = conn.execute(
            """SELECT
                 (SELECT COUNT(*) FROM users) AS users,
                 (SELECT COUNT(*) FROM users WHERE role = 'student') AS students,
                 (SELECT COUNT(*) FROM users WHERE role = 'instructor') AS instructors,
                 (SELECT COUNT(*) FROM courses) AS courses,
                 (SELECT COUNT(*) FROM courses WHERE is_published = 1) AS published,
                 (SELECT COUNT(*) FROM enrollments) AS enrollments,
                 (SELECT COUNT(*) FROM reviews) AS reviews,
                 (SELECT COUNT(*) FROM lesson_completions) AS completions,
                 (SELECT COALESCE(ROUND(AVG(rating), 1), 0) FROM reviews) AS rating,
                 (SELECT COALESCE(SUM(c.price), 0) FROM enrollments e
                    JOIN courses c ON c.id = e.course_id) AS revenue"""
        ).fetchone()

        top_courses = conn.execute(
            COURSE_SELECT + " WHERE c.is_published = 1 ORDER BY c.base_students DESC LIMIT 5"
        ).fetchall()

        recent = conn.execute(
            """SELECT e.created_at, u.name AS user_name, u.email, c.title AS course_title,
                      c.slug AS course_slug, c.price
               FROM enrollments e JOIN users u ON u.id = e.user_id JOIN courses c ON c.id = e.course_id
               ORDER BY e.created_at DESC, e.id DESC LIMIT 8"""
        ).fetchall()

        category_stats = conn.execute(
            """SELECT cat.name, cat.color, COUNT(c.id) AS courses,
                      COALESCE(SUM(c.base_students), 0) AS students
               FROM categories cat LEFT JOIN courses c ON c.category_id = cat.id
               GROUP BY cat.id ORDER BY courses DESC"""
        ).fetchall()

        monthly = {}
        for offset in range(5, -1, -1):
            dt = datetime.now() - timedelta(days=offset * 30)
            key = dt.strftime("%Y-%m")
            monthly[key] = 0
        rows = conn.execute(
            "SELECT strftime('%Y-%m', created_at) AS ym, COUNT(*) AS c FROM enrollments GROUP BY ym"
        ).fetchall()
        for r in rows:
            if r["ym"] in monthly:
                monthly[r["ym"]] = r["c"]

    return json_response({
        "stats": {
            "users": stats["users"], "students": stats["students"],
            "instructors": stats["instructors"], "courses": stats["courses"],
            "published": stats["published"], "enrollments": stats["enrollments"],
            "reviews": stats["reviews"], "completions": stats["completions"],
            "rating": float(stats["rating"] or 0), "revenue": stats["revenue"],
        },
        "top_courses": [course_dict(r) for r in top_courses],
        "recent_enrollments": [
            {
                "created_at": r["created_at"], "user_name": r["user_name"], "email": r["email"],
                "course_title": r["course_title"], "course_slug": r["course_slug"], "price": r["price"],
            } for r in recent
        ],
        "category_stats": [
            {"name": r["name"], "color": r["color"], "courses": r["courses"], "students": r["students"]}
            for r in category_stats
        ],
        "monthly": [{"month": k, "count": v} for k, v in monthly.items()],
    })


def admin_courses(req):
    admin_required(req)
    with db() as conn:
        rows = conn.execute(COURSE_SELECT + " ORDER BY c.created_at DESC").fetchall()
    return json_response({"items": [course_dict(r) for r in rows]})


def admin_course_create(req):
    admin_required(req)
    data = req.json()
    title = clean_text(data, "title", "Kurs nomi", max_len=140)
    summary = clean_text(data, "summary", "Qisqa tavsif", max_len=300)
    description = clean_text(data, "description", "Tavsif", required=False, max_len=5000)
    level = data.get("level") or "Boshlang'ich"
    if level not in ("Boshlang'ich", "O'rta", "Yuqori"):
        raise ApiError(400, "Daraja noto'g'ri", "level")
    price = parse_int(data.get("price", 0), "Narx", minimum=0, maximum=100_000_000)
    old_price = parse_int(data.get("old_price", 0), "Eski narx", minimum=0, maximum=100_000_000)
    category_id = parse_int(data.get("category_id"), "Kategoriya", minimum=1)
    instructor_id = parse_int(data.get("instructor_id"), "O'qituvchi", minimum=1)
    outcomes = data.get("outcomes") or []
    if not isinstance(outcomes, list):
        raise ApiError(400, "Natijalar ro'yxat bo'lishi kerak", "outcomes")
    outcomes = [str(o).strip() for o in outcomes if str(o).strip()][:10]

    with db() as conn:
        if not conn.execute("SELECT id FROM categories WHERE id = ?", (category_id,)).fetchone():
            raise ApiError(400, "Kategoriya topilmadi", "category_id")
        if not conn.execute(
            "SELECT id FROM users WHERE id = ? AND role IN ('instructor', 'admin')", (instructor_id,)
        ).fetchone():
            raise ApiError(400, "O'qituvchi topilmadi", "instructor_id")
        slug = unique_slug(conn, slugify(title))
        course_id = conn.execute(
            """INSERT INTO courses (title, slug, summary, description, outcomes, category_id, instructor_id,
                                    level, price, old_price, icon, accent, base_students, is_featured,
                                    is_published, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, datetime('now'))""",
            (
                title, slug, summary, description, json.dumps(outcomes, ensure_ascii=False),
                category_id, instructor_id, level, price, old_price,
                data.get("icon") or "book", data.get("accent") or "#6366f1",
                1 if data.get("is_featured") else 0, 1 if data.get("is_published", True) else 0,
            ),
        ).lastrowid
        row = get_course_row(conn, course_id)

    # Telegramga xabar yuborish
    try:
        instructor_name = row["instructor"]["name"] if row.get("instructor") else None
        notify_new_course(title, instructor_name, course_id)
        if data.get("is_published", True):
            notify_course_published(title, course_id)
    except Exception:
        pass

    return json_response({"course": course_dict(row), "message": "Kurs yaratildi"}, status=201)


def admin_course_update(req, course_id: str):
    admin_required(req)
    cid = parse_int(course_id, "Kurs ID", minimum=1)
    data = req.json()
    with db() as conn:
        existing = get_course_row(conn, cid)
        fields = []
        values = []

        if "title" in data:
            title = clean_text(data, "title", "Kurs nomi", max_len=140)
            fields.append("title = ?")
            values.append(title)
            fields.append("slug = ?")
            values.append(unique_slug(conn, slugify(title), exclude_id=cid))
        if "summary" in data:
            fields.append("summary = ?")
            values.append(clean_text(data, "summary", "Qisqa tavsif", max_len=300))
        if "description" in data:
            fields.append("description = ?")
            values.append(clean_text(data, "description", "Tavsif", required=False, max_len=5000))
        if "level" in data:
            if data["level"] not in ("Boshlang'ich", "O'rta", "Yuqori"):
                raise ApiError(400, "Daraja noto'g'ri", "level")
            fields.append("level = ?")
            values.append(data["level"])
        if "price" in data:
            fields.append("price = ?")
            values.append(parse_int(data["price"], "Narx", minimum=0, maximum=100_000_000))
        if "old_price" in data:
            fields.append("old_price = ?")
            values.append(parse_int(data["old_price"], "Eski narx", minimum=0, maximum=100_000_000))
        if "category_id" in data:
            fields.append("category_id = ?")
            values.append(parse_int(data["category_id"], "Kategoriya", minimum=1))
        if "instructor_id" in data:
            fields.append("instructor_id = ?")
            values.append(parse_int(data["instructor_id"], "O'qituvchi", minimum=1))
        if "outcomes" in data:
            outcomes = data["outcomes"]
            if not isinstance(outcomes, list):
                raise ApiError(400, "Natijalar ro'yxat bo'lishi kerak", "outcomes")
            fields.append("outcomes = ?")
            values.append(json.dumps([str(o).strip() for o in outcomes if str(o).strip()][:10], ensure_ascii=False))
        if "icon" in data:
            fields.append("icon = ?")
            values.append(str(data["icon"]))
        if "accent" in data:
            fields.append("accent = ?")
            values.append(str(data["accent"]))
        if "is_featured" in data:
            fields.append("is_featured = ?")
            values.append(1 if data["is_featured"] else 0)
        if "is_published" in data:
            fields.append("is_published = ?")
            values.append(1 if data["is_published"] else 0)

        if not fields:
            raise ApiError(400, "O'zgartirish uchun ma'lumot yo'q")
        values.append(cid)
        conn.execute(f"UPDATE courses SET {', '.join(fields)} WHERE id = ?", values)
        row = get_course_row(conn, cid)

        # Telegramga xabar yuborish (faqat is_published o'zgarganda)
        try:
            if "is_published" in data:
                new_published = bool(data["is_published"])
                old_published = bool(existing["is_published"])
                if new_published != old_published:
                    if new_published:
                        notify_course_published(row["title"], cid)
                    else:
                        notify_course_unpublished(row["title"], cid)
        except Exception:
            pass

    return json_response({"course": course_dict(row), "message": "Kurs yangilandi"})


def admin_course_delete(req, course_id: str):
    admin_required(req)
    cid = parse_int(course_id, "Kurs ID", minimum=1)
    with db() as conn:
        if not conn.execute("SELECT id FROM courses WHERE id = ?", (cid,)).fetchone():
            raise ApiError(404, "Kurs topilmadi")
        conn.execute("DELETE FROM courses WHERE id = ?", (cid,))
    return json_response({"message": "Kurs o'chirildi"})


def admin_lessons(req, course_id: str):
    if req.method == "GET":
        admin_required(req)
        cid = parse_int(course_id, "Kurs ID", minimum=1)
        with db() as conn:
            course = get_course_row(conn, cid)
            rows = conn.execute(
                "SELECT * FROM lessons WHERE course_id = ? ORDER BY position, id", (cid,)
            ).fetchall()
        return json_response({
            "course": course_dict(course),
            "items": [{
                "id": r["id"], "title": r["title"], "content": r["content"],
                "duration": r["duration"], "video_url": r["video_url"],
                "position": r["position"], "is_preview": bool(r["is_preview"]),
            } for r in rows],
        })

    admin_required(req)
    cid = parse_int(course_id, "Kurs ID", minimum=1)
    data = req.json()
    title = clean_text(data, "title", "Dars nomi", max_len=160)
    content = clean_text(data, "content", "Dars mazmuni", required=False, max_len=5000)
    duration = parse_int(data.get("duration", 10), "Davomiylik", minimum=1, maximum=600)
    video_url = clean_text(data, "video_url", "Video havolasi", required=False, max_len=500)
    with db() as conn:
        get_course_row(conn, cid)
        position = conn.execute(
            "SELECT COALESCE(MAX(position), 0) + 1 AS p FROM lessons WHERE course_id = ?", (cid,)
        ).fetchone()["p"]
        lesson_id = conn.execute(
            """INSERT INTO lessons (course_id, title, content, duration, video_url, position, is_preview)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (cid, title, content, duration, video_url, position, 1 if data.get("is_preview") else 0),
        ).lastrowid
        row = conn.execute("SELECT * FROM lessons WHERE id = ?", (lesson_id,)).fetchone()

    # Telegramga xabar yuborish
    try:
        course = get_course_row(conn, cid)
        notify_lesson_added(course["title"], title, cid)
    except Exception:
        pass

    return json_response({
        "lesson": {
            "id": row["id"], "title": row["title"], "content": row["content"],
            "duration": row["duration"], "video_url": row["video_url"],
            "position": row["position"], "is_preview": bool(row["is_preview"]),
        },
        "message": "Dars qo'shildi",
    }, status=201)


def admin_lesson_update(req, lesson_id: str):
    admin_required(req)
    lid = parse_int(lesson_id, "Dars ID", minimum=1)
    data = req.json()
    with db() as conn:
        existing = conn.execute("SELECT * FROM lessons WHERE id = ?", (lid,)).fetchone()
        if not existing:
            raise ApiError(404, "Dars topilmadi")
        fields, values = [], []
        if "title" in data:
            fields.append("title = ?")
            values.append(clean_text(data, "title", "Dars nomi", max_len=160))
        if "content" in data:
            fields.append("content = ?")
            values.append(clean_text(data, "content", "Dars mazmuni", required=False, max_len=5000))
        if "duration" in data:
            fields.append("duration = ?")
            values.append(parse_int(data["duration"], "Davomiylik", minimum=1, maximum=600))
        if "video_url" in data:
            fields.append("video_url = ?")
            values.append(clean_text(data, "video_url", "Video havolasi", required=False, max_len=500))
        if "is_preview" in data:
            fields.append("is_preview = ?")
            values.append(1 if data["is_preview"] else 0)
        if "position" in data:
            fields.append("position = ?")
            values.append(parse_int(data["position"], "Tartib", minimum=1, maximum=1000))
        if not fields:
            raise ApiError(400, "O'zgartirish uchun ma'lumot yo'q")
        values.append(lid)
        conn.execute(f"UPDATE lessons SET {', '.join(fields)} WHERE id = ?", values)
        row = conn.execute("SELECT * FROM lessons WHERE id = ?", (lid,)).fetchone()
    return json_response({
        "lesson": {
            "id": row["id"], "title": row["title"], "content": row["content"],
            "duration": row["duration"], "video_url": row["video_url"],
            "position": row["position"], "is_preview": bool(row["is_preview"]),
        },
        "message": "Dars yangilandi",
    })


def admin_lesson_delete(req, lesson_id: str):
    admin_required(req)
    lid = parse_int(lesson_id, "Dars ID", minimum=1)
    with db() as conn:
        row = conn.execute("SELECT * FROM lessons WHERE id = ?", (lid,)).fetchone()
        if not row:
            raise ApiError(404, "Dars topilmadi")
        conn.execute("DELETE FROM lessons WHERE id = ?", (lid,))
        remaining = conn.execute(
            "SELECT id FROM lessons WHERE course_id = ? ORDER BY position, id", (row["course_id"],)
        ).fetchall()
        for index, lesson in enumerate(remaining, start=1):
            conn.execute("UPDATE lessons SET position = ? WHERE id = ?", (index, lesson["id"]))
    return json_response({"message": "Dars o'chirildi"})


def admin_users(req):
    admin_required(req)
    with db() as conn:
        rows = conn.execute(
            """SELECT u.id, u.name, u.email, u.role, u.title, u.avatar_color, u.created_at,
                      (SELECT COUNT(*) FROM enrollments e WHERE e.user_id = u.id) AS enrollments,
                      (SELECT COUNT(*) FROM lesson_completions lc WHERE lc.user_id = u.id) AS completed,
                      (SELECT COUNT(*) FROM reviews r WHERE r.user_id = u.id) AS reviews
               FROM users u ORDER BY u.created_at DESC"""
        ).fetchall()
    return json_response({"items": [
        {
            "id": r["id"], "name": r["name"], "email": r["email"], "role": r["role"],
            "title": r["title"], "avatar_color": r["avatar_color"], "created_at": r["created_at"],
            "enrollments": r["enrollments"], "completed": r["completed"], "reviews": r["reviews"],
        } for r in rows
    ]})


def admin_enrollments(req):
    admin_required(req)
    with db() as conn:
        rows = conn.execute(
            """SELECT e.id, e.created_at, e.user_id, e.course_id,
                      u.name AS user_name, u.email, c.title AS course_title, c.price,
                      (SELECT COUNT(*) FROM lesson_completions lc
                         WHERE lc.user_id = e.user_id AND lc.course_id = e.course_id) AS completed,
                      (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) AS total
               FROM enrollments e
               JOIN users u ON u.id = e.user_id
               JOIN courses c ON c.id = e.course_id
               ORDER BY e.created_at DESC, e.id DESC LIMIT 200"""
        ).fetchall()
    items = []
    for r in rows:
        percent = round(r["completed"] * 100 / r["total"]) if r["total"] else 0
        items.append({
            "id": r["id"], "created_at": r["created_at"], "user_name": r["user_name"],
            "email": r["email"], "course_title": r["course_title"], "price": r["price"],
            "progress": percent,
        })
    return json_response({"items": items})


def admin_instructors(req):
    admin_required(req)
    with db() as conn:
        rows = conn.execute(
            "SELECT id, name, email, title, avatar_color FROM users "
            "WHERE role IN ('instructor', 'admin') ORDER BY name"
        ).fetchall()
    return json_response({"items": [
        {
            "id": r["id"], "name": r["name"], "email": r["email"],
            "title": r["title"], "avatar_color": r["avatar_color"],
        } for r in rows
    ]})


# --------------------------------------------------------------------------- #
# Router
# --------------------------------------------------------------------------- #
def build_router() -> Router:
    router = Router()

    router.post("/api/auth/register", register)
    router.post("/api/auth/login", login)
    router.post("/api/auth/logout", logout)
    router.get("/api/auth/me", me)

    router.get("/api/home", home)
    router.get("/api/categories", categories)
    router.get("/api/courses", courses)
    router.get("/api/courses/(?P<course_id>\\d+)", course_detail)
    router.get("/api/instructors", instructors_list)

    router.post("/api/courses/(?P<course_id>\\d+)/enroll", enroll)
    router.get("/api/courses/(?P<course_id>\\d+)/learn", learn_course)
    router.get("/api/courses/(?P<course_id>\\d+)/reviews", course_reviews)
    router.post("/api/courses/(?P<course_id>\\d+)/reviews", course_reviews)
    router.get("/api/my/courses", my_courses)
    router.get("/api/my/stats", my_stats)
    router.post("/api/lessons/(?P<lesson_id>\\d+)/complete", complete_lesson)
    router.patch("/api/profile", update_profile)
    router.post("/api/profile/password", change_password)

    router.get("/api/admin/overview", admin_overview)
    router.get("/api/admin/courses", admin_courses)
    router.post("/api/admin/courses", admin_course_create)
    router.patch("/api/admin/courses/(?P<course_id>\\d+)", admin_course_update)
    router.delete("/api/admin/courses/(?P<course_id>\\d+)", admin_course_delete)
    router.get("/api/admin/courses/(?P<course_id>\\d+)/lessons", admin_lessons)
    router.post("/api/admin/courses/(?P<course_id>\\d+)/lessons", admin_lessons)
    router.patch("/api/admin/lessons/(?P<lesson_id>\\d+)", admin_lesson_update)
    router.delete("/api/admin/lessons/(?P<lesson_id>\\d+)", admin_lesson_delete)
    router.get("/api/admin/users", admin_users)
    router.get("/api/admin/enrollments", admin_enrollments)
    router.get("/api/admin/instructors", admin_instructors)

    return router
