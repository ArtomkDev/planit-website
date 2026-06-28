"use client";

import { motion } from "framer-motion";
import { RocketLaunch, ArrowRight, ArrowDown } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

export const HeroContent = () => {
  const t = useTranslations("Hero");

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.4,
          },
        },
      }}
      className="relative z-10 max-w-6xl mx-auto px-6 w-full pointer-events-none"
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 30, scale: 0.9 },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
          },
        }}
        className="flex justify-center mb-12 pointer-events-auto"
      >
        <span className="relative inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/80 dark:bg-zinc-900/80 text-zinc-900 dark:text-zinc-100 text-sm font-bold tracking-wide backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)]">
          <div className="absolute -inset-3 bg-[#3EF7D2]/20 dark:bg-[#3EF7D2]/10 rounded-full blur-xl opacity-60" />
          <RocketLaunch weight="duotone" className="w-5 h-5 text-[#F45B8A] dark:text-[#F45B8A] relative" />
          <span className="relative">{t("badge")}</span>
        </span>
      </motion.div>

      <motion.h1
        variants={{
          hidden: { opacity: 0, y: 60 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] },
          },
        }}
        className="text-6xl sm:text-7xl md:text-8xl lg:text-[8rem] font-black tracking-tighter text-center text-zinc-900 dark:text-white leading-[0.85] pointer-events-auto"
      >
        <span className="block">{t("title1")}</span>{" "}
        <span className="relative inline-block mt-2">
          <span className="absolute -inset-4 blur-[60px] bg-[#F45B8A]/20 dark:bg-[#F45B8A]/15 rounded-full opacity-70" />
          <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-[#3EF7D2] via-indigo-500 to-[#F45B8A] dark:from-[#3EF7D2] dark:via-indigo-400 dark:to-[#F45B8A]">
            {t("title2")}
          </span>
        </span>
      </motion.h1>

      <motion.p
        variants={{
          hidden: { opacity: 0, y: 40 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 },
          },
        }}
        className="mt-10 text-lg md:text-xl lg:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto text-center leading-relaxed font-medium pointer-events-auto"
      >
        {t("description")}
      </motion.p>

      <motion.div
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.45 },
          },
        }}
        className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-5 pointer-events-auto"
      >
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-[#F45B8A] hover:bg-[#d44874] dark:bg-[#F45B8A] dark:hover:bg-[#d44874] text-white font-bold text-lg shadow-[0_0_80px_-20px_rgba(244,91,138,0.6)] dark:shadow-[0_0_80px_-20px_rgba(244,91,138,0.4)] transition-all duration-300"
        >
          <span className="relative flex items-center gap-3">
            {t("ctaPrimary")}
            <ArrowRight weight="bold" className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold text-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:border-zinc-700 hover:shadow-[0_24px_60px_-20px_rgba(62,247,210,0.15)] dark:hover:shadow-[0_24px_60px_-20px_rgba(62,247,210,0.3)] transition-all duration-300"
        >
          {t("ctaSecondary")}
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.0, duration: 1.0 }}
        className="mt-32 flex flex-col items-center gap-4 pointer-events-auto"
      >
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">{t("scrollLabel")}</span>
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
          <ArrowDown weight="bold" className="w-5 h-5 text-[#3EF7D2] dark:text-[#3EF7D2]" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};