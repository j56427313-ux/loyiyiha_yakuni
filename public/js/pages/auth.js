import { post } from "../api.js";
import { icon, logoMark } from "../icons.js";
import { setUser, state } from "../store.js";
import { esc, go, stars, toast } from "../ui.js";

const BENEFITS = [
  "13+ amaliy kurs va yangi materiallar",
  "Tajribali mentorlardan bevosita bilim",
  "O'z sur'atingizda o'rganish imkoniyati",
  "Yakuniy sertifikat va portfolio loyihalar",
];

function authSideHTML(mode) {
  return `<aside class="auth-side">
    <a class="brand light" href="#/">${logoMark(40)}<span class="brand-name">Bilim<span>Nova</span></span></a>
    <div class="auth-side-content">
      <span class="eyebrow" style="color:#a5f3fc">${mode === "register" ? "Bepul boshlang" : "Xush kelibsiz"}</span>
      <h2>${mode === "register" ? "Bilim sari yo'lni bugun boshlang" : "O'rganishni davom ettiring"}</h2>
      <p>${mode === "register"
        ? "Bir necha soniyada hisob yarating va minglab o'quvchilar qatoriga qo'shiling. Birinchi darslar bepul."
        : "Hisobingizga kirib, kurslaringizni davom ettiring va taraqqiyotingizni kuzatib boring."}</p>
      <ul class="auth-benefits">
        ${BENEFITS.map((item) => `<li>${icon("check-circle", 17)} ${item}</li>`).join("")}
      </ul>
      <div class="auth-side-card">
        ${stars(5, 13)}
        <p>“BilimNova orqali 3 oyda birinchi ishimga joylashdim. Darslar juda tushunarli va amaliyotga yo'naltirilgan.”</p>
        <p style="margin-top:8px;font-weight:700;color:#fff">Dilshod K. · Frontend dasturchi</p>
      </div>
    </div>
    <div class="auth-side-foot">© ${new Date().getFullYear()} BilimNova. Barcha huquqlar himoyalangan.</div>
  </aside>`;
}

function authPanelHTML(mode, next) {
  const isRegister = mode === "register";
  return `<div class="auth-panel">
    <div class="auth-box">
      <a class="auth-back" href="#/">${icon("arrow-left", 15)} Bosh sahifaga qaytish</a>
      <div class="brand" style="margin-bottom:22px">${logoMark(36)}<span class="brand-name">Bilim<span>Nova</span></span></div>
      <h1>${isRegister ? "Hisob yaratish" : "Tizimga kirish"}</h1>
      <p class="auth-sub">${isRegister
        ? "Bepul ro'yxatdan o'ting va o'rganishni boshlang."
        : "Email va parolingizni kiriting."}</p>

      <div class="alert alert-error" data-alert>${icon("alert", 17)} <span data-alert-text></span></div>

      <form data-auth-form novalidate>
        ${isRegister ? `<div class="field" data-field="name">
          <label for="name">To'liq ism</label>
          <div class="input-wrap">
            <span class="input-icon">${icon("user", 17)}</span>
            <input class="input" id="name" name="name" type="text" placeholder="Ism va familiya" autocomplete="name" required>
          </div>
          <div class="field-error" data-error="name"></div>
        </div>` : ""}

        <div class="field" data-field="email">
          <label for="email">Email manzil</label>
          <div class="input-wrap">
            <span class="input-icon">${icon("mail", 17)}</span>
            <input class="input" id="email" name="email" type="email" placeholder="siz@example.com" autocomplete="email" required>
          </div>
          <div class="field-error" data-error="email"></div>
        </div>

        <div class="field" data-field="password">
          <label for="password">Parol</label>
          <div class="input-wrap">
            <span class="input-icon">${icon("lock", 17)}</span>
            <input class="input" id="password" name="password" type="password" placeholder="${isRegister ? "Kamida 6 ta belgi" : "Parolingiz"}" autocomplete="${isRegister ? "new-password" : "current-password"}" required>
            <button class="input-action" type="button" data-toggle-password aria-label="Parolni ko'rsatish">${icon("eye", 17)}</button>
          </div>
          <div class="field-error" data-error="password"></div>
        </div>

        ${isRegister ? `<div class="field" data-field="confirm">
          <label for="confirm">Parolni tasdiqlang</label>
          <div class="input-wrap">
            <span class="input-icon">${icon("lock", 17)}</span>
            <input class="input" id="confirm" name="confirm" type="password" placeholder="Parolni qayta kiriting" autocomplete="new-password" required>
          </div>
          <div class="field-error" data-error="confirm"></div>
        </div>
        <label class="checkbox" style="margin-bottom:16px">
          <input type="checkbox" name="terms" required>
          <span>Men <a href="#/about" style="color:var(--primary);font-weight:700">foydalanish shartlari</a> va maxfiylik siyosatiga roziman</span>
        </label>` : `<div style="display:flex;justify-content:flex-end;margin:-4px 0 16px">
          <button type="button" class="btn btn-ghost btn-sm" data-forgot style="color:var(--primary)">Parolni unutdingizmi?</button>
        </div>`}

        <button class="btn btn-primary btn-lg btn-block" type="submit" data-submit>
          ${isRegister ? "Ro'yxatdan o'tish" : "Kirish"} ${icon("arrow-right", 17)}
        </button>
      </form>

      ${!isRegister ? `<div class="auth-divider">Demo hisoblar</div>
        <div class="demo-box">
          <strong>Sinab ko'rish uchun tayyor hisoblar</strong>
          <div class="demo-creds">
            <button type="button" data-demo="student">O'quvchi</button>
            <button type="button" data-demo="admin">Administrator</button>
          </div>
        </div>` : `<div class="auth-divider">yoki</div>
        <div class="demo-box">
          <strong>Allaqachon hisobingiz bormi?</strong>
          <div class="demo-creds">
            <button type="button" data-demo="student">Demo o'quvchi sifatida kirish</button>
          </div>
        </div>`}

      <p class="auth-switch">
        ${isRegister
          ? `Hisobingiz bormi? <a href="#/login${next ? `?next=${encodeURIComponent(next)}` : ""}">Kirish</a>`
          : `Hisobingiz yo'qmi? <a href="#/register${next ? `?next=${encodeURIComponent(next)}` : ""}">Ro'yxatdan o'tish</a>`}
      </p>
    </div>
  </div>`;
}

export async function render(root, ctx) {
  const mode = ctx.mode === "register" ? "register" : "login";
  const next = ctx.query.next || "";
  document.title = `${mode === "register" ? "Ro'yxatdan o'tish" : "Kirish"} — BilimNova`;

  if (state.user) {
    go(next || "/dashboard");
    return;
  }

  root.innerHTML = `<div class="auth-page">
    ${authSideHTML(mode)}
    ${authPanelHTML(mode, next)}
  </div>`;

  const form = root.querySelector("[data-auth-form]");
  const alertBox = root.querySelector("[data-alert]");
  const alertText = root.querySelector("[data-alert-text]");
  const submit = root.querySelector("[data-submit]");

  const clearErrors = () => {
    root.querySelectorAll(".field.invalid").forEach((field) => field.classList.remove("invalid"));
    alertBox.classList.remove("show");
  };

  const showError = (message, field) => {
    alertText.textContent = message;
    alertBox.classList.add("show");
    if (field) {
      const wrapper = root.querySelector(`[data-field="${field}"]`);
      if (wrapper) {
        wrapper.classList.add("invalid");
        const error = wrapper.querySelector("[data-error]");
        if (error) error.textContent = message;
      }
    }
  };

  root.querySelector("[data-toggle-password]")?.addEventListener("click", (event) => {
    const input = form.querySelector("#password");
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    event.currentTarget.innerHTML = icon(isPassword ? "eye-off" : "eye", 17);
  });

  root.querySelectorAll("[data-demo]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const admin = btn.dataset.demo === "admin";
      form.querySelector("#email").value = admin ? "admin@bilimnova.uz" : "student@bilimnova.uz";
      form.querySelector("#password").value = admin ? "Admin123!" : "Student123!";
      submit.click();
    });
  });

  root.querySelector("[data-forgot]")?.addEventListener("click", () => {
    toast("Demo rejimida parolni tiklash mavjud emas. Demo hisobdan foydalaning.", "info");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors();

    const data = {
      email: form.querySelector("#email").value.trim(),
      password: form.querySelector("#password").value,
    };

    if (!data.email || !data.email.includes("@")) {
      showError("To'g'ri email manzil kiriting", "email");
      return;
    }
    if (!data.password) {
      showError("Parolni kiriting", "password");
      return;
    }

    if (mode === "register") {
      data.name = form.querySelector("#name").value.trim();
      const confirm = form.querySelector("#confirm").value;
      if (data.name.length < 2) {
        showError("Ismingizni kiriting", "name");
        return;
      }
      if (data.password.length < 6) {
        showError("Parol kamida 6 ta belgidan iborat bo'lishi kerak", "password");
        return;
      }
      if (confirm !== data.password) {
        showError("Parollar mos kelmadi", "confirm");
        return;
      }
      if (!form.querySelector("[name=terms]").checked) {
        showError("Foydalanish shartlariga rozilik bildiring");
        return;
      }
    }

    submit.disabled = true;
    try {
      const result = mode === "register"
        ? await post("/auth/register", data)
        : await post("/auth/login", { email: data.email, password: data.password });
      setUser(result.user);
      toast(result.message || "Muvaffaqiyatli!", "success");
      go(next || "/dashboard");
    } catch (error) {
      showError(error.message, error.field || null);
      submit.disabled = false;
    }
  });

  form.querySelector("#email")?.focus();
}
