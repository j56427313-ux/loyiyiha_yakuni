import { get } from "../api.js";
import { icon } from "../icons.js";
import {
  bindRetry, bindFooter, errorState, esc, fmtNumber,
} from "../ui.js";

const VALUES = [
  ["target", "#6366f1", "Natijaga yo'naltirilganlik",
    "Har bir kurs amaliy natijaga qaratilgan. Siz nafaqat nazariyani, balki real loyihalarda ishlash ko'nikmasini olasiz."],
  ["users", "#0ea5e9", "Jamoaviy qo'llab-quvvatlash",
    "Mentorlar savollaringizga javob beradi, hamjamiyat esa bir-birini rag'batlantiradi. O'rganish yolg'iz jarayon emas."],
  ["shield", "#10b981", "Sifat va ishonch",
    "Kontent muntazam yangilanadi, har bir dars sifat nazoratidan o'tadi. 30 kunlik kafolat bilan xavfsiz o'rganing."],
];

const TIMELINE = [
  ["2021", "G'oya va ilk qadamlar", "BilimNova kichik mentorlar jamoasi bilan bitta yo'nalishda — dasturlash bo'yicha birinchi kurslarini ishga tushirdi."],
  ["2022", "Platforma ishga tushdi", "O'quvchilar uchun shaxsiy kabinet, progress kuzatuvi va video darslar tizimi yaratildi. Ilk 1 000 o'quvchi qo'shildi."],
  ["2023", "Yo'nalishlar kengaydi", "Dizayn, marketing, biznes va chet tillari yo'nalishlari qo'shildi. Mentorlar soni 8 nafarga yetdi."],
  ["2024", "Hamjamiyat kuchaydi", "Sharhlar, reytinglar va amaliy topshiriqlar tizimi joriy etildi. O'quvchilar soni 10 000 dan oshdi."],
  ["2026", "Yangi bosqich", "Zamonaviy interfeys, tezkor platforma va sifatli kontent bilan O'zbekistondagi eng qulay onlayn ta'lim tajribasini yaratishda davom etamiz."],
];

function aboutHTML(stats) {
  const tiles = [
    ["book-open", "#6366f1", `${fmtNumber(stats.courses)} ta`, "Amaliy kurs"],
    ["users", "#0ea5e9", `${fmtNumber(stats.instructors)} nafar`, "Tajribali mentor"],
    ["graduation-cap", "#10b981", `${fmtNumber(stats.students)} ta`, "O'quvchi"],
    ["play", "#f59e0b", `${fmtNumber(stats.lessons)} ta`, "Video dars"],
  ];

  return `<div class="page">
    <div class="container">
      <div class="page-head" style="padding:34px 0 26px;max-width:760px">
        <span class="eyebrow">Biz haqimizda</span>
        <h1>Bilim — har bir insonning eng kuchli investitsiyasi</h1>
        <p>BilimNova — O'zbekistonda zamonaviy va amaliy onlayn ta'limni rivojlantirish uchun yaratilgan platforma. Bizning maqsadimiz sifatli bilimni har bir inson uchun ochiq va qulay qilish.</p>
      </div>

      <div class="about-story" style="padding-bottom:20px">
        <div>
          <h2>Bizning missiyamiz</h2>
          <p>Biz ishonamizki, sifatli ta'lim tug'ilgan joyga yoki imkoniyatlarga bog'liq bo'lmasligi kerak. Shu sababli BilimNova'da har bir kurs amaliyotchi mentorlar tomonidan, tushunarli o'zbek tilida va real hayotdagi misollar asosida tayyorlanadi.</p>
          <p>Platformamizda dasturlash, dizayn, marketing, biznes, chet tillari va boshqa yo'nalishlarda kurslar mavjud. Har bir dars qisqa, aniq va amaliy — siz o'rgangan bilimingizni darhol qo'llashingiz mumkin.</p>
          <p>Bizning eng katta yutug'imiz — o'quvchilarimizning natijalari. Ular yangi kasb egallaydi, loyihalarini ishga tushiradi va o'z orzulariga yaqinlashadi.</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px">
            <a class="btn btn-primary" href="#/courses">${icon("graduation-cap", 17)} Kurslarni ko'rish</a>
            <a class="btn btn-outline" href="#/instructors">${icon("users", 17)} Mentorlar bilan tanishish</a>
          </div>
        </div>
        <div class="about-visual">
          ${tiles.map(([iconName, color, value, label]) => `<div class="stat-tile">
            <span class="feature-icon" style="--feature-color:${color};width:42px;height:42px;border-radius:11px;margin:0">${icon(iconName, 20)}</span>
            <div><strong>${value}</strong><span>${label}</span></div>
          </div>`).join("")}
          <div class="stat-tile" style="grid-column:1/-1">
            <span class="feature-icon" style="--feature-color:#f59e0b;width:42px;height:42px;border-radius:11px;margin:0">${icon("star", 20)}</span>
            <div><strong>${stats.rating.toFixed(1)} / 5</strong><span>O'rtacha o'quvchi reytingi</span></div>
          </div>
        </div>
      </div>
    </div>

    <div class="section section-soft">
      <div class="container">
        <div class="section-head" style="text-align:center;flex-direction:column;align-items:center;margin-bottom:28px">
          <div>
            <span class="eyebrow">Qadriyatlarimiz</span>
            <h2 class="section-title">Bizni birlashtirgan tamoyillar</h2>
            <p class="section-sub" style="margin-left:auto;margin-right:auto">Har bir qaror va har bir dars shu tamoyillar asosida yaratiladi.</p>
          </div>
        </div>
        <div class="about-values">
          ${VALUES.map(([iconName, color, title, text]) => `<div class="value-card">
            <span class="feature-icon" style="--feature-color:${color}">${icon(iconName, 22)}</span>
            <h3>${esc(title)}</h3>
            <p>${esc(text)}</p>
          </div>`).join("")}
        </div>
      </div>
    </div>

    <div class="section">
      <div class="container">
        <div class="section-head" style="text-align:center;flex-direction:column;align-items:center;margin-bottom:30px">
          <div>
            <span class="eyebrow">Yo'limiz</span>
            <h2 class="section-title">BilimNova tarixi</h2>
            <p class="section-sub" style="margin-left:auto;margin-right:auto">Kichik g'oyadan minglab o'quvchilarning ishonchiga qadar.</p>
          </div>
        </div>
        <div class="timeline">
          ${TIMELINE.map(([year, title, text]) => `<div class="timeline-item">
            <span class="timeline-year">${year}</span>
            <div>
              <h4>${esc(title)}</h4>
              <p>${esc(text)}</p>
            </div>
          </div>`).join("")}
        </div>
      </div>
    </div>

    <div class="container" style="padding-bottom:40px">
      <div class="cta-panel">
        <div style="position:relative;z-index:1">
          <span class="eyebrow" style="color:#a5f3fc">Bugun boshlang</span>
          <h2>Kelajagingiz uchun birinchi qadamni qo'ying</h2>
          <p>Bepul ro'yxatdan o'ting, o'zingizga mos kursni tanlang va o'rganishni hoziroq boshlang.</p>
          <div class="cta-actions">
            <a class="btn btn-light btn-lg" href="#/register">${icon("arrow-right", 18)} Bepul boshlash</a>
            <a class="btn btn-outline btn-lg" style="border-color:rgba(255,255,255,.3);color:#fff;background:rgba(255,255,255,.08)" href="#/courses">Kurslar katalogi</a>
          </div>
        </div>
        <div class="newsletter-box">
          <h3>Yangiliklarga obuna</h3>
          <p>Yangi kurslar va chegirmalar haqida birinchi bo'lib bilib oling.</p>
          <form class="newsletter" data-newsletter>
            <input type="email" placeholder="Email manzilingiz" aria-label="Email" required>
            <button class="btn btn-light" type="submit">Obuna</button>
          </form>
        </div>
      </div>
    </div>
  </div>`;
}

export async function render(root) {
  document.title = "Biz haqimizda — BilimNova";

  root.innerHTML = `<div class="page"><div class="container" style="padding:60px 0">
    <div class="skeleton skeleton-line w40 tall" style="margin-bottom:18px"></div>
    <div class="skeleton skeleton-line w90" style="margin-bottom:12px"></div>
    <div class="skeleton skeleton-line w70"></div>
  </div></div>`;

  try {
    const data = await get("/home");
    root.innerHTML = aboutHTML(data.stats);
    bindFooter(root);
  } catch (error) {
    root.innerHTML = `<div class="page"><div class="container" style="padding:60px 0">${errorState(error.message)}</div></div>`;
    bindRetry(root);
  }
}
