import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "user" | "moderator" | "admin";

interface AuthState {
  token: string | null;
  user: {
    username: string;
    role: UserRole;
  } | null;
  setAuth: (token: string, user: { username: string; role: UserRole }) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: "auth-storage",
    }
  )
);
