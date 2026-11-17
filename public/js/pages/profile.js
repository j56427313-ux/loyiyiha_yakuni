import { get, patch, post } from "../api.js";
import { icon } from "../icons.js";
import { setUser, state } from "../store.js";
import {
  avatar, bindRetry, errorState, esc, fmtDate, fmtNumber, go, toast,
} from "../ui.js";

const ROLE_LABEL = { admin: "Administrator", instructor: "O'qituvchi", student: "O'quvchi" };

function profileHTML(user, stats) {
  return `<div class="page profile-page">
    <div class="container">
      <div class="page-head" style="margin-bottom:24px">
        <span class="eyebrow">Hisob</span>
        <h1>Profil sozlamalari</h1>
        <p>Shaxsiy ma'lumotlaringizni yangilang va hisob xavfsizligini boshqaring.</p>
      </div>

      <div class="profile-grid">
        <aside>
          <div class="profile-card">
            ${avatar(user, 84)}
            <h2>${esc(user.name)}</h2>
            <p>${esc(user.email)}</p>
            <span class="badge badge-primary">${ROLE_LABEL[user.role] || user.role}</span>

            <div class="profile-meta">
              <div><span>Ro'yxatdan o'tgan</span><strong>${fmtDate(user.created_at)}</strong></div>
              <div><span>Kurslar</span><strong>${fmtNumber(stats.enrolled)}</strong></div>
              <div><span>Yakunlangan darslar</span><strong>${fmtNumber(stats.completed_lessons)}</strong></div>
              <div><span>O'rganilgan vaqt</span><strong>${String(stats.hours_learned).replace(".", ",")} soat</strong></div>
              <div><span>Sertifikatlar</span><strong>${fmtNumber(stats.certificates)}</strong></div>
            </div>

            <div style="margin-top:18px;display:flex;flex-direction:column;gap:8px">
              <a class="btn btn-outline btn-block btn-sm" href="#/dashboard">${icon("grid", 15)} Shaxsiy kabinet</a>
              ${user.role === "admin"
                ? `<a class="btn btn-ghost btn-block btn-sm" href="#/admin">${icon("shield", 15)} Admin panel</a>`
                : `<a class="btn btn-ghost btn-block btn-sm" href="#/courses">${icon("search", 15)} Kurslar katalogi</a>`}
            </div>
          </div>
        </aside>

        <div class="profile-forms">
          <div class="panel">
            <div class="panel-head">
              <h2>${icon("user", 18)} Shaxsiy ma'lumotlar</h2>
              <span class="badge badge-neutral">${ROLE_LABEL[user.role] || user.role}</span>
            </div>
            <form data-profile-form novalidate>
              <div class="form-row">
                <div class="field">
                  <label for="profile-name">To'liq ism</label>
                  <input class="input" id="profile-name" name="name" type="text" maxlength="80" value="${esc(user.name)}" required>
                </div>
                <div class="field">
                  <label for="profile-email">Email manzil</label>
                  <input class="input" id="profile-email" type="email" value="${esc(user.email)}" disabled>
                  <div class="input-hint">Email manzilni o'zgartirish mumkin emas.</div>
                </div>
              </div>
              <div class="field">
                <label for="profile-title">Lavozim / yo'nalish</label>
                <input class="input" id="profile-title" name="title" type="text" maxlength="120" value="${esc(user.title || "")}" placeholder="Masalan: Frontend dasturchi">
              </div>
              <div class="field">
                <label for="profile-bio">O'zingiz haqingizda</label>
                <textarea class="textarea" id="profile-bio" name="bio" maxlength="500" placeholder="Qisqacha tanishtiring...">${esc(user.bio || "")}</textarea>
              </div>
              <div style="display:flex;justify-content:flex-end;gap:9px">
                <button class="btn btn-outline" type="reset">Bekor qilish</button>
                <button class="btn btn-primary" type="submit">${icon("check", 16)} Saqlash</button>
              </div>
            </form>
          </div>

          <div class="panel">
            <div class="panel-head">
              <h2>${icon("lock", 18)} Parolni o'zgartirish</h2>
              <span class="badge badge-neutral">Xavfsizlik</span>
            </div>
            <form data-password-form novalidate>
              <div class="field">
                <label for="current-password">Joriy parol</label>
                <input class="input" id="current-password" name="current_password" type="password" autocomplete="current-password" required>
              </div>
              <div class="form-row">
                <div class="field">
                  <label for="new-password">Yangi parol</label>
                  <input class="input" id="new-password" name="new_password" type="password" autocomplete="new-password" placeholder="Kamida 6 ta belgi" required>
                </div>
                <div class="field">
                  <label for="confirm-password">Yangi parolni tasdiqlang</label>
                  <input class="input" id="confirm-password" name="confirm_password" type="password" autocomplete="new-password" required>
                </div>
              </div>
              <div class="alert alert-info" style="margin-bottom:16px;font-size:12.5px">
                ${icon("info", 16)} Parol kamida 6 ta belgidan iborat bo'lishi va taxmin qilinishi qiyin bo'lishi tavsiya etiladi.
              </div>
              <div style="display:flex;justify-content:flex-end">
                <button class="btn btn-primary" type="submit">${icon("shield", 16)} Parolni yangilash</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

export async function render(root) {
  document.title = "Profil sozlamalari — BilimNova";
  if (!state.user) {
    go("/login?next=%2Fprofile");
    return;
  }

  root.innerHTML = `<div class="page profile-page"><div class="container" style="padding:60px 0">
    <div class="skeleton skeleton-line w40 tall" style="margin-bottom:24px"></div>
    <div class="skeleton skeleton-line w90" style="margin-bottom:12px"></div>
    <div class="skeleton skeleton-line w70"></div>
  </div></div>`;

  let stats;
  try {
    stats = await get("/my/stats");
  } catch (error) {
    if (error.status === 401) {
      go("/login?next=%2Fprofile");
      return;
    }
    root.innerHTML = `<div class="page"><div class="container" style="padding:60px 0">${errorState(error.message)}</div></div>`;
    bindRetry(root);
    return;
  }

  root.innerHTML = profileHTML(state.user, stats);
  const user = state.user;

  const profileForm = root.querySelector("[data-profile-form]");
  profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      name: profileForm.name.value.trim(),
      title: profileForm.title.value.trim(),
      bio: profileForm.bio.value.trim(),
    };
    if (payload.name.length < 2) {
      toast("Ism kamida 2 ta belgidan iborat bo'lishi kerak", "error");
      profileForm.name.focus();
      return;
    }
    const button = profileForm.querySelector("button[type=submit]");
    button.disabled = true;
    try {
      const result = await patch("/profile", payload);
      setUser(result.user);
      toast(result.message, "success");
      window.__bnRerender?.();
    } catch (error) {
      toast(error.message, "error");
      button.disabled = false;
    }
  });

  profileForm.addEventListener("reset", () => {
    profileForm.name.value = user.name;
    profileForm.title.value = user.title || "";
    profileForm.bio.value = user.bio || "";
  });

  const passwordForm = root.querySelector("[data-password-form]");
  passwordForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const current = passwordForm.current_password.value;
    const next = passwordForm.new_password.value;
    const confirm = passwordForm.confirm_password.value;

    if (!current) {
      toast("Joriy parolni kiriting", "error");
      passwordForm.current_password.focus();
      return;
    }
    if (next.length < 6) {
      toast("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak", "error");
      passwordForm.new_password.focus();
      return;
    }
    if (next !== confirm) {
      toast("Yangi parollar mos kelmadi", "error");
      passwordForm.confirm_password.focus();
      return;
    }
    if (next === current) {
      toast("Yangi parol joriy paroldan farq qilishi kerak", "error");
      return;
    }

    const button = passwordForm.querySelector("button[type=submit]");
    button.disabled = true;
    try {
      const result = await post("/profile/password", {
        current_password: current,
        new_password: next,
      });
      toast(result.message, "success");
      passwordForm.reset();
    } catch (error) {
      toast(error.message, "error");
    } finally {
      button.disabled = false;
    }
  });
}
