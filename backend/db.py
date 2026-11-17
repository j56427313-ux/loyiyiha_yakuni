"""SQLite ma'lumotlar bazasi: sxema, ulanish va demo ma'lumotlarni yuklash."""
from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timedelta
from pathlib import Path

from . import seed_data
from .auth import hash_password

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "bilimnova.db"

SCHEMA = """
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
    title         TEXT NOT NULL DEFAULT '',
    bio           TEXT NOT NULL DEFAULT '',
    avatar_color  TEXT NOT NULL DEFAULT '#6366f1',
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,
    slug        TEXT NOT NULL UNIQUE,
    icon        TEXT NOT NULL DEFAULT 'book',
    color       TEXT NOT NULL DEFAULT '#6366f1',
    description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS courses (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    title           TEXT NOT NULL,
    slug            TEXT NOT NULL UNIQUE,
    summary         TEXT NOT NULL DEFAULT '',
    description     TEXT NOT NULL DEFAULT '',
    outcomes        TEXT NOT NULL DEFAULT '[]',
    category_id     INTEGER NOT NULL REFERENCES categories(id),
    instructor_id   INTEGER NOT NULL REFERENCES users(id),
    level           TEXT NOT NULL DEFAULT 'Boshlang''ich',
    price           INTEGER NOT NULL DEFAULT 0,
    old_price       INTEGER NOT NULL DEFAULT 0,
    icon            TEXT NOT NULL DEFAULT 'book',
    accent          TEXT NOT NULL DEFAULT '#6366f1',
    base_students   INTEGER NOT NULL DEFAULT 0,
    is_featured     INTEGER NOT NULL DEFAULT 0,
    is_published    INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS lessons (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    content     TEXT NOT NULL DEFAULT '',
    duration    INTEGER NOT NULL DEFAULT 10,
    video_url   TEXT NOT NULL DEFAULT '',
    position    INTEGER NOT NULL DEFAULT 0,
    is_preview  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS enrollments (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id      INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    last_lesson_id INTEGER,
    created_at     TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS lesson_completions (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id    INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id    INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id  INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment    TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (course_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id, position);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_completions_user ON lesson_completions(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_course ON reviews(course_id);
"""

VIDEO_SAMPLES = [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
]


def connect() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=20, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA busy_timeout = 10000")
    return conn


@contextmanager
def db():
    conn = connect()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def _iso(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d %H:%M:%S")


def init_db() -> None:
    with db() as conn:
        conn.executescript(SCHEMA)
        count = conn.execute("SELECT COUNT(*) AS c FROM users").fetchone()["c"]
        if count == 0:
            seed(conn)


def seed(conn: sqlite3.Connection) -> None:
    now = datetime.now()

    # --- Foydalanuvchilar ---------------------------------------------------
    demo_password = hash_password("Student123!")
    admin_id = conn.execute(
        "INSERT INTO users (name, email, password_hash, role, title, bio, avatar_color, created_at) "
        "VALUES (?, ?, ?, 'admin', ?, ?, ?, ?)",
        (
            "Platforma administratori",
            "admin@bilimnova.uz",
            hash_password("Admin123!"),
            "Bosh administrator",
            "BilimNova platformasini boshqaradi.",
            "#4f46e5",
            _iso(now - timedelta(days=400)),
        ),
    ).lastrowid

    demo_id = conn.execute(
        "INSERT INTO users (name, email, password_hash, role, title, bio, avatar_color, created_at) "
        "VALUES (?, ?, ?, 'student', ?, ?, ?, ?)",
        (
            "Dilshod Karimov",
            "student@bilimnova.uz",
            demo_password,
            "Frontend dasturchi",
            "Bilim olishni yaxshi ko'radigan o'quvchi.",
            "#0ea5e9",
            _iso(now - timedelta(days=180)),
        ),
    ).lastrowid

    instructor_ids: dict[str, int] = {}
    for i, inst in enumerate(seed_data.INSTRUCTORS):
        instructor_ids[inst["name"]] = conn.execute(
            "INSERT INTO users (name, email, password_hash, role, title, bio, avatar_color, created_at) "
            "VALUES (?, ?, ?, 'instructor', ?, ?, ?, ?)",
            (
                inst["name"], inst["email"], hash_password("Teacher123!"),
                inst["title"], inst["bio"], inst["avatar_color"],
                _iso(now - timedelta(days=380 - i * 10)),
            ),
        ).lastrowid

    student_ids: dict[str, int] = {"Dilshod Karimov": demo_id}
    for i, name in enumerate(seed_data.STUDENTS):
        if name in student_ids:
            continue
        student_ids[name] = conn.execute(
            "INSERT INTO users (name, email, password_hash, role, title, bio, avatar_color, created_at) "
            "VALUES (?, ?, ?, 'student', '', '', ?, ?)",
            (
                name, f"student{i + 1:02d}@bilimnova.uz", demo_password,
                ["#6366f1", "#0ea5e9", "#ec4899", "#f97316", "#10b981", "#8b5cf6", "#ef4444", "#14b8a6"][i % 8],
                _iso(now - timedelta(days=170 - i * 5)),
            ),
        ).lastrowid

    # --- Kategoriyalar ------------------------------------------------------
    category_ids: dict[str, int] = {}
    for cat in seed_data.CATEGORIES:
        category_ids[cat["slug"]] = conn.execute(
            "INSERT INTO categories (name, slug, icon, color, description) VALUES (?, ?, ?, ?, ?)",
            (cat["name"], cat["slug"], cat["icon"], cat["color"], cat["description"]),
        ).lastrowid

    # --- Kurslar va darslar ------------------------------------------------
    course_ids: dict[str, int] = {}
    lesson_ids_by_course: dict[str, list[int]] = {}

    for index, course in enumerate(seed_data.COURSES):
        course_id = conn.execute(
            "INSERT INTO courses (title, slug, summary, description, outcomes, category_id, instructor_id, "
            "level, price, old_price, icon, accent, base_students, is_featured, is_published, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)",
            (
                course["title"], course["slug"], course["summary"], course["description"],
                json.dumps(course["outcomes"], ensure_ascii=False),
                category_ids[course["category"]], instructor_ids[course["instructor"]],
                course["level"], course["price"], course["old_price"], course["icon"], course["accent"],
                course["base_students"], 1 if course["featured"] else 0,
                _iso(now - timedelta(days=course["created_days_ago"])),
            ),
        ).lastrowid
        course_ids[course["slug"]] = course_id
        lessons = course["lessons"]
        lesson_ids: list[int] = []
        for pos, (title, minutes, content, preview) in enumerate(lessons, start=1):
            lesson_ids.append(conn.execute(
                "INSERT INTO lessons (course_id, title, content, duration, video_url, position, is_preview) "
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                (
                    course_id, title, content, minutes,
                    VIDEO_SAMPLES[(index + pos) % len(VIDEO_SAMPLES)],
                    pos, 1 if preview else 0,
                ),
            ).lastrowid)
        lesson_ids_by_course[course["slug"]] = lesson_ids

    # --- O'quvchilarni kurslarga yozish ------------------------------------
    slug_list = [c["slug"] for c in seed_data.COURSES]

    def enroll(user_id: int, slug: str, days_ago: int = 30) -> None:
        conn.execute(
            "INSERT OR IGNORE INTO enrollments (user_id, course_id, created_at) VALUES (?, ?, ?)",
            (user_id, course_ids[slug], _iso(now - timedelta(days=days_ago))),
        )

    student_names = list(student_ids.keys())
    for i, name in enumerate(student_names):
        if name == "Dilshod Karimov":
            continue
        uid = student_ids[name]
        for j, slug in enumerate(slug_list):
            if (i * 7 + j * 3) % 5 < 2:
                enroll(uid, slug, days_ago=(i * 7 + j * 5) % 165)

    # Demo o'quvchi uchun aniq taraqqiyot
    demo_plan = {
        "python-asoslari": len(lesson_ids_by_course["python-asoslari"]),
        "ui-ux-dizayn-figma": 5,
        "karyera-va-cv": 3,
        "malumotlar-tahlili": 2,
    }
    for slug, completed_count in demo_plan.items():
        enroll(demo_id, slug, days_ago=45)
        for k, lesson_id in enumerate(lesson_ids_by_course[slug][:completed_count]):
            conn.execute(
                "INSERT OR IGNORE INTO lesson_completions (user_id, course_id, lesson_id, completed_at) "
                "VALUES (?, ?, ?, ?)",
                (demo_id, course_ids[slug], lesson_id, _iso(now - timedelta(days=(6 - k) % 7))),
            )
        last_lesson = lesson_ids_by_course[slug][max(0, completed_count - 1)]
        conn.execute(
            "UPDATE enrollments SET last_lesson_id = ? WHERE user_id = ? AND course_id = ?",
            (last_lesson, demo_id, course_ids[slug]),
        )

    # Boshqa o'quvchilarda ham progress bo'lsin (admin statistikasi uchun)
    for i, name in enumerate(student_names):
        if name == "Dilshod Karimov":
            continue
        uid = student_ids[name]
        for j, slug in enumerate(slug_list):
            row = conn.execute(
                "SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?",
                (uid, course_ids[slug]),
            ).fetchone()
            if not row:
                continue
            lesson_ids = lesson_ids_by_course[slug]
            complete_count = (i * 3 + j * 5) % (len(lesson_ids) + 1)
            for k, lesson_id in enumerate(lesson_ids[:complete_count]):
                conn.execute(
                    "INSERT OR IGNORE INTO lesson_completions "
                    "(user_id, course_id, lesson_id, completed_at) VALUES (?, ?, ?, ?)",
                    (uid, course_ids[slug], lesson_id,
                     _iso(now - timedelta(days=(i * 5 + j * 3 + k * 2) % 75))),
                )
            if complete_count:
                conn.execute(
                    "UPDATE enrollments SET last_lesson_id = ? WHERE user_id = ? AND course_id = ?",
                    (lesson_ids[complete_count - 1], uid, course_ids[slug]),
                )

    # --- Sharhlar ----------------------------------------------------------
    for idx, (slug, student_name, rating, comment) in enumerate(seed_data.REVIEWS):
        uid = student_ids.get(student_name)
        if not uid:
            continue
        enroll(uid, slug, days_ago=(40 + idx) % 120)
        conn.execute(
            "INSERT OR IGNORE INTO reviews (course_id, user_id, rating, comment, created_at) "
            "VALUES (?, ?, ?, ?, ?)",
            (course_ids[slug], uid, rating, comment, _iso(now - timedelta(days=(idx * 3) % 90))),
        )

    # Admin uchun ham bitta kursga yozilish (statistika uchun)
    enroll(admin_id, "startup-asoslari", days_ago=20)
