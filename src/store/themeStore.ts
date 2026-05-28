import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "blue" | "emerald" | "purple" | "rose" | "orange" | "dark";

interface ThemeState {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "blue",
      setTheme: (theme) => set({ theme }),
    }),
    { name: "arka-theme" }
  )
);
