import { get, post } from "../api.js";
import { icon } from "../icons.js";
import { state } from "../store.js";
import {
  avatar, bindRetry, courseCard, courseCover, errorState, esc, fmtDate,
  fmtDuration, fmtNumber, fmtPrice, go, openModal, stars, toast,
} from "../ui.js";

function ratingBars(reviews) {
  const counts = [0, 0, 0, 0, 0];
  reviews.forEach((review) => {
    const index = Math.min(5, Math.max(1, review.rating)) - 1;
    counts[index] += 1;
  });
  return [5, 4, 3, 2, 1].map((rating) => {
    const count = counts[rating - 1];
    const percent = reviews.length ? Math.round((count * 100) / reviews.length) : 0;
    return `<div class="rating-bar">
      <span style="width:12px">${rating}</span>
      ${icon("star", 12)}
      <span class="bar"><span style="width:${percent}%"></span></span>
      <span style="width:26px;text-align:right">${count}</span>
    </div>`;
  }).join("");
}

function purchaseCard(course, data) {
  const discount = course.old_price > course.price
    ? Math.round((1 - course.price / course.old_price) * 100) : 0;
  const enrolled = data.enrolled;
  const isAdmin = state.user?.role === "admin";
  const priceHtml = course.price === 0
    ? `<span class="now free">Bepul</span>`
    : `<span class="now">${fmtPrice(course.price)}</span>
       ${course.old_price > course.price ? `<span class="old">${fmtPrice(course.old_price)}</span>` : ""}
       ${discount ? `<span class="off">-${discount}%</span>` : ""}`;

  let buttons;
  if (enrolled || isAdmin) {
    buttons = `<a class="btn btn-primary btn-lg btn-block" href="#/learn/${course.id}">
      ${icon("play", 17)} ${data.progress.percent > 0 ? "Davom ettirish" : "O'rganishni boshlash"}
    </a>`;
    if (data.progress.percent > 0) {
      buttons += `<div class="progress-line" style="margin:10px 0 4px">
        <div class="progress"><span style="width:${data.progress.percent}%"></span></div>
        <span>${data.progress.percent}%</span>
      </div>
      <div class="purchase-note">${data.progress.completed} / ${data.progress.total} dars yakunlangan</div>`;
    }
  } else {
    buttons = `<button class="btn btn-primary btn-lg btn-block" type="button" data-enroll>
      ${icon("graduation-cap", 18)} Kursga yozilish
    </button>
    <div class="purchase-note">${course.price === 0 ? "Bu kurs mutlaqo bepul" : "Demo rejimida to'lov talab qilinmaydi"}</div>`;
  }

  return `<aside class="purchase-card">
    <div class="purchase-price">${priceHtml}</div>
    <div class="purchase-hint">${icon("shield", 14)} 30 kunlik kafolat · Umrbod kirish</div>
    ${buttons}
    <div class="includes">
      <h4>Kurs tarkibida</h4>
      <ul>
        <li>${icon("layers", 16)} ${course.lessons_count} video dars</li>
        <li>${icon("clock", 16)} ${fmtDuration(course.duration_minutes)} kontent</li>
        <li>${icon("infinity", 16)} Umrbod kirish huquqi</li>
        <li>${icon("award", 16)} Yakuniy sertifikat</li>
        <li>${icon("headset", 16)} Mentor qo'llab-quvvatlashi</li>
        <li>${icon("file-text", 16)} Amaliy topshiriqlar</li>
      </ul>
    </div>
    <div class="purchase-share">
      <button type="button" data-share-copy>${icon("share", 15)} Havola</button>
      <button type="button" data-share-telegram>${icon("telegram", 15)} Telegram</button>
    </div>
  </aside>`;
}

function syllabusHTML(lessons, courseId) {
  return `<div class="syllabus">
    ${lessons.map((lesson) => {
      const stateIcon = lesson.unlocked
        ? `<span class="unlocked">${icon("play", 13)}</span>`
        : `<span>${icon("lock", 13)}</span>`;
      return `<div class="syllabus-item ${lesson.unlocked ? "" : "locked"}">
        <div class="syllabus-top" role="button" tabindex="0">
          <span class="syllabus-num">${lesson.position}</span>
          <span class="syllabus-title">${esc(lesson.title)}</span>
          <span class="syllabus-right">
            ${lesson.is_preview ? `<span class="badge badge-success">Bepul</span>` : ""}
            ${stateIcon}
            <span>${lesson.duration} daq</span>
            ${icon("chevron-down", 14)}
          </span>
        </div>
        <div class="syllabus-desc" hidden>
          <p style="margin-bottom:8px">${esc(lesson.content || "Dars mazmuni kursga yozilgandan so'ng ochiladi.")}</p>
          ${lesson.unlocked
            ? `<button class="btn btn-sm btn-soft" type="button" data-preview="${lesson.id}">${icon("play", 14)} Ko'rish</button>`
            : `<a class="btn btn-sm btn-outline" href="#/course/${courseId}">Yozilish orqali ochish</a>`}
        </div>
      </div>`;
    }).join("")}
  </div>`;
}

function reviewListHTML(reviews) {
  if (!reviews.length) {
    return `<div class="empty-state" style="padding:32px">
      <span class="empty-icon">${icon("message-circle", 26)}</span>
      <h3>Hali sharh yo'q</h3>
      <p>Birinchi bo'lib fikringizni qoldiring.</p>
    </div>`;
  }
  return `<div class="review-list">
    ${reviews.map((review) => `<div class="review-card">
      <div class="review-head">
        ${avatar(review.user, 36)}
        <div>
          <strong>${esc(review.user.name)}</strong>
          <span>${fmtDate(review.created_at)}</span>
        </div>
        ${stars(review.rating, 12)}
      </div>
      <p class="review-text">${esc(review.comment || "Bahosi uchun rahmat!")}</p>
    </div>`).join("")}
  </div>`;
}

function reviewFormHTML(data) {
  if (!state.user) {
    return `<div class="review-form text-center">
      <p class="muted" style="margin-bottom:12px">Sharh qoldirish uchun tizimga kiring.</p>
      <a class="btn btn-primary" href="#/login?next=${encodeURIComponent(`/course/${data.course.id}`)}">Kirish</a>
    </div>`;
  }
  if (!data.enrolled && state.user.role !== "admin") {
    return `<div class="review-form text-center">
      <p class="muted" style="margin-bottom:12px">Sharh qoldirish uchun avval kursga yoziling.</p>
      <button class="btn btn-primary" type="button" data-enroll>${icon("graduation-cap", 17)} Kursga yozilish</button>
    </div>`;
  }
  const my = data.my_review;
  return `<form class="review-form" data-review-form>
    <h3 style="font-size:15px;margin-bottom:10px">${my ? "Sharhingizni yangilash" : "Fikringizni qoldiring"}</h3>
    <div class="star-input" data-star-input>
      ${[1, 2, 3, 4, 5].map((n) => `<button type="button" class="${my && n <= my.rating ? "on" : ""}" data-star="${n}" aria-label="${n} yulduz">${icon("star", 26)}</button>`).join("")}
    </div>
    <div class="field">
      <textarea class="textarea" name="comment" maxlength="1000" placeholder="Kurs haqida fikringiz...">${esc(my?.comment || "")}</textarea>
    </div>
    <button class="btn btn-primary" type="submit">${icon("check", 16)} Yuborish</button>
  </form>`;
}

function courseHTML(data) {
  const { course, lessons, reviews, related, progress } = data;
  const instructor = course.instructor;
  const previewLesson = lessons.find((lesson) => lesson.is_preview && lesson.unlocked);
  const updated = course.created_at;

  return `<div class="page course-detail">
    <div class="container">
      <div class="breadcrumb">
        <a href="#/">Bosh sahifa</a>${icon("chevron-right", 12)}
        <a href="#/courses">Kurslar</a>${icon("chevron-right", 12)}
        <a href="#/courses?category=${esc(course.category.slug)}">${esc(course.category.name)}</a>${icon("chevron-right", 12)}
        <span>${esc(course.title)}</span>
      </div>

      <div class="course-hero">
        <div class="course-hero-main">
          <span class="badge badge-soft" style="--badge-color:${esc(course.accent)}">${esc(course.category.name)}</span>
          <h1>${esc(course.title)}</h1>
          <p class="course-hero-sub">${esc(course.summary)}</p>
          <div class="course-hero-meta">
            ${stars(course.rating, 14, course.reviews_count)}
            <span>${icon("users", 15)} ${fmtNumber(course.students_count)} o'quvchi</span>
            <span>${icon("layers", 15)} ${course.lessons_count} dars</span>
            <span>${icon("clock", 15)} ${fmtDuration(course.duration_minutes)}</span>
            <span>${icon("calendar", 15)} ${fmtDate(updated)}</span>
          </div>
          <div class="course-teacher-line">
            ${avatar(instructor, 38)}
            <div>
              <strong>${esc(instructor.name)}</strong>
              <span class="muted"> · ${esc(instructor.title)}</span>
            </div>
          </div>
          <div class="course-visual">
            ${courseCover(course, { large: true })}
            ${previewLesson ? `<button class="play-preview" type="button" data-preview="${previewLesson.id}" aria-label="Bepul darsni ko'rish">
              <span class="play-bubble">${icon("play", 28)}</span>
            </button>` : ""}
          </div>
        </div>
        ${purchaseCard(course, data)}
      </div>

      <div class="course-tabs" role="tablist">
        <button class="tab-btn active" data-tab="overview" type="button">Umumiy ma'lumot</button>
        <button class="tab-btn" data-tab="curriculum" type="button">Dastur (${lessons.length})</button>
        <button class="tab-btn" data-tab="instructor" type="button">O'qituvchi</button>
        <button class="tab-btn" data-tab="reviews" type="button">Sharhlar (${reviews.length})</button>
      </div>

      <div class="tab-panel active" data-panel="overview">
        <div class="detail-block">
          <h2>Kurs haqida</h2>
          <div class="prose">
            ${String(course.description || course.summary).split("\n").filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join("")}
          </div>
        </div>
        ${course.outcomes?.length ? `<div class="detail-block">
          <h2>Nimalarni o'rganasiz?</h2>
          <div class="outcome-grid">
            ${course.outcomes.map((item) => `<div class="outcome-item">
              <span class="icon">${icon("check-circle", 17)}</span>
              <span>${esc(item)}</span>
            </div>`).join("")}
          </div>
        </div>` : ""}
        <div class="detail-block">
          <h2>Kimlar uchun mos?</h2>
          <div class="prose">
            <p>Kurs ${esc(course.level.toLowerCase())} darajadagi o'quvchilar uchun mo'ljallangan. Agar siz ${esc(course.category.name.toLowerCase())} sohasida amaliy ko'nikmalarga ega bo'lishni istasangiz, bu kurs siz uchun.</p>
            <p>Barcha darslar o'zbek tilida, real misollar va amaliy topshiriqlar bilan olib boriladi. Kursni istalgan vaqtda, istalgan qurilmada ko'rishingiz mumkin.</p>
          </div>
        </div>
        ${related.length ? `<div class="detail-block">
          <h2>O'xshash kurslar</h2>
          <div class="course-grid">${related.map((item) => courseCard(item)).join("")}</div>
        </div>` : ""}
      </div>

      <div class="tab-panel" data-panel="curriculum">
        <div class="detail-block">
          <div class="curriculum-head">
            <span>${lessons.length} dars · ${fmtDuration(course.duration_minutes)}</span>
            <span>${lessons.filter((l) => l.is_preview).length} ta bepul dars</span>
          </div>
          ${syllabusHTML(lessons, course.id)}
        </div>
      </div>

      <div class="tab-panel" data-panel="instructor">
        <div class="detail-block">
          <h2>O'qituvchi haqida</h2>
          <div class="instructor-profile">
            ${avatar(instructor, 76)}
            <div style="min-width:0">
              <h3>${esc(instructor.name)}</h3>
              <div class="inst-title">${esc(instructor.title)}</div>
              <p>${esc(instructor.bio || "Tajribali mutaxassis va mentor.")}</p>
              <div class="inst-stats">
                <span>${icon("star", 12)} ${course.rating.toFixed(1)} reyting</span>
                <span>${icon("users", 12)} ${fmtNumber(course.students_count)} o'quvchi</span>
                <span>${icon("book", 12)} ${course.lessons_count} dars</span>
              </div>
              <div style="margin-top:14px">
                <a class="btn btn-sm btn-outline" href="#/courses?instructor=${instructor.id}">Barcha kurslari ${icon("arrow-right", 14)}</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="tab-panel" data-panel="reviews">
        <div class="reviews-summary">
          <div class="reviews-score">
            <div class="big">${course.rating.toFixed(1)}</div>
            ${stars(course.rating, 15)}
            <span>${fmtNumber(course.reviews_count)} sharh</span>
          </div>
          <div class="rating-bars">${ratingBars(reviews)}</div>
        </div>
        ${reviewFormHTML(data)}
        ${reviewListHTML(reviews)}
      </div>
    </div>
  </div>`;
}

function openPreview(lesson, courseId) {
  const modal = openModal(`
    <div class="modal-head">
      <span class="modal-icon">${icon("play", 22)}</span>
      <div>
        <h3>${esc(lesson.title)}</h3>
        <p>${lesson.position}-dars · ${lesson.duration} daqiqa</p>
      </div>
    </div>
    ${lesson.video_url
      ? `<div class="video-frame" style="aspect-ratio:16/9;border-radius:14px;overflow:hidden">
           <video controls autoplay playsinline src="${esc(lesson.video_url)}" style="width:100%;height:100%;background:#000"></video>
         </div>`
      : `<div class="prose" style="padding:6px 2px">${esc(lesson.content || "Dars mazmuni mavjud emas.")}</div>`}
    <div class="modal-actions">
      <button class="btn btn-outline" data-close>Yopish</button>
      <a class="btn btn-primary" href="#/course/${courseId}">Kursga yozilish</a>
    </div>`, { size: "lg" });
  return modal;
}

export async function render(root, ctx) {
  const id = ctx.params.id;
  root.innerHTML = `<div class="page"><div class="container" style="padding:60px 0">
    <div class="skeleton skeleton-line w50 tall" style="margin-bottom:18px"></div>
    <div class="skeleton skeleton-line w90" style="margin-bottom:10px"></div>
    <div class="skeleton skeleton-line w70"></div>
  </div></div>`;

  try {
    const data = await get(`/courses/${id}`);
    document.title = `${data.course.title} — BilimNova`;
    root.innerHTML = courseHTML(data);

    root.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        root.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b === btn));
        root.querySelectorAll(".tab-panel").forEach((panel) => {
          panel.classList.toggle("active", panel.dataset.panel === btn.dataset.tab);
        });
      });
    });

    root.querySelectorAll(".syllabus-top").forEach((top) => {
      const toggle = () => {
        const desc = top.nextElementSibling;
        if (!desc) return;
        desc.hidden = !desc.hidden;
        const chevron = top.querySelector(".syllabus-right .icon:last-child");
        if (chevron) chevron.style.transform = desc.hidden ? "" : "rotate(180deg)";
      };
      top.addEventListener("click", toggle);
      top.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggle();
        }
      });
    });

    root.querySelectorAll("[data-preview]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        const lesson = data.lessons.find((item) => String(item.id) === String(btn.dataset.preview));
        if (lesson) openPreview(lesson, data.course.id);
      });
    });

    root.querySelectorAll("[data-enroll]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!state.user) {
          toast("Avval tizimga kiring", "info");
          go(`/login?next=${encodeURIComponent(`/course/${id}`)}`);
          return;
        }
        btn.disabled = true;
        try {
          const result = await post(`/courses/${id}/enroll`);
          toast(result.message, "success");
          go(`/learn/${id}`);
        } catch (error) {
          toast(error.message, "error");
          btn.disabled = false;
        }
      });
    });

    const copyLink = async () => {
      const url = `${location.origin}/#/course/${id}`;
      try {
        await navigator.clipboard.writeText(url);
        toast("Havola nusxalandi", "success");
      } catch (e) {
        window.prompt("Havolani nusxalang:", url);
      }
    };
    root.querySelector("[data-share-copy]")?.addEventListener("click", copyLink);
    root.querySelector("[data-share-telegram]")?.addEventListener("click", () => {
      const url = `${location.origin}/#/course/${id}`;
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(data.course.title)}`, "_blank");
    });

    const reviewForm = root.querySelector("[data-review-form]");
    if (reviewForm) {
      let rating = data.my_review?.rating || 5;
      const starButtons = reviewForm.querySelectorAll("[data-star]");
      const paint = () => starButtons.forEach((b) => b.classList.toggle("on", Number(b.dataset.star) <= rating));
      paint();
      starButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          rating = Number(btn.dataset.star);
          paint();
        });
      });
      reviewForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const button = reviewForm.querySelector("button[type=submit]");
        button.disabled = true;
        try {
          const result = await post(`/courses/${id}/reviews`, {
            rating,
            comment: reviewForm.querySelector("textarea").value,
          });
          toast(result.message, "success");
          window.__bnRerender?.();
        } catch (error) {
          toast(error.message, "error");
          button.disabled = false;
        }
      });
    }
  } catch (error) {
    root.innerHTML = `<div class="page"><div class="container" style="padding:60px 0">${errorState(error.message)}</div></div>`;
    bindRetry(root);
  }
}
