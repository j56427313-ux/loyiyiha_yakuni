import { del, get, patch, post } from "../api.js";
import { icon, logoMark } from "../icons.js";
import { state } from "../store.js";
import {
  avatar, bindTheme, confirmDialog, courseCover, esc, fmtDate, fmtNumber,
  fmtPrice, go, openModal, sectionHead, themeToggleHTML, toast,
} from "../ui.js";

const LEVELS = ["Boshlang'ich", "O'rta", "Yuqori"];
const ICONS = [
  ["book", "Kitob"], ["code", "Kod"], ["terminal", "Terminal"], ["palette", "Palitra"],
  ["brush", "Mo'yqalam"], ["megaphone", "Megafon"], ["briefcase", "Portfel"], ["globe", "Globus"],
  ["chart", "Diagramma"], ["video", "Video"], ["sparkles", "Yulduzcha"], ["rocket", "Raketa"],
  ["phone", "Telefon"], ["brain", "Miya"],
];
const MONTHS_SHORT = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];

const NAV = [
  ["overview", "/admin", "Boshqaruv paneli", "grid"],
  ["courses", "/admin/courses", "Kurslar", "book-open"],
  ["users", "/admin/users", "Foydalanuvchilar", "users"],
  ["enrollments", "/admin/enrollments", "Yozilishlar", "graduation-cap"],
];

function roleBadge(role) {
  const map = {
    admin: ["Administrator", "blue"],
    instructor: ["O'qituvchi", "orange"],
    student: ["O'quvchi", "green"],
  };
  const [label, color] = map[role] || [role, ""];
  return `<span class="admin-pill ${color}">${label}</span>`;
}

function adminShell(view, title, content, subtitle = "") {
  const user = state.user;
  return `<div class="admin-shell">
    <aside class="admin-sidebar">
      <a class="admin-brand" href="#/">${logoMark(34)}<span class="brand-name">Bilim<span>Nova</span></span></a>
      <div class="admin-label">Boshqaruv</div>
      ${NAV.map(([key, href, label, iconName]) => `<a class="admin-nav-link ${view === key ? "active" : ""}" href="#${href}">
        ${icon(iconName, 18)} <span>${label}</span>
      </a>`).join("")}
      <div class="admin-label">Sayt</div>
      <a class="admin-nav-link" href="#/">${icon("globe", 18)} <span>Saytga qaytish</span></a>
      <div class="admin-sidebar-foot">
        <div class="admin-user">
          ${avatar(user, 34)}
          <div><strong>${esc(user.name)}</strong><span>${esc(user.email)}</span></div>
        </div>
      </div>
    </aside>
    <div class="admin-main">
      <header class="admin-topbar">
        <div class="admin-topbar-left">
          <h1>${esc(title)}</h1>
          ${subtitle ? `<span class="admin-pill">${esc(subtitle)}</span>` : ""}
        </div>
        <div class="admin-topbar-right">
          ${themeToggleHTML()}
          <a class="btn btn-outline btn-sm" href="#/dashboard">${icon("grid", 15)} Kabinet</a>
          ${avatar(user, 34)}
        </div>
      </header>
      <div class="admin-content">${content}</div>
    </div>
  </div>`;
}

/* ------------------------------- Overview -------------------------------- */
function statCard(color, iconName, value, label) {
  return `<div class="admin-stat">
    <div class="admin-stat-top">
      <span class="stat-icon" style="--stat-color:${color};background:color-mix(in srgb, ${color} 12%, transparent);color:${color}">${icon(iconName, 19)}</span>
    </div>
    <strong>${value}</strong>
    <span>${label}</span>
  </div>`;
}

function monthlyChart(monthly) {
  const max = Math.max(1, ...monthly.map((item) => item.count));
  return `<div class="chart-bars">
    ${monthly.map((item) => {
      const [, month] = item.month.split("-");
      const height = Math.max(4, Math.round((item.count / max) * 100));
      return `<div class="chart-col" title="${item.month}: ${item.count}">
        <strong>${item.count}</strong>
        <div class="bar" style="height:${height}%"></div>
        <span>${MONTHS_SHORT[Number(month) - 1] || item.month}</span>
      </div>`;
    }).join("")}
  </div>`;
}

function overviewHTML(data) {
  const stats = data.stats;
  const maxCat = Math.max(1, ...data.category_stats.map((cat) => cat.students));
  return `
    <div class="admin-stats">
      ${statCard("#6366f1", "users", stats.users, `Foydalanuvchilar · ${stats.students} o'quvchi`)}
      ${statCard("#10b981", "graduation-cap", stats.enrollments, "Kursga yozilishlar")}
      ${statCard("#f59e0b", "book-open", stats.courses, `${stats.published} ta e'lon qilingan`)}
      ${statCard("#8b5cf6", "wallet", fmtPrice(stats.revenue), "Umumiy tushum (demo)")}
    </div>

    <div class="admin-grid" style="margin-bottom:18px">
      <div class="admin-card">
        <div class="admin-card-head">
          <h2>${icon("trend-up", 17)} Oylik yozilishlar dinamikasi</h2>
          <span class="admin-pill blue">${stats.completions} dars yakunlangan</span>
        </div>
        <div class="admin-card-body">${monthlyChart(data.monthly)}</div>
      </div>

      <div class="admin-card">
        <div class="admin-card-head"><h2>${icon("layers", 17)} Kategoriyalar bo'yicha</h2></div>
        <div class="admin-card-body">
          <div class="category-bars">
            ${data.category_stats.map((cat) => `<div class="category-bar-row">
              <div class="top"><span>${esc(cat.name)}</span><span>${cat.courses} kurs · ${fmtNumber(cat.students)}</span></div>
              <div class="bar"><span style="width:${Math.round((cat.students / maxCat) * 100)}%;background:${esc(cat.color)}"></span></div>
            </div>`).join("")}
          </div>
        </div>
      </div>
    </div>

    <div class="admin-grid">
      <div class="admin-card">
        <div class="admin-card-head">
          <h2>${icon("book-open", 17)} Eng ommabop kurslar</h2>
          <a href="#/admin/courses">Barcha kurslar</a>
        </div>
        <div class="table-wrap">
          <table class="data">
            <thead><tr><th>Kurs</th><th>O'quvchilar</th><th>Reyting</th><th>Narx</th></tr></thead>
            <tbody>
              ${data.top_courses.map((course) => `<tr>
                <td><div class="table-course">
                  <div class="mini-cover">${courseCover(course, { compact: true })}</div>
                  <div><strong>${esc(course.title)}</strong><span>${esc(course.instructor.name)}</span></div>
                </div></td>
                <td>${fmtNumber(course.students_count)}</td>
                <td><span class="admin-pill orange">${icon("star", 11)} ${course.rating.toFixed(1)}</span></td>
                <td>${fmtPrice(course.price)}</td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div class="admin-card">
        <div class="admin-card-head">
          <h2>${icon("clock", 17)} So'nggi yozilishlar</h2>
        </div>
        <div class="admin-card-body">
          <div class="recent-list">
            ${data.recent_enrollments.map((item) => `<div class="recent-item">
              ${avatar({ name: item.user_name, avatar_color: "#6366f1" }, 32)}
              <div style="min-width:0">
                <strong>${esc(item.user_name)}</strong>
                <span>${esc(item.course_title)} · ${fmtDate(item.created_at)}</span>
              </div>
              <span class="badge ${item.price ? "badge-primary" : "badge-success"}">${item.price ? fmtPrice(item.price) : "Bepul"}</span>
            </div>`).join("")}
          </div>
        </div>
      </div>
    </div>`;
}

/* -------------------------------- Courses -------------------------------- */
function courseRow(course) {
  return `<tr data-course-row data-title="${esc(course.title.toLowerCase())}" data-id="${course.id}">
    <td><div class="table-course">
      <div class="mini-cover">${courseCover(course, { compact: true })}</div>
      <div><strong>${esc(course.title)}</strong><span>${esc(course.category.name)}</span></div>
    </div></td>
    <td>${esc(course.instructor.name)}</td>
    <td>${fmtNumber(course.students_count)}</td>
    <td>${course.lessons_count}</td>
    <td>${fmtPrice(course.price)}</td>
    <td>${course.is_published
      ? `<span class="admin-pill green">E'lon qilingan</span>`
      : `<span class="admin-pill red">Qoralama</span>`}</td>
    <td>
      <div class="table-actions">
        <a class="mini-btn" href="#/admin/courses/${course.id}/lessons" title="Darslar">${icon("layers", 15)}</a>
        <button class="mini-btn" type="button" data-edit-course="${course.id}" title="Tahrirlash">${icon("edit", 15)}</button>
        <button class="mini-btn success" type="button" data-toggle-course="${course.id}" title="${course.is_published ? "Bekor qilish" : "E'lon qilish"}">${icon(course.is_published ? "eye-off" : "eye", 15)}</button>
        <button class="mini-btn danger" type="button" data-delete-course="${course.id}" title="O'chirish">${icon("trash", 15)}</button>
      </div>
    </td>
  </tr>`;
}

function coursesHTML(courses) {
  return `
    <div class="admin-toolbar">
      <div class="admin-search">
        ${icon("search", 16)}
        <input type="search" placeholder="Kurs yoki mentor bo'yicha qidirish..." data-course-search>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <span class="admin-pill">${courses.length} ta kurs</span>
        <button class="btn btn-primary" type="button" data-new-course>${icon("plus", 16)} Yangi kurs</button>
      </div>
    </div>
    <div class="admin-card">
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Kurs</th><th>Mentor</th><th>O'quvchilar</th><th>Darslar</th><th>Narx</th><th>Holat</th><th style="text-align:right">Amallar</th></tr></thead>
          <tbody data-course-body>
            ${courses.length ? courses.map((course) => courseRow(course)).join("")
              : `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--muted)">Kurs topilmadi</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>`;
}

function courseFormHTML(course, categories, instructors) {
  const editing = Boolean(course);
  return `<form class="modal-form" data-course-form>
    <div class="modal-head">
      <span class="modal-icon">${icon(editing ? "edit" : "plus", 22)}</span>
      <div>
        <h3>${editing ? "Kursni tahrirlash" : "Yangi kurs yaratish"}</h3>
        <p>${editing ? "Kurs ma'lumotlarini yangilang." : "Yangi kurs yaratib, unga darslar qo'shishingiz mumkin."}</p>
      </div>
    </div>
    <div class="form-grid">
      <div class="field full">
        <label>Kurs nomi</label>
        <input class="input" name="title" required maxlength="140" value="${esc(course?.title || "")}" placeholder="Masalan: Python asoslari">
      </div>
      <div class="field full">
        <label>Qisqa tavsif</label>
        <input class="input" name="summary" required maxlength="300" value="${esc(course?.summary || "")}" placeholder="Bir jumlada kurs haqida">
      </div>
      <div class="field full">
        <label>To'liq tavsif</label>
        <textarea class="textarea" name="description" maxlength="5000" placeholder="Kurs haqida batafsil...">${esc(course?.description || "")}</textarea>
      </div>
      <div class="field">
        <label>Kategoriya</label>
        <select class="select" name="category_id" required>
          ${categories.map((cat) => `<option value="${cat.id}" ${course?.category?.id === cat.id ? "selected" : ""}>${esc(cat.name)}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label>O'qituvchi</label>
        <select class="select" name="instructor_id" required>
          ${instructors.map((person) => `<option value="${person.id}" ${course?.instructor?.id === person.id ? "selected" : ""}>${esc(person.name)}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label>Daraja</label>
        <select class="select" name="level">
          ${LEVELS.map((level) => `<option value="${level}" ${course?.level === level ? "selected" : ""}>${level}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label>Ikonka</label>
        <select class="select" name="icon">
          ${ICONS.map(([value, label]) => `<option value="${value}" ${course?.icon === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label>Narx (so'm)</label>
        <input class="input" name="price" type="number" min="0" step="1000" value="${course?.price ?? 0}">
      </div>
      <div class="field">
        <label>Eski narx (so'm)</label>
        <input class="input" name="old_price" type="number" min="0" step="1000" value="${course?.old_price ?? 0}">
      </div>
      <div class="field">
        <label>Rang</label>
        <input class="input" name="accent" type="color" value="${esc(course?.accent || "#6366f1")}" style="height:44px;padding:4px">
      </div>
      <div class="field">
        <label>Holat</label>
        <select class="select" name="is_published">
          <option value="1" ${course?.is_published !== false ? "selected" : ""}>E'lon qilingan</option>
          <option value="0" ${course?.is_published === false ? "selected" : ""}>Qoralama</option>
        </select>
      </div>
      <div class="field full">
        <label>O'quv natijalari (har biri yangi qatorda)</label>
        <textarea class="textarea" name="outcomes" placeholder="Kurs oxirida nimalarni bilasiz...">${esc((course?.outcomes || []).join("\n"))}</textarea>
      </div>
      <label class="checkbox full"><input type="checkbox" name="is_featured" ${course?.is_featured ? "checked" : ""}> Bosh sahifadagi tanlangan kurslarga qo'shish</label>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" type="button" data-close>Bekor qilish</button>
      <button class="btn btn-primary" type="submit">${icon("check", 16)} ${editing ? "Saqlash" : "Yaratish"}</button>
    </div>
  </form>`;
}

/* -------------------------------- Lessons -------------------------------- */
function lessonRow(lesson) {
  return `<tr data-lesson-row data-id="${lesson.id}">
    <td><span class="admin-pill blue">${lesson.position}</span></td>
    <td><strong style="font-size:12.5px">${esc(lesson.title)}</strong></td>
    <td>${lesson.duration} daq</td>
    <td>${lesson.is_preview ? `<span class="admin-pill green">Bepul</span>` : `<span class="admin-pill">Yopiq</span>`}</td>
    <td>
      <div class="table-actions">
        <button class="mini-btn" type="button" data-edit-lesson="${lesson.id}" title="Tahrirlash">${icon("edit", 15)}</button>
        <button class="mini-btn danger" type="button" data-delete-lesson="${lesson.id}" title="O'chirish">${icon("trash", 15)}</button>
      </div>
    </td>
  </tr>`;
}

function lessonsHTML(course, lessons) {
  return `
    <div class="admin-toolbar">
      <div style="display:flex;align-items:center;gap:12px">
        <a class="btn btn-outline btn-sm" href="#/admin/courses">${icon("arrow-left", 15)} Kurslar</a>
        <span class="admin-pill">${lessons.length} dars</span>
      </div>
      <div style="display:flex;gap:8px">
        <a class="btn btn-outline" href="#/course/${course.id}" target="_blank" rel="noopener">${icon("eye", 15)} Saytda ko'rish</a>
        <button class="btn btn-primary" type="button" data-new-lesson>${icon("plus", 16)} Dars qo'shish</button>
      </div>
    </div>
    <div class="admin-card" style="margin-bottom:18px">
      <div class="admin-card-body" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
        <div style="width:150px">${courseCover(course, { compact: true })}</div>
        <div style="flex:1;min-width:200px">
          <h2 style="font-size:17px;margin-bottom:6px">${esc(course.title)}</h2>
          <p class="muted" style="font-size:12.5px">${esc(course.summary)}</p>
          <div style="display:flex;gap:14px;margin-top:10px;flex-wrap:wrap;font-size:11.5px;color:var(--muted)">
            <span>${icon("users", 13)} ${fmtNumber(course.students_count)} o'quvchi</span>
            <span>${icon("star", 13)} ${course.rating.toFixed(1)}</span>
            <span>${icon("clock", 13)} ${Math.round(course.duration_minutes / 60 * 10) / 10} soat</span>
          </div>
        </div>
      </div>
    </div>
    <div class="admin-card">
      <div class="admin-card-head"><h2>Darslar ro'yxati</h2><span class="admin-pill">Tartib raqamlari avtomatik</span></div>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>#</th><th>Dars nomi</th><th>Davomiylik</th><th>Kirish</th><th style="text-align:right">Amallar</th></tr></thead>
          <tbody data-lesson-body>
            ${lessons.length ? lessons.map((lesson) => lessonRow(lesson)).join("")
              : `<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--muted)">Hali dars qo'shilmagan</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>`;
}

function lessonFormHTML(lesson, courseId) {
  const editing = Boolean(lesson);
  return `<form class="modal-form" data-lesson-form>
    <div class="modal-head">
      <span class="modal-icon">${icon(editing ? "edit" : "plus", 22)}</span>
      <div>
        <h3>${editing ? "Darsni tahrirlash" : "Yangi dars qo'shish"}</h3>
        <p>${editing ? "Dars ma'lumotlarini yangilang." : "Yangi dars kurs oxiriga qo'shiladi."}</p>
      </div>
    </div>
    <div class="form-grid">
      <div class="field full">
        <label>Dars nomi</label>
        <input class="input" name="title" required maxlength="160" value="${esc(lesson?.title || "")}" placeholder="Masalan: Kirish">
      </div>
      <div class="field">
        <label>Davomiylik (daqiqa)</label>
        <input class="input" name="duration" type="number" min="1" max="600" value="${lesson?.duration ?? 15}">
      </div>
      <div class="field">
        <label>Kirish turi</label>
        <select class="select" name="is_preview">
          <option value="0" ${!lesson?.is_preview ? "selected" : ""}>Faqat yozilganlarga</option>
          <option value="1" ${lesson?.is_preview ? "selected" : ""}>Bepul preview</option>
        </select>
      </div>
      <div class="field full">
        <label>Video havolasi (ixtiyoriy)</label>
        <input class="input" name="video_url" value="${esc(lesson?.video_url || "")}" placeholder="https://.../video.mp4">
      </div>
      <div class="field full">
        <label>Dars mazmuni</label>
        <textarea class="textarea" name="content" maxlength="5000" placeholder="Dars matni...">${esc(lesson?.content || "")}</textarea>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" type="button" data-close>Bekor qilish</button>
      <button class="btn btn-primary" type="submit">${icon("check", 16)} ${editing ? "Saqlash" : "Qo'shish"}</button>
    </div>
  </form>`;
}

/* --------------------------------- Users --------------------------------- */
function usersHTML(users) {
  return `
    <div class="admin-toolbar">
      <div class="admin-search">
        ${icon("search", 16)}
        <input type="search" placeholder="Ism yoki email bo'yicha qidirish..." data-user-search>
      </div>
      <span class="admin-pill">${users.length} foydalanuvchi</span>
    </div>
    <div class="admin-card">
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Foydalanuvchi</th><th>Rol</th><th>Lavozim</th><th>Kurslar</th><th>Darslar</th><th>Sharhlar</th><th>Ro'yxatdan o'tgan</th></tr></thead>
          <tbody>
            ${users.map((user) => `<tr data-user-row data-search="${esc((user.name + " " + user.email).toLowerCase())}">
              <td><div class="table-course">
                ${avatar(user, 36)}
                <div><strong>${esc(user.name)}</strong><span>${esc(user.email)}</span></div>
              </div></td>
              <td>${roleBadge(user.role)}</td>
              <td style="max-width:180px;font-size:12px;color:var(--muted)">${esc(user.title || "—")}</td>
              <td>${user.enrollments}</td>
              <td>${user.completed}</td>
              <td>${user.reviews}</td>
              <td style="white-space:nowrap;font-size:11.5px;color:var(--muted)">${fmtDate(user.created_at)}</td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>`;
}

/* ------------------------------ Enrollments ------------------------------ */
function enrollmentsHTML(items) {
  return `<div class="admin-toolbar">
    <span class="admin-pill">${items.length} ta yozilish</span>
    <div class="admin-search">
      ${icon("search", 16)}
      <input type="search" placeholder="O'quvchi yoki kurs..." data-enrollment-search>
    </div>
  </div>
  <div class="admin-card">
    <div class="table-wrap">
      <table class="data">
        <thead><tr><th>O'quvchi</th><th>Kurs</th><th>To'lov</th><th>Progress</th><th>Sana</th></tr></thead>
        <tbody>
          ${items.map((item) => `<tr data-enrollment-row data-search="${esc((item.user_name + " " + item.email + " " + item.course_title).toLowerCase())}">
            <td><div class="table-course">
              ${avatar({ name: item.user_name, avatar_color: "#0ea5e9" }, 32)}
              <div><strong>${esc(item.user_name)}</strong><span>${esc(item.email)}</span></div>
            </div></td>
            <td style="max-width:260px;font-size:12.5px">${esc(item.course_title)}</td>
            <td>${item.price ? `<span class="admin-pill blue">${fmtPrice(item.price)}</span>` : `<span class="admin-pill green">Bepul</span>`}</td>
            <td style="min-width:120px">
              <div class="progress-line">
                <div class="progress"><span style="width:${item.progress}%"></span></div>
                <span>${item.progress}%</span>
              </div>
            </td>
            <td style="white-space:nowrap;font-size:11.5px;color:var(--muted)">${fmtDate(item.created_at)}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
  </div>`;
}

/* -------------------------------- Render --------------------------------- */
function noAccess(root) {
  root.innerHTML = `<div style="min-height:100vh;display:grid;place-items:center;padding:30px">
    <div class="empty-state" style="max-width:440px">
      <span class="empty-icon">${icon("shield", 28)}</span>
      <h3>Ruxsat yo'q</h3>
      <p>Bu bo'lim faqat administratorlar uchun. Agar siz administrator bo'lsangiz, qaytadan tizimga kiring.</p>
      <a class="btn btn-primary" href="#/">Bosh sahifa</a>
    </div>
  </div>`;
}

export async function render(root, ctx) {
  const view = ctx.view || "overview";
  document.title = "Admin panel — BilimNova";

  if (!state.user) {
    go(`/login?next=${encodeURIComponent(`/admin`)}`);
    return;
  }
  if (state.user.role !== "admin") {
    noAccess(root);
    return;
  }

  root.innerHTML = `<div class="admin-shell"><div style="display:grid;place-items:center;height:100vh;width:100%;color:var(--muted);font-size:13px">Yuklanmoqda...</div></div>`;

  try {
    if (view === "overview") {
      const data = await get("/admin/overview");
      root.innerHTML = adminShell(view, "Boshqaruv paneli", overviewHTML(data), "Admin");
    } else if (view === "courses") {
      const [data, categories, instructors] = await Promise.all([
        get("/admin/courses"),
        get("/categories"),
        get("/admin/instructors"),
      ]);
      root.innerHTML = adminShell(view, "Kurslarni boshqarish", coursesHTML(data.items));
      bindCourses(root, data.items, categories.items, instructors.items);
    } else if (view === "lessons") {
      const data = await get(`/admin/courses/${ctx.params.id}/lessons`);
      root.innerHTML = adminShell(view, `${data.course.title} — darslar`, lessonsHTML(data.course, data.items), `${data.items.length} dars`);
      bindLessons(root, data.course, data.items);
    } else if (view === "users") {
      const data = await get("/admin/users");
      root.innerHTML = adminShell(view, "Foydalanuvchilar", usersHTML(data.items), `${data.items.length} ta`);
      bindSearch(root, "[data-user-search]", "[data-user-row]");
    } else if (view === "enrollments") {
      const data = await get("/admin/enrollments");
      root.innerHTML = adminShell(view, "Kursga yozilishlar", enrollmentsHTML(data.items), `${data.items.length} ta`);
      bindSearch(root, "[data-enrollment-search]", "[data-enrollment-row]");
    } else {
      root.innerHTML = adminShell(view, "Topilmadi", `<div class="empty-state"><h3>Sahifa topilmadi</h3><a class="btn btn-primary" href="#/admin">Panelga qaytish</a></div>`);
    }

    bindTheme(root);
  } catch (error) {
    root.innerHTML = `<div class="admin-shell"><div style="display:grid;place-items:center;height:100vh;width:100%">
      <div class="empty-state" style="max-width:420px">
        <span class="empty-icon">${icon("alert", 26)}</span>
        <h3>Xatolik</h3><p>${esc(error.message)}</p>
        <button class="btn btn-primary" type="button" data-admin-retry>Qayta urinish</button>
      </div>
    </div></div>`;
    root.querySelector("[data-admin-retry]")?.addEventListener("click", () => window.__bnRerender?.());
  }
}

function bindSearch(root, inputSelector, rowSelector) {
  const input = root.querySelector(inputSelector);
  if (!input) return;
  input.addEventListener("input", () => {
    const term = input.value.trim().toLowerCase();
    root.querySelectorAll(rowSelector).forEach((row) => {
      row.style.display = row.dataset.search.includes(term) ? "" : "none";
    });
  });
}

/* --------------------------- Courses bindings ---------------------------- */
function bindCourses(root, courses, categories, instructors) {
  const search = root.querySelector("[data-course-search]");
  search?.addEventListener("input", () => {
    const term = search.value.trim().toLowerCase();
    root.querySelectorAll("[data-course-row]").forEach((row) => {
      row.style.display = row.dataset.title.includes(term) ? "" : "none";
    });
  });

  const openForm = (course) => {
    const modal = openModal(courseFormHTML(course, categories, instructors), { size: "lg" });
    const form = modal.q("[data-course-form]");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = {
        title: form.title.value.trim(),
        summary: form.summary.value.trim(),
        description: form.description.value.trim(),
        category_id: Number(form.category_id.value),
        instructor_id: Number(form.instructor_id.value),
        level: form.level.value,
        icon: form.icon.value,
        accent: form.accent.value,
        price: Number(form.price.value) || 0,
        old_price: Number(form.old_price.value) || 0,
        is_featured: form.is_featured.checked,
        is_published: form.is_published.value === "1",
        outcomes: form.outcomes.value.split("\n").map((line) => line.trim()).filter(Boolean),
      };
      const button = form.querySelector("button[type=submit]");
      button.disabled = true;
      try {
        const result = course
          ? await patch(`/admin/courses/${course.id}`, payload)
          : await post("/admin/courses", payload);
        toast(result.message, "success");
        modal.close();
        window.__bnRerender?.();
      } catch (error) {
        toast(error.message, "error");
        button.disabled = false;
      }
    });
  };

  root.querySelector("[data-new-course]")?.addEventListener("click", () => openForm(null));

  root.querySelectorAll("[data-edit-course]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const course = courses.find((item) => item.id === Number(btn.dataset.editCourse));
      if (course) openForm(course);
    });
  });

  root.querySelectorAll("[data-toggle-course]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const course = courses.find((item) => item.id === Number(btn.dataset.toggleCourse));
      if (!course) return;
      try {
        await patch(`/admin/courses/${course.id}`, { is_published: !course.is_published });
        toast(course.is_published ? "Kurs qoralamaga o'tkazildi" : "Kurs e'lon qilindi", "success");
        window.__bnRerender?.();
      } catch (error) {
        toast(error.message, "error");
      }
    });
  });

  root.querySelectorAll("[data-delete-course]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const course = courses.find((item) => item.id === Number(btn.dataset.deleteCourse));
      if (!course) return;
      const ok = await confirmDialog("Kursni o'chirish", `"${course.title}" kursi va unga tegishli barcha darslar, sharhlar o'chiriladi. Bu amalni qaytarib bo'lmaydi.`);
      if (!ok) return;
      try {
        await del(`/admin/courses/${course.id}`);
        toast("Kurs o'chirildi", "success");
        window.__bnRerender?.();
      } catch (error) {
        toast(error.message, "error");
      }
    });
  });
}

/* --------------------------- Lessons bindings ---------------------------- */
function bindLessons(root, course, lessons) {
  const openForm = (lesson) => {
    const modal = openModal(lessonFormHTML(lesson, course.id), { size: "md" });
    const form = modal.q("[data-lesson-form]");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = {
        title: form.title.value.trim(),
        duration: Number(form.duration.value) || 10,
        video_url: form.video_url.value.trim(),
        content: form.content.value.trim(),
        is_preview: form.is_preview.value === "1",
      };
      const button = form.querySelector("button[type=submit]");
      button.disabled = true;
      try {
        const result = lesson
          ? await patch(`/admin/lessons/${lesson.id}`, payload)
          : await post(`/admin/courses/${course.id}/lessons`, payload);
        toast(result.message, "success");
        modal.close();
        window.__bnRerender?.();
      } catch (error) {
        toast(error.message, "error");
        button.disabled = false;
      }
    });
  };

  root.querySelector("[data-new-lesson]")?.addEventListener("click", () => openForm(null));

  root.querySelectorAll("[data-edit-lesson]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lesson = lessons.find((item) => item.id === Number(btn.dataset.editLesson));
      if (lesson) openForm(lesson);
    });
  });

  root.querySelectorAll("[data-delete-lesson]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const lesson = lessons.find((item) => item.id === Number(btn.dataset.deleteLesson));
      if (!lesson) return;
      const ok = await confirmDialog("Darsni o'chirish", `"${lesson.title}" darsi o'chiriladi. Qolgan darslar tartib raqamlari yangilanadi.`);
      if (!ok) return;
      try {
        await del(`/admin/lessons/${lesson.id}`);
        toast("Dars o'chirildi", "success");
        window.__bnRerender?.();
      } catch (error) {
        toast(error.message, "error");
      }
    });
  });
}
