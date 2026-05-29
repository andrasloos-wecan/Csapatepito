import { create } from "zustand";
import api from "./api.js";

export const useAuth = create((set, get) => ({
  user: null,
  loading: true,

  async hydrate() {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data.user, loading: false });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, loading: false });
    }
  },

  async login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    set({ user: data.user });
    return data.user;
  },

  async register(payload) {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("token", data.token);
    set({ user: data.user });
    return data.user;
  },

  logout() {
    localStorage.removeItem("token");
    set({ user: null });
  },

  setOrganization(org) {
    const user = get().user;
    if (!user) return;
    set({ user: { ...user, organization: { ...user.organization, ...org } } });
  },
}));
