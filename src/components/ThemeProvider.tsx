"use client";
import { useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme attrs
    root.removeAttribute("data-theme");
    if (theme !== "blue") {
      root.setAttribute("data-theme", theme);
    }
  }, [theme]);

  return <>{children}</>;
}
