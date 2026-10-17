"use client";

import { createContext, useContext, useEffect, type ReactNode, useSyncExternalStore } from "react";
import { MotionConfig } from "framer-motion";

type Theme = "dark" | "light";
const ThemeContext = createContext<{ theme: Theme; setTheme: (theme: Theme) => void } | undefined>(undefined);
let sessionTheme: Theme | null = null;
const themeEvent = "planit:theme-change";

function getSystemTheme(): Theme {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function getTheme(): Theme {
  if (sessionTheme) return sessionTheme;
  try {
    const stored = window.localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // The preference remains usable for this session when storage is blocked.
  }
  return getSystemTheme();
}
function subscribe(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  function storage(event: StorageEvent) {
    if (event.key === "theme" || event.key === null) {
      sessionTheme = null;
      callback();
    }
  }
  window.addEventListener("storage", storage);
  window.addEventListener(themeEvent, callback);
  media.addEventListener("change", callback);
  return () => {
    window.removeEventListener("storage", storage);
    window.removeEventListener(themeEvent, callback);
    media.removeEventListener("change", callback);
  };
}
function setTheme(theme: Theme) {
  sessionTheme = theme;
  try { window.localStorage.setItem("theme", theme); } catch { /* Session fallback. */ }
  window.dispatchEvent(new Event(themeEvent));
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "light" as Theme);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return <ThemeContext.Provider value={{ theme, setTheme }}>
    <MotionConfig reducedMotion="user">{children}</MotionConfig>
  </ThemeContext.Provider>;
}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
