/* Ilova kirish nuqtasi: hash-router va sahifalarni ulash */
import { loadCategories, loadUser } from "./store.js";
import {
  bindFooter, bindHeader, errorState, footerHTML, headerHTML, scrollToTop,
} from "./ui.js";

import * as homePage from "./pages/home.js";
import * as coursesPage from "./pages/courses.js";
import * as coursePage from "./pages/course.js";
import * as instructorsPage from "./pages/instructors.js";
import * as aboutPage from "./pages/about.js";
import * as authPage from "./pages/auth.js";
import * as dashboardPage from "./pages/dashboard.js";
import * as profilePage from "./pages/profile.js";
import * as playerPage from "./pages/player.js";
import * as adminPage from "./pages/admin.js";
import * as notFoundPage from "./pages/notfound.js";

const ROUTES = [
  { match: /^\/$/, page: homePage },
  { match: /^\/courses\/?$/, page: coursesPage },
  { match: /^\/course\/(?<id>\d+)\/?$/, page: coursePage },
  { match: /^\/instructors\/?$/, page: instructorsPage },
  { match: /^\/about\/?$/, page: aboutPage },
  { match: /^\/login\/?$/, page: authPage, immersive: true, mode: "login" },
  { match: /^\/register\/?$/, page: authPage, immersive: true, mode: "register" },
  { match: /^\/dashboard\/?$/, page: dashboardPage },
  { match: /^\/profile\/?$/, page: profilePage },
  { match: /^\/learn\/(?<courseId>\d+)(?:\/(?<lessonId>\d+))?\/?$/, page: playerPage, immersive: true },
  { match: /^\/admin\/?$/, page: adminPage, immersive: true, view: "overview" },
  { match: /^\/admin\/courses\/?$/, page: adminPage, immersive: true, view: "courses" },
  { match: /^\/admin\/courses\/(?<id>\d+)\/lessons\/?$/, page: adminPage, immersive: true, view: "lessons" },
  { match: /^\/admin\/users\/?$/, page: adminPage, immersive: true, view: "users" },
  { match: /^\/admin\/enrollments\/?$/, page: adminPage, immersive: true, view: "enrollments" },
];

let renderToken = 0;

function parseLocation() {
  const raw = location.hash.replace(/^#/, "") || "/";
  const normalized = raw.startsWith("/") ? raw : `/${raw}`;
  const queryIndex = normalized.indexOf("?");
  const path = queryIndex === -1 ? normalized : normalized.slice(0, queryIndex);
  const query = {};
  if (queryIndex !== -1) {
    new URLSearchParams(normalized.slice(queryIndex + 1)).forEach((value, key) => {
      query[key] = value;
    });
  }
  return { path: path.replace(/\/{2,}/g, "/"), query };
}

function matchRoute(path) {
  for (const route of ROUTES) {
    const found = path.match(route.match);
    if (found) {
      return { route, params: { ...(found.groups || {}) } };
    }
  }
  return null;
}

export function navigate(path) {
  const target = path.startsWith("/") ? path : `/${path}`;
  const hash = `#${target}`;
  if (location.hash === hash) {
    renderRoute();
  } else {
    location.hash = hash;
  }
}

async function renderRoute() {
  const token = ++renderToken;
  const { path, query } = parseLocation();
  const matched = matchRoute(path);
  const page = matched ? matched.route.page : notFoundPage;
  const immersive = Boolean(matched?.route.immersive);
  const ctx = {
    params: matched ? matched.params : {},
    query,
    mode: matched?.route.mode || "",
    view: matched?.route.view || "",
  };

  document.body.classList.toggle("immersive", immersive);

  const app = document.getElementById("app");
  if (immersive) {
    app.innerHTML = `<div id="page-root"></div>`;
  } else {
    app.innerHTML = `${headerHTML()}<main id="page-root"></main>${footerHTML()}`;
    bindHeader(app);
    bindFooter(app);
  }

  const root = app.querySelector("#page-root");
  try {
    await page.render(root, ctx);
    if (token !== renderToken) return;
  } catch (error) {
    if (token !== renderToken) return;
    console.error("[BilimNova] sahifa xatosi:", error);
    document.title = "Xatolik — BilimNova";
    root.innerHTML = `<div class="page"><div class="container" style="padding:60px 0">${errorState(error.message || "Kutilmagan xatolik yuz berdi")}</div></div>`;
    root.querySelectorAll("[data-retry]").forEach((button) => {
      button.addEventListener("click", () => renderRoute());
    });
  }

  if (token !== renderToken) return;
  scrollToTop();
}

function boot() {
  window.__bnNavigate = navigate;
  window.__bnRerender = renderRoute;

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".user-menu")) {
      document.querySelectorAll(".user-menu.open").forEach((menu) => {
        menu.classList.remove("open");
        menu.querySelector(".user-trigger")?.setAttribute("aria-expanded", "false");
      });
    }
    if (event.target.closest(".mobile-nav a")) {
      document.querySelector("[data-mobile-nav]")?.classList.remove("open");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      document.querySelectorAll(".user-menu.open").forEach((menu) => {
        menu.classList.remove("open");
        menu.querySelector(".user-trigger")?.setAttribute("aria-expanded", "false");
      });
    }
  });

  window.addEventListener("hashchange", renderRoute);

  const app = document.getElementById("app");
  app.innerHTML = `<div style="min-height:100vh;display:grid;place-items:center;color:var(--muted);font-size:13px">Yuklanmoqda...</div>`;

  Promise.allSettled([loadUser(), loadCategories()]).then(() => {
    if (!location.hash) {
      history.replaceState(null, "", "#/");
    }
    renderRoute();
  });
}

boot();
