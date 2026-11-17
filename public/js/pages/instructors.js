import { get } from "../api.js";
import { icon } from "../icons.js";
import {
  avatar, bindRetry, emptyState, errorState, esc, fmtNumber, stars,
} from "../ui.js";

function instructorCard(person) {
  return `<div class="instructor-card">
    ${avatar(person, 76)}
    <h3>${esc(person.name)}</h3>
    <div class="inst-title">${esc(person.title || "Mentor")}</div>
    <p>${esc(person.bio || "Tajribali mutaxassis va amaliyotchi mentor.")}</p>
    <div class="inst-stats">
      <span>${icon("star", 12)} ${person.rating ? person.rating.toFixed(1) : "—"}</span>
      <span>${icon("users", 12)} ${fmtNumber(person.students_count)}</span>
      <span>${icon("book", 12)} ${person.courses_count}</span>
    </div>
    <a class="btn btn-outline btn-sm btn-block" style="margin-top:14px" href="#/courses?instructor=${person.id}">
      Kurslarini ko'rish ${icon("arrow-right", 14)}
    </a>
  </div>`;
}

export async function render(root) {
  document.title = "O'qituvchilar — BilimNova";

  root.innerHTML = `<div class="page"><div class="container" style="padding:60px 0">
    <div class="skeleton skeleton-line w40 tall" style="margin-bottom:18px"></div>
    <div class="skeleton skeleton-line w70"></div>
  </div></div>`;

  try {
    const data = await get("/instructors");
    const people = data.items || [];
    const totalStudents = people.reduce((sum, person) => sum + (person.students_count || 0), 0);

    root.innerHTML = `<div class="page" style="padding-bottom:20px">
      <div class="container">
        <div class="page-head page-head-row" style="padding:34px 0 26px">
          <div>
            <span class="eyebrow">Jamoa</span>
            <h1>O'qituvchilar va mentorlar</h1>
            <p>Har bir kursni sohasida tajribali, amaliyotchi mutaxassislar olib boradi. Ularning bilimi va tajribasi sizning muvaffaqiyatingizga xizmat qiladi.</p>
          </div>
          <div class="tag-row">
            <span class="badge badge-primary">${people.length} mentor</span>
            <span class="badge badge-neutral">${fmtNumber(totalStudents)} o'quvchi</span>
          </div>
        </div>

        ${people.length
          ? `<div class="instructor-grid">${people.map((person) => instructorCard(person)).join("")}</div>`
          : emptyState("users", "Hali o'qituvchilar yo'q", "Tez orada tajribali mentorlar jamoasi qo'shiladi.")}
      </div>
    </div>

    <div class="section section-soft" style="margin-top:44px">
      <div class="container" style="text-align:center">
        <span class="eyebrow">Hamkorlik</span>
        <h2 class="section-title" style="margin-bottom:10px">Bilimingizni ulashing</h2>
        <p class="muted" style="max-width:560px;margin:0 auto 20px;font-size:14px;line-height:1.7">
          Tajribali mutaxassissiz va o'z bilimingizni keng auditoriyaga yetkazmoqchimisiz?
          BilimNova jamoasiga mentor sifatida qo'shiling.
        </p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <a class="btn btn-primary" href="mailto:info@bilimnova.uz">${icon("mail", 17)} Ariza yuborish</a>
          <a class="btn btn-outline" href="#/about">${icon("info", 17)} Batafsil ma'lumot</a>
        </div>
      </div>
    </div>`;
  } catch (error) {
    root.innerHTML = `<div class="page"><div class="container" style="padding:60px 0">${errorState(error.message)}</div></div>`;
    bindRetry(root);
  }
}
