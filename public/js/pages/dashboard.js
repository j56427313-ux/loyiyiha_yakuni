import { get } from "../api.js";
import { icon } from "../icons.js";
import { state } from "../store.js";
import {
  avatar, bindRetry, courseCover, emptyState, errorState, esc, fmtNumber,
  go, stars, toast,
} from "../ui.js";

const WEEKDAYS = ["Yak", "Du", "Se", "Cho", "Pay", "Ju", "Sha"];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 6) return "Xayrli tun";
  if (hour < 12) return "Xayrli tong";
  if (hour < 18) return "Xayrli kun";
  return "Xayrli kechqurun";
}

function roleLabel(role) {
  return { admin: "Administrator", instructor: "O'qituvchi", student: "O'quvchi" }[role] || "Foydalanuvchi";
}

function continueCard(course) {
  const percent = course.percent || 0;
  const done = percent >= 100;
  return `<div class="continue-card">
    <a class="continue-cover" href="#/course/${course.id}">${courseCover(course, { compact: true })}</a>
    <div class="continue-body">
      <h3><a href="#/course/${course.id}">${esc(course.title)}</a></h3>
      <div class="progress-line">
        <div class="progress"><span style="width:${percent}%"></span></div>
        <span>${percent}%</span>
      </div>
      <div class="continue-meta">${course.completed_lessons} / ${course.lessons_count} dars · ${
        done ? "Kurs yakunlangan 🎉" : `Keyingi: ${esc(course.next_lesson?.title || "—")}`
      }</div>
      <div class="continue-actions">
        <a class="btn btn-primary btn-sm" href="#/learn/${course.id}${course.next_lesson ? `/${course.next_lesson.id}` : ""}">
          ${icon("play", 14)} ${done ? "Qayta ko'rish" : percent > 0 ? "Davom ettirish" : "Boshlash"}
        </a>
        <a class="btn btn-outline btn-sm" href="#/course/${course.id}">Batafsil</a>
      </div>
    </div>
  </div>`;
}

function activityChart(activity) {
  const max = Math.max(1, ...activity.map((day) => day.count));
  return `<div class="activity-bars">
    ${activity.map((day) => {
      const date = new Date(day.date + "T00:00:00");
      const height = Math.max(4, Math.round((day.count / max) * 100));
      return `<div class="activity-bar" title="${day.date}: ${day.count} dars">
        <strong>${day.count || ""}</strong>
        <div class="bar-col" style="height:${height}%"></div>
        <span>${WEEKDAYS[date.getDay()]}</span>
      </div>`;
    }).join("")}
  </div>`;
}

function recItem(course) {
  return `<a class="rec-item" href="#/course/${course.id}">
    <div class="rec-cover">${courseCover(course, { compact: true })}</div>
    <div style="min-width:0">
      <h4>${esc(course.title)}</h4>
      <span>${esc(course.category.name)} · ${course.lessons_count} dars</span>
    </div>
  </a>`;
}

function dashboardHTML(data, recommended) {
  const user = state.user;
  const stats = data.stats;
  const courses = data.courses;
  const active = courses.filter((course) => (course.percent || 0) < 100);
  const showList = (active.length ? active : courses).slice(0, 4);

  return `<div class="page dash-page">
    <div class="container">
      <div class="dash-top">
        <div>
          <span class="eyebrow">Shaxsiy kabinet</span>
          <h1>${greeting()}, ${esc(user.name.split(" ")[0])}! 👋</h1>
          <p>Bugun o'rganishni davom ettirish uchun ajoyib kun.</p>
        </div>
        <div style="display:flex;gap:9px;flex-wrap:wrap">
          <a class="btn btn-outline" href="#/courses">${icon("search", 16)} Kurslar katalogi</a>
          <a class="btn btn-primary" href="#/profile">${icon("settings", 16)} Profil</a>
        </div>
      </div>

      <div class="stat-grid">
        <div class="stat-card">
          <span class="stat-icon" style="--stat-color:#6366f1">${icon("book-open", 21)}</span>
          <div><strong>${stats.enrolled}</strong><span>Yozilgan kurslar</span></div>
        </div>
        <div class="stat-card">
          <span class="stat-icon" style="--stat-color:#10b981">${icon("check-circle", 21)}</span>
          <div><strong>${stats.completed_lessons}</strong><span>Yakunlangan darslar</span></div>
        </div>
        <div class="stat-card">
          <span class="stat-icon" style="--stat-color:#f59e0b">${icon("clock", 21)}</span>
          <div><strong>${String(stats.hours_learned).replace(".", ",")}</strong><span>Soat o'rganildi</span></div>
        </div>
        <div class="stat-card">
          <span class="stat-icon" style="--stat-color:#8b5cf6">${icon("award", 21)}</span>
          <div><strong>${stats.certificates}</strong><span>Sertifikatlar</span></div>
        </div>
      </div>

      <div class="dash-grid">
        <div>
          <div class="panel">
            <div class="panel-head">
              <h2>${icon("play", 18)} O'rganishni davom ettiring</h2>
              <a href="#/courses">Yangi kurs ${icon("arrow-right", 14)}</a>
            </div>
            ${showList.length
              ? `<div class="continue-list">${showList.map((course) => continueCard(course)).join("")}</div>`
              : emptyState("book-open", "Hali kurs yo'q", "Katalogdan o'zingizga mos kursni tanlang va o'rganishni boshlang.",
                  `<a class="btn btn-primary" href="#/courses">Kurslarni ko'rish</a>`)}
          </div>

          <div class="panel">
            <div class="panel-head">
              <h2>${icon("trend-up", 18)} Haftalik faollik</h2>
              <span class="badge badge-primary">${stats.completed_lessons} ta dars</span>
            </div>
            ${activityChart(stats.activity)}
          </div>
        </div>

        <div>
          <div class="panel">
            <div class="profile-mini">
              ${avatar(user, 68)}
              <h3>${esc(user.name)}</h3>
              <p>${esc(user.email)}</p>
              <span class="badge badge-primary">${roleLabel(user.role)}</span>
              <div class="mini-stats">
                <div><strong>${stats.enrolled}</strong><span>Kurslar</span></div>
                <div><strong>${stats.reviews}</strong><span>Sharhlar</span></div>
                <div><strong>${stats.certificates}</strong><span>Sertifikat</span></div>
              </div>
              <div style="margin-top:14px">
                <a class="btn btn-outline btn-block btn-sm" href="#/profile">${icon("settings", 15)} Sozlamalar</a>
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-head">
              <h2>${icon("sparkles", 18)} Siz uchun</h2>
              <a href="#/courses">Barchasi</a>
            </div>
            <div class="rec-list">
              ${recommended.length
                ? recommended.map((course) => recItem(course)).join("")
                : `<p class="muted" style="font-size:12.5px">Tavsiyalar yuklanmoqda...</p>`}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

export async function render(root) {
  document.title = "Shaxsiy kabinet — BilimNova";
  if (!state.user) {
    go("/login?next=%2Fdashboard");
    return;
  }

  root.innerHTML = `<div class="page dash-page"><div class="container" style="padding:60px 0">
    <div class="skeleton skeleton-line w40 tall" style="margin-bottom:24px"></div>
    <div class="skeleton skeleton-line w90" style="margin-bottom:12px"></div>
    <div class="skeleton skeleton-line w70"></div>
  </div></div>`;

  try {
    const [stats, courses, recs] = await Promise.all([
      get("/my/stats"),
      get("/my/courses"),
      get("/courses?sort=rating&limit=6").catch(() => ({ items: [] })),
    ]);
    const enrolledIds = new Set(courses.items.map((course) => course.id));
    const recommended = (recs.items || []).filter((course) => !enrolledIds.has(course.id)).slice(0, 4);
    root.innerHTML = dashboardHTML({ stats, courses: courses.items }, recommended);
  } catch (error) {
    if (error.status === 401) {
      go("/login?next=%2Fdashboard");
      return;
    }
    root.innerHTML = `<div class="page"><div class="container" style="padding:60px 0">${errorState(error.message)}</div></div>`;
    bindRetry(root);
  }
}
