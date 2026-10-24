"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { FloatingSchedule } from "@/components/ui/FloatingSchedule";
import { AndroidRobotLogo } from "@/components/ui/BrandIcons";
import { PixelDisplay } from "@/components/ui/PixelDisplay";
import { AccentRule } from "@/components/ui/AccentRule";

import { APP_URL, PLAY_MARKET_URL } from "@/lib/site";

export function Hero() {
  const t = useTranslations("Hero");
  const reduceMotion = useReducedMotion();

  return (
    <section id="top" className="relative -mt-16 flex min-h-svh items-center overflow-hidden bg-site-bg pt-16 transition-colors duration-500 lg:min-h-[min(52rem,100svh)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,var(--brand-soft),transparent_34%),linear-gradient(var(--site-grid)_1px,transparent_1px),linear-gradient(90deg,var(--site-grid)_1px,transparent_1px)] bg-[size:auto,44px_44px,44px_44px] opacity-65 dark:opacity-30" />
      <PixelDisplay />

      <motion.div
        initial={false}
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
          },
        }}
        className="relative z-20 mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)] items-center gap-14 px-6 pb-16 pt-24 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,.94fr)] lg:gap-20 lg:pb-20 lg:pt-28"
      >
        <div className="hero-copy w-full min-w-0 max-w-[610px] text-left">
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            className="mb-6"
          >
            <span className="inline-flex max-w-full items-center gap-3 text-[13px] font-bold uppercase leading-relaxed tracking-[0.1em] text-site-muted">
              <AccentRule />
              {t("badge")}
            </span>
          </motion.div>

          <motion.h1
            variants={{
              hidden: { opacity: 0, scale: 0.94 },
              visible: { opacity: 1, scale: 1 },
            }}
            className="text-[clamp(2.5rem,6vw,3rem)] font-black leading-[1.08] tracking-[-0.04em] text-site-text sm:text-6xl md:text-7xl"
          >
            <span className="block">{t("title1")}</span>
            <span className="block text-brand-strong dark:text-brand">
              {t("title2")}
            </span>
          </motion.h1>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 18 },
              visible: { opacity: 1, y: 0 },
            }}
            className="mt-6 max-w-lg text-pretty text-lg leading-8 text-site-muted"
          >
            {t("description")}
          </motion.p>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 18 },
              visible: { opacity: 1, y: 0 },
            }}
            className="mt-8 flex flex-col items-start justify-start gap-3 sm:flex-row sm:flex-wrap"
          >
            <motion.a
              href={APP_URL}
              whileHover={reduceMotion ? undefined : { y: -3, scale: 1.025 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-site-text px-6 py-3.5 font-bold text-site-bg shadow-[0_12px_28px_-16px_var(--site-surface-shadow)] transition-all motion-safe:hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-18px_var(--site-surface-shadow)] sm:w-auto"
            >
              {t("ctaPrimary")}
              <ArrowRight size={19} weight="bold" />
            </motion.a>
            <motion.a
              href={PLAY_MARKET_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={reduceMotion ? undefined : { y: -3, scale: 1.015 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[14px] border border-site-border-strong bg-site-surface/78 px-6 py-3.5 font-bold text-site-text shadow-sm backdrop-blur-md transition-colors hover:border-brand/35 hover:bg-site-surface sm:w-auto"
            >
              <AndroidRobotLogo className="h-[19px] w-[19px]" />
              {t("ctaSecondary")}
            </motion.a>
          </motion.div>
        </div>

        <div className="w-full">
          <FloatingSchedule />
        </div>
      </motion.div>
    </section>
  );
}
