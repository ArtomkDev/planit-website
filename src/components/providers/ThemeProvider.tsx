"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useSyncExternalStore } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("theme") as Theme | null;
  return stored || getSystemTheme();
}

const themeStore = {
  getSnapshot: () => getStoredTheme(),
  subscribe: () => () => {},
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot, getSystemTheme) as Theme;
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const root = document.documentElement;
    const initialTheme = theme;
    if (initialTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const currentTheme = getStoredTheme();
          if (currentTheme === "dark" && !root.classList.contains("dark")) {
            root.classList.add("dark");
          } else if (currentTheme === "light" && root.classList.contains("dark")) {
            root.classList.remove("dark");
          }
        }
      });
    });

    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    const handler = () => forceUpdate({});
    window.addEventListener("storage", handler);
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", handler);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", handler);
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", handler);
    };
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    forceUpdate({});
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
