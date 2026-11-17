import { get } from "../api.js";
import { icon } from "../icons.js";
import {
  bindRetry, courseCard, courseCover, errorState, esc, fmtNumber,
  sectionHead, stars, avatar, skeletonCourseGrid, go,
} from "../ui.js";

const FAQ = [
  ["Kurslarni qanday sotib olaman?", "Kurs sahifasiga kirib \"Kursga yozilish\" tugmasini bosishingiz kifoya. Ro'yxatdan o'tgan bo'lsangiz, kurs darhol shaxsiy kabinetingizda paydo bo'ladi va barcha darslarga kirish huquqiga ega bo'lasiz."],
  ["Darslarni qancha vaqt ko'rishim mumkin?", "Kursga bir marta yozilganingizdan so'ng materiallarga cheksiz muddatda kirish huquqiga ega bo'lasiz. Darslarni o'zingizga qulay vaqtda, istalgan qurilmadan ko'rishingiz mumkin."],
  ["Sertifikat beriladimi?", "Ha. Kursning barcha darslarini yakunlaganingizdan so'ng sertifikat avtomatik tarzda hisoblanadi va shaxsiy kabinetingizda ko'rinadi. Sertifikatni ish beruvchiga taqdim etishingiz mumkin."],
  ["To'lov usullari qanday?", "Hozircha demo rejimida to'lov talab qilinmaydi — kursga bevosita yozilishingiz mumkin. To'liq versiyada Payme, Click va bank kartasi orqali to'lov qo'llab-quvvatlanadi."],
  ["Kursni tugatmasam nima bo'ladi?", "Hech qanday muammo yo'q. Taraqqiyotingiz saqlanadi va istalgan vaqtda qolgan joyingizdan davom ettirishingiz mumkin. Darslar sizni kutadi."],
  ["O'qituvchi bilan bog'lanish mumkinmi?", "Ha, kurs sahifasida o'qituvchi profili mavjud. Savollaringizni platforma orqali yuborishingiz yoki mentorning ochiq master-klasslarida qatnashishingiz mumkin."],
];

function heroVisual(course) {
  if (!course) return "";
  return `<div class="hero-visual">
    <div class="hero-main-card">
      ${courseCover(course)}
      <div class="hero-card-body">
        <span class="hero-card-label">Eng mashhur kurs</span>
        <h3>${esc(course.title)}</h3>
        ${stars(course.rating, 13, course.reviews_count)}
        <div class="hero-card-foot">
          <div class="instructor-mini">${avatar(course.instructor, 30)}<span>${esc(course.instructor.name)}</span></div>
          <div class="price-wrap"><span class="price">${course.price === 0 ? "Bepul" : fmtNumber(course.price) + " so'm"}</span></div>
        </div>
      </div>
    </div>
    <div class="float-card float-rating">
      <span class="float-icon">${icon("star", 18)}</span>
      <div><strong>${course.rating.toFixed(1)} / 5</strong><span>${fmtNumber(course.reviews_count)} sharh asosida</span></div>
    </div>
    <div class="float-card float-students">
      <div class="avatar-group">
        ${avatar({ name: "Aziza H", avatar_color: "#ec4899" }, 28)}
        ${avatar({ name: "Bobur A", avatar_color: "#0ea5e9" }, 28)}
        ${avatar({ name: "Malika Y", avatar_color: "#10b981" }, 28)}
      </div>
      <div><strong>${fmtNumber(course.students_count)}+</strong><span>o'quvchi o'rganmoqda</span></div>
    </div>
    <div class="float-card float-progress">
      <div class="progress-row"><strong>Kurs taraqqiyoti</strong><span>68%</span></div>
      <div class="progress"><span style="width:68%"></span></div>
    </div>
  </div>`;
}

function homeHTML(data) {
  const { stats, categories, featured, newest, instructors, testimonials } = data;
  const heroCourse = featured[0] || newest[0];
  const courses = (featured.length ? featured : newest).slice(0, 6);

  return `<div class="page home-page">
    <section class="hero">
      <span class="hero-orb orb-1"></span>
      <span class="hero-orb orb-2"></span>
      <span class="hero-orb orb-3"></span>
      <div class="container hero-grid">
        <div class="hero-copy">
          <span class="hero-pill"><span class="dot"></span> O'zbekistondagi zamonaviy ta'lim platformasi</span>
          <h1>Kelajagingizni <span class="gradient-text">bilim</span> bilan quring</h1>
          <p class="hero-sub">Dasturlash, dizayn, marketing va boshqa yo'nalishlarda amaliy kurslar. Tajribali mentorlar bilan o'z sur'atingizda o'rganing va karyerangizni yangi bosqichga olib chiqing.</p>
          <form class="hero-search" data-hero-search>
            <span class="search-icon">${icon("search", 19)}</span>
            <input name="q" type="search" placeholder="Qaysi kursni o'rganmoqchisiz?" aria-label="Kurs qidirish" autocomplete="off">
            <button class="btn btn-primary" type="submit">Qidirish</button>
          </form>
          <div class="hero-tags">
            <span>Ommabop:</span>
            <a href="#/courses?q=python">Python</a>
            <a href="#/courses?q=dizayn">UI/UX</a>
            <a href="#/courses?q=ingliz">Ingliz tili</a>
            <a href="#/courses?q=marketing">Marketing</a>
          </div>
          <div class="hero-stats">
            <div><strong>${stats.courses}+</strong><span>Amaliy kurslar</span></div>
            <div><strong>${fmtNumber(stats.students)}+</strong><span>O'quvchilar</span></div>
            <div><strong>${stats.instructors}+</strong><span>Mentorlar</span></div>
            <div><strong>${stats.rating.toFixed(1)}</strong><span>O'rtacha reyting</span></div>
          </div>
        </div>
        ${heroVisual(heroCourse)}
      </div>
    </section>

    <section class="section">
      <div class="container">
        ${sectionHead("Yo'nalishlar", "O'zingizga mos sohani tanlang", "Har bir yo'nalish bo'yicha amaliy ko'nikmalar va real loyihalar.",
          `<a class="btn btn-outline" href="#/courses">Barcha kurslar ${icon("arrow-right", 17)}</a>`)}
        <div class="category-grid">
          ${categories.map((cat) => `<a class="category-card" href="#/courses?category=${esc(cat.slug)}" style="--cat:${esc(cat.color)}">
            <span class="cat-icon">${icon(cat.icon, 22)}</span>
            <div>
              <h3>${esc(cat.name)}</h3>
              <p>${esc(cat.description)}</p>
              <span class="cat-count">${cat.courses_count} ta kurs</span>
            </div>
            <span class="cat-arrow">${icon("arrow-up-right", 17)}</span>
          </a>`).join("")}
        </div>
      </div>
    </section>

    <section class="section section-soft">
      <div class="container">
        ${sectionHead("Ommabop kurslar", "Eng ko'p tanlangan kurslar", "Minglab o'quvchilar allaqachon o'z bilimlarini oshirmoqda.",
          `<a class="btn btn-ghost" href="#/courses">Hammasini ko'rish ${icon("arrow-right", 16)}</a>`)}
        <div class="course-grid" data-home-courses>
          ${courses.map((course) => courseCard(course)).join("")}
        </div>
        <div class="text-center" style="margin-top:28px">
          <a class="btn btn-primary btn-lg" href="#/courses">Katalogni ko'rish ${icon("arrow-right", 18)}</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        ${sectionHead("Afzalliklar", "Nega aynan BilimNova?", "Biz shunchaki video darslar emas, natijaga yo'naltirilgan ta'lim tajribasini yaratamiz.")}
        <div class="feature-grid">
          <div class="feature-card" style="--feature-color:#6366f1">
            <span class="feature-icon">${icon("zap", 24)}</span>
            <h3>Amaliy yo'naltirilgan</h3>
            <p>Har bir dars real misollar va topshiriqlar bilan mustahkamlanadi. Nazariya emas — amaliyot ustuvor.</p>
          </div>
          <div class="feature-card" style="--feature-color:#10b981">
            <span class="feature-icon">${icon("award", 24)}</span>
            <h3>Tan olinadigan sertifikat</h3>
            <p>Kursni muvaffaqiyatli yakunlab, bilimingizni tasdiqlovchi sertifikatga ega bo'lasiz.</p>
          </div>
          <div class="feature-card" style="--feature-color:#f97316">
            <span class="feature-icon">${icon("users", 24)}</span>
            <h3>Tajribali mentorlar</h3>
            <p>Sohasida yillar davomida ishlayotgan mutaxassislardan bevosita bilim oling.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section section-soft">
      <div class="container">
        ${sectionHead("Qanday ishlaydi", "3 oddiy qadamda boshlang", "")}
        <div class="steps">
          <div class="step-card">
            <span class="step-num">01</span>
            <h3>Kursni tanlang</h3>
            <p>Katalogdan o'zingizga kerakli yo'nalishni toping va kurs tafsilotlari bilan tanishing.</p>
          </div>
          <div class="step-card">
            <span class="step-num">02</span>
            <h3>Ro'yxatdan o'ting</h3>
            <p>Bir necha soniyada hisob yarating yoki mavjud hisobingizga kirib kursga yozilishingiz mumkin.</p>
          </div>
          <div class="step-card">
            <span class="step-num">03</span>
            <h3>O'rganishni boshlang</h3>
            <p>Darslarni o'z sur'atingizda ko'ring, taraqqiyotingizni kuzatib boring va sertifikat oling.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        ${sectionHead("Mentorlar", "Sohasining eng yaxshi mutaxassislari", "Har bir mentor real loyihalar tajribasiga ega amaliyotchi.",
          `<a class="btn btn-ghost" href="#/instructors">Barcha mentorlar ${icon("arrow-right", 16)}</a>`)}
        <div class="instructor-grid">
          ${instructors.map((inst) => `<div class="instructor-card">
            ${avatar(inst, 66)}
            <h3>${esc(inst.name)}</h3>
            <div class="inst-title">${esc(inst.title)}</div>
            <p>${esc(inst.bio)}</p>
            <div class="inst-stats">
              <span>${icon("star", 12)} ${inst.rating.toFixed(1)}</span>
              <span>${icon("book", 12)} ${inst.courses_count} kurs</span>
              <span>${icon("users", 12)} ${fmtNumber(inst.students_count)}</span>
            </div>
          </div>`).join("")}
        </div>
      </div>
    </section>

    <section class="section section-soft">
      <div class="container">
        ${sectionHead("Fikrlar", "O'quvchilarimiz nima deydi?", "Haqiqiy natijalar va haqiqiy tajribalar.")}
        <div class="testimonial-grid">
          ${testimonials.map((t) => `<div class="testimonial-card">
            <span class="testimonial-quote">${icon("quote", 30)}</span>
            <div>${stars(t.rating, 13)}</div>
            <p class="testimonial-text">“${esc(t.comment)}”</p>
            <div class="testimonial-user">
              ${avatar({ name: t.user_name, avatar_color: t.avatar_color }, 38)}
              <div><strong>${esc(t.user_name)}</strong><span>${esc(t.course_title)}</span></div>
            </div>
          </div>`).join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        ${sectionHead("Savollar", "Ko'p so'raladigan savollar", "")}
        <div class="faq-list">
          ${FAQ.map(([q, a], i) => `<details class="faq-item" ${i === 0 ? "open" : ""}>
            <summary>${esc(q)} <span class="faq-icon">${icon("plus", 19)}</span></summary>
            <div class="faq-answer">${esc(a)}</div>
          </details>`).join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="cta-panel">
          <div>
            <span class="eyebrow" style="color:#a5f3fc">Bugun boshlang</span>
            <h2>Bilim sari birinchi qadamni tashlang</h2>
            <p>Ro'yxatdan o'ting va 13 dan ortiq amaliy kurslarga cheklovsiz kirish imkoniyatiga ega bo'ling. Birinchi dars — bepul.</p>
            <div class="cta-actions">
              <a class="btn btn-light btn-lg" href="#/register">Ro'yxatdan o'tish ${icon("arrow-right", 18)}</a>
              <a class="btn btn-lg" style="background:rgba(255,255,255,.12);color:#fff;border-color:rgba(255,255,255,.24)" href="#/courses">Kurslarni ko'rish</a>
            </div>
          </div>
          <div class="newsletter-box">
            <h3>Yangiliklardan xabardor bo'ling</h3>
            <p>Yangi kurslar va foydali materiallar haqida birinchilardan bo'lib biling.</p>
            <form class="newsletter" data-newsletter>
              <input type="email" placeholder="Email manzilingiz" aria-label="Email" required>
              <button class="btn btn-light" type="submit">Obuna</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  </div>`;
}

export async function render(root) {
  document.title = "BilimNova — Onlayn o'quv kurslari platformasi";
  root.innerHTML = `<div class="page"><section class="section"><div class="container">${skeletonCourseGrid(3)}</div></section></div>`;
  try {
    const data = await get("/home");
    root.innerHTML = homeHTML(data);
    const form = root.querySelector("[data-hero-search]");
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      const q = form.querySelector("input").value.trim();
      go(`/courses${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    });
  } catch (error) {
    root.innerHTML = `<div class="page"><div class="container" style="padding:60px 0">${errorState(error.message)}</div></div>`;
    bindRetry(root);
  }
}
