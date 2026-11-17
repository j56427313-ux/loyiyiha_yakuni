import { get } from "../api.js";
import { icon } from "../icons.js";
import { loadCategories } from "../store.js";
import {
  bindRetry, courseCard, emptyState, errorState, esc, fmtNumber, go,
  queryString, skeletonCourseGrid,
} from "../ui.js";

const LEVELS = ["Boshlang'ich", "O'rta", "Yuqori"];
const SORTS = [
  ["popular", "Ommabopligi bo'yicha"],
  ["new", "Eng yangilari"],
  ["rating", "Reyting bo'yicha"],
  ["price_asc", "Narx: arzondan qimmatga"],
  ["price_desc", "Narx: qimmatdan arzonga"],
];

function currentFilters(ctx) {
  const q = ctx.query;
  return {
    q: q.q || "",
    category: q.category || "",
    level: q.level || "",
    price: q.price || "",
    sort: q.sort || "popular",
    page: Math.max(1, parseInt(q.page || "1", 10) || 1),
    instructor: q.instructor || "",
  };
}

function buildQuery(filters, extra = {}) {
  return queryString({
    q: filters.q,
    category: filters.category,
    level: filters.level,
    price: filters.price,
    sort: filters.sort !== "popular" ? filters.sort : "",
    page: filters.page > 1 ? filters.page : "",
    instructor: filters.instructor,
    ...extra,
  });
}

function pageList(current, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const set = new Set([1, pages, current, current - 1, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((n) => set.add(n));
  if (current >= pages - 2) [pages - 1, pages - 2, pages - 3].forEach((n) => set.add(n));
  const sorted = [...set].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push("...");
    out.push(n);
  });
  return out;
}

function chipsHTML(filters, categoryName, instructorName) {
  const chips = [];
  if (filters.q) chips.push({ label: `Qidiruv: "${filters.q}"`, key: "q" });
  if (filters.category) chips.push({ label: categoryName || "Kategoriya", key: "category" });
  if (filters.level) chips.push({ label: filters.level, key: "level" });
  if (filters.price) chips.push({ label: filters.price === "free" ? "Bepul" : "Pullik", key: "price" });
  if (filters.instructor && instructorName) chips.push({ label: `Mentor: ${instructorName}`, key: "instructor" });
  if (!chips.length) return "";
  return `<div class="active-filters">
    ${chips.map((chip) => {
      const cleared = { ...filters, [chip.key]: "", page: 1 };
      return `<span class="filter-chip">${esc(chip.label)}
        <a href="#/courses${buildQuery(cleared)}" aria-label="Filtrni olib tashlash">${icon("x", 13)}</a>
      </span>`;
    }).join("")}
    <a class="filter-chip" style="background:var(--surface-3);color:var(--muted)" href="#/courses">Hammasini tozalash</a>
  </div>`;
}

function filtersHTML(categories, filters) {
  return `<aside class="filters" data-filters-panel>
    <div class="filters-head">
      <h3>${icon("filter", 17)} Filtrlar</h3>
      <a href="#/courses" style="font-size:11.5px;font-weight:700;color:var(--primary)">Tozalash</a>
    </div>
    <form data-filters-form>
      <div class="filter-group">
        <h4>Kategoriya</h4>
        <label class="filter-option">
          <input type="radio" name="category" value="" ${!filters.category ? "checked" : ""}>
          <span>Barchasi</span>
        </label>
        ${categories.map((cat) => `<label class="filter-option">
          <input type="radio" name="category" value="${esc(cat.slug)}" ${filters.category === cat.slug ? "checked" : ""}>
          <span>${esc(cat.name)}</span>
          <span class="count">${cat.courses_count}</span>
        </label>`).join("")}
      </div>
      <div class="filter-group">
        <h4>Daraja</h4>
        <label class="filter-option">
          <input type="radio" name="level" value="" ${!filters.level ? "checked" : ""}>
          <span>Har qanday daraja</span>
        </label>
        ${LEVELS.map((level) => `<label class="filter-option">
          <input type="radio" name="level" value="${esc(level)}" ${filters.level === level ? "checked" : ""}>
          <span>${esc(level)}</span>
        </label>`).join("")}
      </div>
      <div class="filter-group">
        <h4>Narx</h4>
        <label class="filter-option">
          <input type="radio" name="price" value="" ${!filters.price ? "checked" : ""}>
          <span>Barchasi</span>
        </label>
        <label class="filter-option">
          <input type="radio" name="price" value="free" ${filters.price === "free" ? "checked" : ""}>
          <span>Bepul kurslar</span>
        </label>
        <label class="filter-option">
          <input type="radio" name="price" value="paid" ${filters.price === "paid" ? "checked" : ""}>
          <span>Pullik kurslar</span>
        </label>
      </div>
      <a class="btn btn-outline btn-block" style="margin-top:16px" href="#/courses">${icon("refresh", 15)} Filtrlarni tozalash</a>
    </form>
  </aside>`;
}

function paginationHTML(filters, pages) {
  if (pages <= 1) return "";
  const link = (page, label, disabled, active) => {
    if (disabled) return `<span class="page-btn" style="opacity:.4">${label}</span>`;
    const cls = active ? "page-btn active" : "page-btn";
    return `<a class="${cls}" href="#/courses${buildQuery({ ...filters, page })}">${label}</a>`;
  };
  return `<nav class="pagination" aria-label="Sahifalar">
    ${link(filters.page - 1, icon("chevron-left", 16), filters.page <= 1, false)}
    ${pageList(filters.page, pages).map((item) => item === "..."
      ? `<span class="page-dots">…</span>`
      : link(item, String(item), false, item === filters.page)).join("")}
    ${link(filters.page + 1, icon("chevron-right", 16), filters.page >= pages, false)}
  </nav>`;
}

export async function render(root, ctx) {
  const filters = currentFilters(ctx);
  document.title = "Kurslar — BilimNova";
  root.innerHTML = `<div class="page"><div class="container" style="padding:40px 0">${skeletonCourseGrid(6)}</div></div>`;

  try {
    const [categories, data, instructors] = await Promise.all([
      loadCategories(),
      get(`/courses${buildQuery(filters, { limit: 9 })}`),
      filters.instructor ? get("/instructors") : Promise.resolve({ items: [] }),
    ]);

    const category = categories.find((c) => c.slug === filters.category);
    const instructor = (instructors.items || []).find((i) => String(i.id) === String(filters.instructor));
    const title = category ? category.name : instructor ? `${instructor.name} kurslari` : "Barcha kurslar";
    const subtitle = category
      ? category.description
      : instructor
        ? `${instructor.name} tomonidan olib boriladigan barcha kurslar.`
        : "O'zingizga mos kursni toping va bugunoq o'rganishni boshlang. Barcha kurslar amaliy loyihalar asosida qurilgan.";

    root.innerHTML = `<div class="page">
      <header class="page-head">
        <div class="container">
          <div class="breadcrumb"><a href="#/">Bosh sahifa</a>${icon("chevron-right", 12)}<span>Kurslar</span></div>
          <h1>${esc(title)}</h1>
          <p>${esc(subtitle)}</p>
        </div>
      </header>
      <div class="container catalogue">
        ${filtersHTML(categories, filters)}
        <main class="catalogue-main">
          <div class="catalogue-toolbar">
            <form class="search-inline" data-search-form>
              ${icon("search", 17)}
              <input type="search" name="q" value="${esc(filters.q)}" placeholder="Kurs, mavzu yoki mentor..." aria-label="Qidirish">
            </form>
            <div class="toolbar-right">
              <button class="btn btn-outline filters-toggle" type="button" data-filters-toggle>${icon("filter", 15)} Filtrlar</button>
              <span class="result-count">${fmtNumber(data.total)} ta kurs</span>
              <select class="select" data-sort aria-label="Saralash">
                ${SORTS.map(([value, label]) => `<option value="${value}" ${filters.sort === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </div>
          </div>
          ${chipsHTML(filters, category?.name, instructor?.name)}
          ${data.items.length
            ? `<div class="course-grid">${data.items.map((course) => courseCard(course)).join("")}</div>`
            : emptyState("search", "Kurs topilmadi", "Qidiruv yoki filtrlarni o'zgartirib qayta urinib ko'ring.",
                `<a class="btn btn-primary" href="#/courses">Filtrlarni tozalash</a>`)}
          ${paginationHTML(filters, data.pages)}
        </main>
      </div>
    </div>`;

    const form = root.querySelector("[data-search-form]");
    const submitSearch = () => {
      const value = form.querySelector("input").value.trim();
      go(`/courses${buildQuery({ ...filters, q: value, page: 1 })}`);
    };
    form?.addEventListener("submit", (event) => { event.preventDefault(); submitSearch(); });

    let timer = null;
    form?.querySelector("input")?.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(submitSearch, 550);
    });

    root.querySelectorAll("[data-filters-form] input").forEach((input) => {
      input.addEventListener("change", () => {
        const formData = new FormData(root.querySelector("[data-filters-form]"));
        go(`/courses${buildQuery({
          ...filters,
          category: formData.get("category") || "",
          level: formData.get("level") || "",
          price: formData.get("price") || "",
          page: 1,
        })}`);
      });
    });

    root.querySelector("[data-sort]")?.addEventListener("change", (event) => {
      go(`/courses${buildQuery({ ...filters, sort: event.target.value, page: 1 })}`);
    });

    root.querySelector("[data-filters-toggle]")?.addEventListener("click", () => {
      root.querySelector("[data-filters-panel]")?.classList.toggle("open");
    });
  } catch (error) {
    root.innerHTML = `<div class="page"><div class="container" style="padding:60px 0">${errorState(error.message)}</div></div>`;
    bindRetry(root);
  }
}
