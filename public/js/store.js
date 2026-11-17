import { get } from "./api.js";

export const state = {
  user: null,
  categories: null,
};

export async function loadUser() {
  try {
    const data = await get("/auth/me");
    state.user = data.user || null;
  } catch {
    state.user = null;
  }
  return state.user;
}

export function setUser(user) {
  state.user = user || null;
}

export function isAdmin() {
  return state.user?.role === "admin";
}

export function isStudent() {
  return state.user?.role === "student";
}

export async function loadCategories(force = false) {
  if (state.categories && !force) return state.categories;
  const data = await get("/categories");
  state.categories = data.items;
  return state.categories;
}
