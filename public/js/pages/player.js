import { get, post } from "../api.js";
import { icon, logoMark } from "../icons.js";
import { state } from "../store.js";
import { bindRetry, errorState, esc, fmtDuration, go, toast } from "../ui.js";

function lessonLink(courseId, lesson, currentId, completedIds) {
  const done = completedIds.includes(lesson.id);
  const active = lesson.id === currentId;
  const stateClass = done ? "done" : active ? "playing" : "";
  return `<a class="lesson-link ${active ? "active" : ""}" href="#/learn/${courseId}/${lesson.id}" data-lesson="${lesson.id}">
    <span class="lesson-state ${stateClass}">${done ? icon("check", 11) : active ? icon("play", 10) : lesson.position}</span>
    <span class="lesson-link-body">
      <strong>${esc(lesson.title)}</strong>
      <span>${lesson.duration} daq${lesson.is_preview ? " · bepul" : ""}</span>
    </span>
  </a>`;
}

function sidebarHTML(data, currentId) {
  return `<aside class="player-sidebar" data-sidebar>
    <div class="sidebar-head">
      <h3>${esc(data.course.title)}</h3>
      <p data-sidebar-meta>${data.lessons.length} dars · ${data.progress.percent}% yakunlangan</p>
    </div>
    <nav data-lesson-nav>
      ${data.lessons.map((lesson) => lessonLink(data.course.id, lesson, currentId, data.completed_lesson_ids)).join("")}
    </nav>
  </aside>`;
}

function mainHTML(data, lesson) {
  const total = data.lessons.length;
  const done = data.completed_lesson_ids.includes(lesson.id);
  const paragraphs = String(lesson.content || "").split("\n").filter((line) => line.trim());

  return `<div data-lesson-main>
    <div class="video-frame">
      ${lesson.video_url
        ? `<video data-video playsinline preload="metadata" src="${esc(lesson.video_url)}"></video>
           <div class="video-poster" data-poster>
             <span class="play-bubble">${icon("play", 28)}</span>
             <h4>${esc(lesson.title)}</h4>
             <span>${lesson.duration} daqiqa · ${esc(data.course.title)}</span>
           </div>`
        : `<div class="video-poster" style="cursor:default">
             <span class="play-bubble">${icon("video-off", 26)}</span>
             <h4>Video hozircha mavjud emas</h4>
             <span>Dars materialini quyida o'qing</span>
           </div>`}
    </div>
    <div class="video-note">Demo video · ${lesson.duration} daqiqa</div>
    <div class="lesson-content">
      <div class="lesson-kicker">
        <span>${lesson.position}-dars / ${total}</span>
        <span>·</span>
        <span>${lesson.duration} daqiqa</span>
        <span>·</span>
        <span data-lesson-state>${done ? "Yakunlangan" : "Jarayonda"}</span>
      </div>
      <h1>${esc(lesson.title)}</h1>
      <div class="lesson-prose">
        ${paragraphs.length ? paragraphs.map((p) => `<p>${esc(p)}</p>`).join("") : "<p>Bu dars uchun qo'shimcha matn kiritilmagan.</p>"}
      </div>
      <div class="lesson-actions">
        <button class="btn ${done ? "btn-success" : "btn-primary"}" type="button" data-complete>
          ${icon(done ? "check-circle" : "check", 17)}
          <span>${done ? "Yakunlangan" : "Darsni yakunlash"}</span>
        </button>
        ${done ? `<button class="btn btn-outline btn-sm" type="button" data-uncomplete>Belgini olib tashlash</button>` : ""}
        <span class="spacer"></span>
        <button class="btn btn-outline" type="button" data-prev ${lesson.position <= 1 ? "disabled" : ""}>
          ${icon("chevron-left", 16)} Oldingi
        </button>
        <button class="btn btn-outline" type="button" data-next ${lesson.position >= total ? "disabled" : ""}>
          Keyingi ${icon("chevron-right", 16)}
        </button>
      </div>
    </div>
  </div>`;
}

function shellHTML(data, currentId) {
  return `<div class="player-shell">
    <header class="player-top">
      <button class="icon-btn player-sidebar-toggle" type="button" data-sidebar-toggle aria-label="Darslar ro'yxati">${icon("menu", 19)}</button>
      <a class="player-back" href="#/dashboard">${icon("arrow-left", 15)} Kabinet</a>
      <a class="brand" href="#/" style="gap:8px">${logoMark(30)}<span class="brand-name" style="font-size:17px">Bilim<span>Nova</span></span></a>
      <div class="player-title">${esc(data.course.title)}</div>
      <div class="player-progress-mini">
        <div class="progress"><span data-top-bar style="width:${data.progress.percent}%"></span></div>
        <span data-top-text>${data.progress.percent}%</span>
      </div>
    </header>
    <div class="player-body">
      ${sidebarHTML(data, currentId)}
      <main class="player-main" data-player-main></main>
    </div>
  </div>`;
}

export async function render(root, ctx) {
  const courseId = ctx.params.courseId;
  const requested = ctx.params.lessonId ? Number(ctx.params.lessonId) : null;
  document.title = "Dars — BilimNova";

  if (!state.user) {
    go(`/login?next=${encodeURIComponent(`/learn/${courseId}`)}`);
    return;
  }

  root.innerHTML = `<div class="player-shell">
    <div style="display:grid;place-items:center;height:100vh;color:#8b99b3;font-size:13px">Dars yuklanmoqda...</div>
  </div>`;

  try {
    const data = await get(`/courses/${courseId}/learn`);
    if (!data.lessons.length) {
      root.innerHTML = `<div class="player-shell"><div style="padding:60px;width:100%;max-width:560px;margin:0 auto">
        ${errorState("Bu kursda hali darslar qo'shilmagan.", false)}
        <div style="text-align:center;margin-top:14px"><a class="btn btn-primary" href="#/course/${courseId}">Kurs sahifasi</a></div>
      </div></div>`;
      return;
    }

    document.title = `${data.course.title} — BilimNova`;
    let currentId = requested && data.lessons.some((lesson) => lesson.id === requested)
      ? requested
      : data.last_lesson_id && data.lessons.some((lesson) => lesson.id === data.last_lesson_id)
        ? data.last_lesson_id
        : data.lessons[0].id;

    root.innerHTML = shellHTML(data, currentId);
    const main = root.querySelector("[data-player-main]");
    const topBar = root.querySelector("[data-top-bar]");
    const topText = root.querySelector("[data-top-text]");
    const sidebar = root.querySelector("[data-sidebar]");

    const currentLesson = () => data.lessons.find((lesson) => lesson.id === currentId) || data.lessons[0];

    const updateProgress = () => {
      topBar.style.width = `${data.progress.percent}%`;
      topText.textContent = `${data.progress.percent}%`;
      const meta = root.querySelector("[data-sidebar-meta]");
      if (meta) meta.textContent = `${data.lessons.length} dars · ${data.progress.percent}% yakunlangan`;
    };

    const updateNavState = () => {
      root.querySelectorAll("[data-lesson]").forEach((link) => {
        const id = Number(link.dataset.lesson);
        const lesson = data.lessons.find((item) => item.id === id);
        const done = data.completed_lesson_ids.includes(id);
        const active = id === currentId;
        link.classList.toggle("active", active);
        const dot = link.querySelector(".lesson-state");
        dot.classList.toggle("done", done);
        dot.classList.toggle("playing", active && !done);
        dot.innerHTML = done ? icon("check", 11) : active ? icon("play", 10) : String(lesson.position);
      });
    };

    const updateCompleteUI = () => {
      const lesson = currentLesson();
      const done = data.completed_lesson_ids.includes(lesson.id);
      const stateEl = main.querySelector("[data-lesson-state]");
      if (stateEl) stateEl.textContent = done ? "Yakunlangan" : "Jarayonda";
      const button = main.querySelector("[data-complete]");
      if (button) {
        button.className = `btn ${done ? "btn-success" : "btn-primary"}`;
        button.innerHTML = `${icon(done ? "check-circle" : "check", 17)}<span>${done ? "Yakunlangan" : "Darsni yakunlash"}</span>`;
      }
      let remove = main.querySelector("[data-uncomplete]");
      if (done && !remove) {
        remove = document.createElement("button");
        remove.className = "btn btn-outline btn-sm";
        remove.type = "button";
        remove.dataset.uncomplete = "";
        remove.textContent = "Belgini olib tashlash";
        button?.insertAdjacentElement("afterend", remove);
        remove.addEventListener("click", () => toggleComplete(false));
      } else if (!done && remove) {
        remove.remove();
      }
    };

    const bindMain = () => {
      const lesson = currentLesson();
      const video = main.querySelector("[data-video]");
      const poster = main.querySelector("[data-poster]");
      poster?.addEventListener("click", () => {
        poster.style.display = "none";
        video?.play().catch(() => {
          toast("Videoni yuklab bo'lmadi. Internet aloqasini tekshiring.", "error");
        });
      });
      video?.addEventListener("ended", () => {
        if (!data.completed_lesson_ids.includes(lesson.id)) toggleComplete(true);
      });

      main.querySelector("[data-complete]")?.addEventListener("click", () => toggleComplete(true));
      main.querySelector("[data-uncomplete]")?.addEventListener("click", () => toggleComplete(false));

      const index = data.lessons.findIndex((item) => item.id === lesson.id);
      main.querySelector("[data-prev]")?.addEventListener("click", () => {
        if (index > 0) selectLesson(data.lessons[index - 1].id);
      });
      main.querySelector("[data-next]")?.addEventListener("click", () => {
        if (index < data.lessons.length - 1) selectLesson(data.lessons[index + 1].id);
      });
    };

    const renderMain = () => {
      main.innerHTML = mainHTML(data, currentLesson());
      bindMain();
    };

    async function toggleComplete(completed) {
      const lesson = currentLesson();
      try {
        const result = await post(`/lessons/${lesson.id}/complete`, { completed });
        if (result.completed) {
          if (!data.completed_lesson_ids.includes(lesson.id)) data.completed_lesson_ids.push(lesson.id);
        } else {
          data.completed_lesson_ids = data.completed_lesson_ids.filter((id) => id !== lesson.id);
        }
        data.progress = result.progress;
        updateProgress();
        updateNavState();
        updateCompleteUI();
        toast(result.message, completed ? "success" : "info");
      } catch (error) {
        toast(error.message, "error");
      }
    }

    function selectLesson(id) {
      if (!data.lessons.some((lesson) => lesson.id === id)) return;
      currentId = id;
      try {
        history.replaceState(null, "", `#/learn/${courseId}/${id}`);
      } catch (e) {
        /* ignore */
      }
      renderMain();
      updateNavState();
      if (window.innerWidth <= 980) sidebar.classList.remove("open");
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.title = `${currentLesson().title} — BilimNova`;
    }

    root.querySelectorAll("[data-lesson]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        selectLesson(Number(link.dataset.lesson));
      });
    });

    root.querySelector("[data-sidebar-toggle]")?.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });

    renderMain();
    updateNavState();
  } catch (error) {
    if (error.status === 401) {
      go(`/login?next=${encodeURIComponent(`/learn/${courseId}`)}`);
      return;
    }
    root.innerHTML = `<div class="player-shell">
      <div style="width:100%;max-width:560px;margin:60px auto;padding:0 20px">
        <div class="empty-state error-state" style="background:#0f172a;border-color:#2c3a58;color:#93a1bb">
          <span class="empty-icon">${icon("lock", 26)}</span>
          <h3 style="color:#e8eefb">Kirish cheklangan</h3>
          <p>${esc(error.message)}</p>
          <a class="btn btn-primary" href="#/course/${courseId}">Kurs sahifasiga o'tish</a>
        </div>
        <div style="text-align:center;margin-top:16px">
          <a class="btn btn-outline" href="#/dashboard" style="background:transparent;border-color:#2c3a58;color:#dbe4f5">Kabinetga qaytish</a>
        </div>
      </div>
    </div>`;
  }
}
