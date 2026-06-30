"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { Moon, Sun } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("Navigation");
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200 backdrop-blur-md border border-zinc-300/50 dark:border-zinc-700/50 hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 will-change-transform"
      aria-label={t("theme")}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: mounted && theme === "dark" ? 360 : 0,
          scale: mounted ? 1 : 0.8,
          opacity: mounted ? 1 : 0,
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute flex items-center justify-center will-change-[opacity,transform]"
      >
        {mounted && theme === "dark" ? (
          <Moon weight="duotone" className="h-5 w-5 text-indigo-400" />
        ) : (
          <Sun weight="duotone" className="h-5 w-5 text-amber-500" />
        )}
      </motion.div>
    </motion.button>
  );
};
