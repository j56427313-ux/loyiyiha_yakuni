import { icon } from "../icons.js";

export async function render(root) {
  document.title = "Sahifa topilmadi — BilimNova";
  root.innerHTML = `<div class="page notfound">
    <div class="notfound-box">
      <div class="notfound-code">404</div>
      <h1>Sahifa topilmadi</h1>
      <p>Kechirasiz, siz izlagan sahifa mavjud emas yoki ko'chirilgan. Quyidagi havolalar orqali davom eting.</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <a class="btn btn-primary" href="#/">${icon("home", 17)} Bosh sahifa</a>
        <a class="btn btn-outline" href="#/courses">${icon("search", 17)} Kurslar katalogi</a>
      </div>
      <div class="tag-row" style="justify-content:center;margin-top:26px">
        <a class="badge badge-neutral" href="#/instructors">O'qituvchilar</a>
        <a class="badge badge-neutral" href="#/about">Biz haqimizda</a>
        <a class="badge badge-neutral" href="#/dashboard">Shaxsiy kabinet</a>
        <a class="badge badge-neutral" href="#/login">Kirish</a>
      </div>
    </div>
  </div>`;
}
