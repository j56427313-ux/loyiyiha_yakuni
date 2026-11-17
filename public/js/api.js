/* API bilan ishlash uchun yengil klient */
export class ApiError extends Error {
  constructor(message, status = 0, field = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.field = field;
  }
}

export async function api(path, options = {}) {
  const opts = {
    credentials: "same-origin",
    headers: { Accept: "application/json", ...(options.headers || {}) },
    ...options,
  };
  if (opts.body && typeof opts.body !== "string") {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(opts.body);
  }
  let response;
  try {
    response = await fetch("/api" + path, opts);
  } catch (err) {
    throw new ApiError("Serverga ulanib bo'lmadi. Internetni tekshiring.", 0);
  }
  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }
  if (!response.ok) {
    throw new ApiError(data?.error || `Xatolik (${response.status})`, response.status, data?.field || null);
  }
  return data;
}

export const get = (path) => api(path);
export const post = (path, body) => api(path, { method: "POST", body });
export const patch = (path, body) => api(path, { method: "PATCH", body });
export const del = (path) => api(path, { method: "DELETE" });
