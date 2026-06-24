"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { Moon, Sun } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200 backdrop-blur-md border border-zinc-300/50 dark:border-zinc-700/50 hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 will-change-transform"
      aria-label="Toggle theme"
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