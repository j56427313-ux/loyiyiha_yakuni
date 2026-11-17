/* UI yordamchilari: formatlash, komponentlar, header/footer, toast va modal */
import { icon, logoMark } from "./icons.js";
import { post } from "./api.js";
import { state, setUser } from "./store.js";

/* ----------------------------- Formatlash ------------------------------ */
export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[ch]));
}

export function fmtNumber(value) {
  return String(Number(value) || 0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function fmtPrice(value) {
  const n = Number(value) || 0;
  if (n === 0) return "Bepul";
  return `${fmtNumber(n)} so'm`;
}

export function fmtDuration(minutes) {
  const total = Number(minutes) || 0;
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours >= 1) {
    return mins ? `${hours} soat ${mins} daq` : `${hours} soat`;
  }
  return `${mins} daqiqa`;
}

export function fmtHours(minutes) {
  const hours = Math.round((Number(minutes) || 0) / 60 * 10) / 10;
  return `${String(hours).replace(".", ",")} soat`;
}

const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];

export function fmtDate(iso) {
  if (!iso) return "—";
  const date = new Date(String(iso).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return String(iso);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}, ${date.getFullYear()}`;
}

export function fmtDateTime(iso) {
  if (!iso) return "—";
  const date = new Date(String(iso).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return String(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getDate()} ${MONTHS[date.getMonth()]}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function initials(name) {
  return String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export function discountPercent(course) {
  if (!course?.old_price || course.old_price <= course.price) return 0;
  return Math.round((1 - course.price / course.old_price) * 100);
}

/* ----------------------------- Komponentlar ---------------------------- */
export function avatar(user, size = 38, extraClass = "") {
  const name = typeof user === "string" ? user : user?.name || "?";
  const color = (typeof user === "object" && user?.avatar_color) || "#6366f1";
  return `<span class="avatar ${extraClass}" style="--av:${esc(color)};width:${size}px;height:${size}px;font-size:${Math.max(11, Math.round(size * 0.36))}px">${esc(initials(name))}</span>`;
}

export function stars(rating = 0, size = 14, count = null) {
  const value = Number(rating) || 0;
  const full = Math.round(value);
  let html = `<span class="stars" title="${value} / 5">`;
  for (let i = 1; i <= 5; i += 1) {
    html += `<span class="star ${i <= full ? "filled" : ""}">${icon("star", size)}</span>`;
  }
  html += `<span class="stars-value">${value.toFixed(1)}</span>`;
  if (count !== null) html += `<span class="stars-count">(${fmtNumber(count)})</span>`;
  html += "</span>";
  return html;
}

export function courseCover(course, options = {}) {
  const accent = course?.accent || "#6366f1";
  const iconName = course?.icon || "book";
  const compact = options.compact ? " compact" : "";
  const large = options.large ? " large" : "";
  const iconSize = options.large ? 44 : options.compact ? 30 : 38;
  return `<div class="course-cover${compact}${large}" style="--accent:${esc(accent)}">
    <div class="cover-pattern"></div>
    <div class="cover-glow"></div>
    <span class="cover-category">${esc(course?.category?.name || "Kurs")}</span>
    <span class="cover-level">${esc(course?.level || "")}</span>
    <span class="cover-icon">${icon(iconName, iconSize)}</span>
    <span class="cover-ring"></span>
  </div>`;
}

export function courseCard(course, options = {}) {
  const discount = discountPercent(course);
  const priceHtml = course.price === 0
    ? `<span class="price free">Bepul</span>`
    : `<span class="price">${fmtPrice(course.price)}</span>
       ${course.old_price > course.price ? `<span class="price-old">${fmtPrice(course.old_price)}</span>` : ""}`;
  return `<article class="course-card${options.className ? " " + options.className : ""}">
    <a class="course-cover-link" href="#/course/${course.id}" aria-label="${esc(course.title)}">
      ${courseCover(course)}
      ${discount ? `<span class="discount-badge">-${discount}%</span>` : ""}
    </a>
    <div class="course-card-body">
      <div class="course-topline">
        <a class="badge badge-soft" style="--badge-color:${esc(course.accent)}" href="#/courses?category=${esc(course.category.slug)}">${esc(course.category.name)}</a>
        <span class="level-pill">${esc(course.level)}</span>
      </div>
      <a class="course-title" href="#/course/${course.id}">${esc(course.title)}</a>
      <p class="course-summary">${esc(course.summary)}</p>
      <div class="course-rating">${stars(course.rating, 13, course.reviews_count)}</div>
      <div class="course-meta-row">
        <span>${icon("clock", 15)} ${fmtDuration(course.duration_minutes)}</span>
        <span>${icon("layers", 15)} ${course.lessons_count} dars</span>
        <span>${icon("users", 15)} ${fmtNumber(course.students_count)}</span>
      </div>
      <div class="course-footer">
        <div class="instructor-mini">
          ${avatar(course.instructor, 30)}
          <span>${esc(course.instructor.name)}</span>
        </div>
        <div class="price-wrap">${priceHtml}</div>
      </div>
    </div>
  </article>`;
}

export function skeletonCourseGrid(count = 6) {
  let html = "";
  for (let i = 0; i < count; i += 1) {
    html += `<div class="course-card skeleton-card">
      <div class="skeleton skeleton-cover"></div>
      <div class="course-card-body">
        <div class="skeleton skeleton-line w40"></div>
        <div class="skeleton skeleton-line w90"></div>
        <div class="skeleton skeleton-line w70"></div>
        <div class="skeleton skeleton-line w50"></div>
      </div>
    </div>`;
  }
  return `<div class="course-grid">${html}</div>`;
}

export function skeletonHeader(lines = 3) {
  let html = `<div class="skeleton-sections">`;
  for (let i = 0; i < lines; i += 1) {
    html += `<div class="skeleton skeleton-line ${i === 0 ? "w50 tall" : "w90"}"></div>`;
  }
  html += `</div>`;
  return html;
}

export function sectionHead(eyebrow, title, subtitle, action = "") {
  return `<div class="section-head">
    <div>
      ${eyebrow ? `<span class="eyebrow">${esc(eyebrow)}</span>` : ""}
      <h2 class="section-title">${title}</h2>
      ${subtitle ? `<p class="section-sub">${esc(subtitle)}</p>` : ""}
    </div>
    ${action ? `<div class="section-action">${action}</div>` : ""}
  </div>`;
}

export function emptyState(iconName, title, text, action = "") {
  return `<div class="empty-state">
    <span class="empty-icon">${icon(iconName, 30)}</span>
    <h3>${esc(title)}</h3>
    <p>${esc(text)}</p>
    ${action}
  </div>`;
}

export function errorState(message, retry = true) {
  return `<div class="empty-state error-state">
    <span class="empty-icon">${icon("alert", 30)}</span>
    <h3>Xatolik yuz berdi</h3>
    <p>${esc(message)}</p>
    ${retry ? `<button class="btn btn-primary" data-retry>${icon("refresh", 17)} Qayta urinish</button>` : ""}
  </div>`;
}

export function bindRetry(root) {
  root.querySelectorAll("[data-retry]").forEach((btn) => {
    btn.addEventListener("click", () => window.__bnRerender?.());
  });
}

/* ------------------------------- Toast --------------------------------- */
export function toast(message, type = "success", title = null) {
  const stack = document.getElementById("toasts");
  if (!stack) return;
  const iconName = { success: "check-circle", error: "alert", info: "info", warning: "alert" }[type] || "info";
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span class="toast-icon">${icon(iconName, 20)}</span>
    <div class="toast-body">
      ${title ? `<strong>${esc(title)}</strong>` : ""}
      <span>${esc(message)}</span>
    </div>
    <button class="toast-close" aria-label="Yopish">${icon("x", 16)}</button>`;
  stack.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  const remove = () => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 220);
  };
  el.querySelector(".toast-close").addEventListener("click", remove);
  setTimeout(remove, 4200);
}

/* ------------------------------- Modal --------------------------------- */
export function openModal(html, options = {}) {
  const root = document.getElementById("modal-root");
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `<div class="modal ${options.size ? "modal-" + options.size : ""}" role="dialog" aria-modal="true">${html}</div>`;
  root.appendChild(backdrop);
  document.body.classList.add("modal-open");
  requestAnimationFrame(() => backdrop.classList.add("show"));

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    backdrop.classList.remove("show");
    setTimeout(() => {
      backdrop.remove();
      if (!root.querySelector(".modal-backdrop")) document.body.classList.remove("modal-open");
    }, 200);
  };
  const onKey = (event) => {
    if (event.key === "Escape") {
      close();
      document.removeEventListener("keydown", onKey);
    }
  };
  document.addEventListener("keydown", onKey);
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) close();
  });
  backdrop.querySelectorAll("[data-close]").forEach((btn) => btn.addEventListener("click", close));
  return { el: backdrop, close, q: (selector) => backdrop.querySelector(selector) };
}

export function confirmDialog(title, message, confirmText = "O'chirish") {
  return new Promise((resolve) => {
    const modal = openModal(`
      <div class="modal-head">
        <span class="modal-icon danger">${icon("alert", 22)}</span>
        <div><h3>${esc(title)}</h3><p>${esc(message)}</p></div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-outline" data-close>Bekor qilish</button>
        <button class="btn btn-danger" data-confirm>${esc(confirmText)}</button>
      </div>`, { size: "sm" });
    modal.q("[data-confirm]").addEventListener("click", () => {
      modal.close();
      resolve(true);
    });
    modal.el.addEventListener("click", (event) => {
      if (event.target === modal.el) resolve(false);
    });
    modal.el.querySelector("[data-close]").addEventListener("click", () => resolve(false));
  });
}

/* ------------------------------ Mavzu ---------------------------------- */
export function currentTheme() {
  return document.documentElement.getAttribute("data-theme") || "light";
}

export function themeToggleHTML() {
  return `<button class="icon-btn" type="button" data-theme-toggle aria-label="Mavzuni almashtirish" title="Mavzu">
    ${icon(currentTheme() === "dark" ? "sun" : "moon", 19)}
  </button>`;
}

export function bindTheme(root = document) {
  root.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", () => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("bn-theme", next); } catch (e) {}
      document.querySelectorAll("[data-theme-toggle]").forEach((b) => {
        b.innerHTML = icon(next === "dark" ? "sun" : "moon", 19);
      });
    });
  });
}

/* ------------------------------ Header --------------------------------- */
const NAV_ITEMS = [
  ["/", "Bosh sahifa"],
  ["/courses", "Kurslar"],
  ["/instructors", "O'qituvchilar"],
  ["/about", "Biz haqimizda"],
];

function activePath() {
  return (location.hash.replace(/^#/, "") || "/").split("?")[0];
}

function navHTML() {
  const path = activePath();
  return NAV_ITEMS.map(([href, label]) => {
    const active = href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
    return `<a class="nav-link ${active ? "active" : ""}" href="#${href}">${label}</a>`;
  }).join("");
}

function authAreaHTML(mobile = false) {
  const user = state.user;
  if (!user) {
    return `<div class="auth-area ${mobile ? "mobile-auth" : ""}">
      <a class="btn btn-ghost" href="#/login">Kirish</a>
      <a class="btn btn-primary" href="#/register">Ro'yxatdan o'tish</a>
    </div>`;
  }
  return `<div class="auth-area ${mobile ? "mobile-auth" : ""}">
    <a class="btn btn-ghost header-cabinet" href="#/dashboard">${icon("grid", 17)} <span>Kabinet</span></a>
    <div class="user-menu">
      <button class="user-trigger" type="button" aria-haspopup="true" aria-expanded="false">
        ${avatar(user, 34)}
        <span class="user-trigger-name">${esc(user.name.split(" ")[0])}</span>
        ${icon("chevron-down", 15)}
      </button>
      <div class="user-dropdown">
        <div class="user-dropdown-head">
          ${avatar(user, 40)}
          <div><strong>${esc(user.name)}</strong><span>${esc(user.email)}</span></div>
        </div>
        <a href="#/dashboard">${icon("grid", 17)} Mening kabinetim</a>
        <a href="#/profile">${icon("user", 17)} Profil sozlamalari</a>
        ${user.role === "admin" ? `<a href="#/admin">${icon("shield", 17)} Admin panel</a>` : ""}
        <button type="button" data-logout>${icon("logout", 17)} Chiqish</button>
      </div>
    </div>
  </div>`;
}

export function headerHTML() {
  return `<header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="#/">${logoMark(38)}<span class="brand-name">Bilim<span>Nova</span></span></a>
      <nav class="main-nav">${navHTML()}</nav>
      <div class="header-right">
        ${themeToggleHTML()}
        <div class="header-auth">${authAreaHTML()}</div>
        <button class="icon-btn mobile-toggle" type="button" data-mobile-toggle aria-label="Menyu">
          ${icon("menu", 22)}
        </button>
      </div>
    </div>
    <div class="mobile-nav" data-mobile-nav>
      <nav class="mobile-nav-links">${navHTML()}</nav>
      ${authAreaHTML(true)}
      <div class="mobile-nav-foot">${themeToggleHTML()} <span>Mavzu</span></div>
    </div>
  </header>`;
}

export function bindHeader(root = document) {
  bindTheme(root);

  const toggle = root.querySelector("[data-mobile-toggle]");
  const mobileNav = root.querySelector("[data-mobile-nav]");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", () => {
      mobileNav.classList.toggle("open");
      toggle.innerHTML = icon(mobileNav.classList.contains("open") ? "x" : "menu", 22);
    });
  }

  root.querySelectorAll(".user-menu").forEach((menu) => {
    const trigger = menu.querySelector(".user-trigger");
    if (!trigger) return;
    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = menu.classList.contains("open");
      document.querySelectorAll(".user-menu.open").forEach((m) => m.classList.remove("open"));
      menu.classList.toggle("open", !isOpen);
      trigger.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  root.querySelectorAll("[data-logout]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await post("/auth/logout");
      } catch (e) {}
      setUser(null);
      toast("Tizimdan chiqdingiz. Yana kutamiz!", "info");
      window.__bnNavigate?.("/");
    });
  });
}

/* ------------------------------ Footer --------------------------------- */
export function footerHTML() {
  const year = new Date().getFullYear();
  return `<footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        <a class="brand light" href="#/">${logoMark(40)}<span class="brand-name">Bilim<span>Nova</span></span></a>
        <p>Bilim va ko'nikmalarni zamonaviy usulda o'rgatuvchi onlayn platforma. Har bir inson o'z salohiyatini ro'yobga chiqarishga loyiq.</p>
        <div class="socials">
          <a href="#/about" aria-label="Telegram">${icon("telegram", 18)}</a>
          <a href="#/about" aria-label="Instagram">${icon("instagram", 18)}</a>
          <a href="#/about" aria-label="YouTube">${icon("youtube", 18)}</a>
          <a href="#/about" aria-label="LinkedIn">${icon("linkedin", 18)}</a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Platforma</h4>
        <a href="#/courses">Barcha kurslar</a>
        <a href="#/instructors">O'qituvchilar</a>
        <a href="#/about">Biz haqimizda</a>
        <a href="#/dashboard">Shaxsiy kabinet</a>
      </div>
      <div class="footer-col">
        <h4>Kategoriyalar</h4>
        <a href="#/courses?category=dasturlash">Dasturlash</a>
        <a href="#/courses?category=dizayn">Dizayn</a>
        <a href="#/courses?category=marketing">Marketing</a>
        <a href="#/courses?category=tillar">Chet tillari</a>
      </div>
      <div class="footer-col">
        <h4>Yordam</h4>
        <a href="#/about">Ko'p so'raladigan savollar</a>
        <a href="mailto:info@bilimnova.uz">info@bilimnova.uz</a>
        <a href="tel:+998901234567">+998 90 123 45 67</a>
        <button type="button" class="footer-link-btn" data-legal="terms">Foydalanish shartlari</button>
        <button type="button" class="footer-link-btn" data-legal="privacy">Maxfiylik siyosati</button>
      </div>
    </div>
    <div class="container footer-bottom">
      <span>© ${year} BilimNova. Barcha huquqlar himoyalangan.</span>
      <span class="footer-made">O'zbekistonda ${icon("heart", 14)} bilan yaratilgan</span>
    </div>
  </footer>`;
}

const LEGAL = {
  terms: {
    title: "Foydalanish shartlari",
    body: `<p>BilimNova platformasidan foydalanish orqali siz quyidagi shartlarga rozilik bildirasiz:</p>
      <ul class="legal-list">
        <li>Platformadagi barcha kurs materiallari faqat shaxsiy ta'lim maqsadida foydalanish uchun.</li>
        <li>Kurs kontentini nusxalash, tarqatish yoki tijoriy maqsadda ishlatish taqiqlanadi.</li>
        <li>Hisob ma'lumotlarining maxfiyligi foydalanuvchi zimmasida.</li>
        <li>Platforma kurs mazmuni va narxlarini oldindan ogohlantirgan holda o'zgartirish huquqini saqlaydi.</li>
      </ul>`,
  },
  privacy: {
    title: "Maxfiylik siyosati",
    body: `<p>Biz sizning shaxsiy ma'lumotlaringizni ehtiyotkorlik bilan saqlaymiz.</p>
      <ul class="legal-list">
        <li>Biz faqat xizmat ko'rsatish uchun zarur ma'lumotlarni to'playmiz: ism, email va o'quv natijalari.</li>
        <li>Ma'lumotlaringiz uchinchi shaxslarga sotilmaydi yoki berilmaydi.</li>
        <li>Parollar shifrlangan holda saqlanadi.</li>
        <li>Hisobingizni istalgan vaqtda o'chirishni so'rashingiz mumkin.</li>
      </ul>`,
  },
};

export function bindFooter(root = document) {
  root.querySelectorAll("[data-legal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = LEGAL[btn.dataset.legal];
      if (!item) return;
      openModal(`<div class="modal-head">
          <span class="modal-icon">${icon("file-text", 22)}</span>
          <div><h3>${item.title}</h3></div>
        </div>
        <div class="legal-body">${item.body}</div>
        <div class="modal-actions"><button class="btn btn-primary" data-close>Tushunarli</button></div>`,
        { size: "md" });
    });
  });

  root.querySelectorAll("[data-newsletter]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector("input");
      if (!input.value.includes("@")) {
        toast("Iltimos, to'g'ri email kiriting", "error");
        return;
      }
      input.value = "";
      toast("Yangiliklarga muvaffaqiyatli obuna bo'ldingiz!", "success");
    });
  });
}

/* --------------------------- Kichik yordamchi -------------------------- */
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

export function debounce(fn, delay = 320) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function queryString(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, value);
  });
  const str = search.toString();
  return str ? `?${str}` : "";
}

export function go(path) {
  if (window.__bnNavigate) window.__bnNavigate(path);
  else location.hash = "#" + path;
}
