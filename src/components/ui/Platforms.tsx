"use client";

import { motion } from "framer-motion";
import { Browser, ArrowRight, Hourglass } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { staggerContainer } from "@/lib/framer-variants";
import { BentoCard, ProximityBlock } from "@/components/ui/BentoCard";
import { LessonCardAccent } from "@/components/ui/LessonCardAccent";
import { AndroidRobotLogo, AppleBrandLogo } from "@/components/ui/BrandIcons";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://planit-demo.web.app";
const PLAY_MARKET_URL = "https://play.google.com/store/apps/details?id=com.artomk.planit";

export function Platforms() {
  const t = useTranslations("Platforms");

  const platforms = [
    {
      title: t("items.android.title"),
      description: t("items.android.description"),
      buttonText: t("items.android.button"),
      statusText: t("items.android.status"),
      isDevelopment: false,
      href: PLAY_MARKET_URL,
      openInNewTab: true,
      icon: <AndroidRobotLogo className="w-8 h-8" />,
      buttonIcon: <AndroidRobotLogo className="w-6 h-6" />,
      spotlightColor: "rgba(62, 247, 210, 0.15)",
      colorPrimary: "rgba(62, 247, 210, 0.14)",
      colorSecondary: "rgba(62, 247, 210, 0.07)",
      buttonBgColor: "bg-brand-teal",
      buttonHoverColor: "hover:ring-4 hover:ring-brand-teal/40 ring-offset-2 ring-offset-site-surface hover:shadow-[0_10px_40px_-10px_rgba(62,247,210,0.85)]",
      buttonTextColor: "text-zinc-950",
      iconColor: "text-brand-teal",
      statusColor: "text-brand-teal-strong",
      statusSurface: "border-brand-teal/40 bg-brand-teal/10",
    },
    {
      title: t("items.web.title"),
      description: t("items.web.description"),
      buttonText: t("items.web.button"),
      statusText: t("items.web.status"),
      isDevelopment: false,
      href: APP_URL,
      openInNewTab: false,
      icon: <Browser className="w-8 h-8" weight="duotone" />,
      buttonIcon: <ArrowRight className="w-6 h-6" weight="bold" />,
      spotlightColor: "rgba(244, 91, 138, 0.15)",
      colorPrimary: "rgba(244, 91, 138, 0.14)",
      colorSecondary: "rgba(244, 91, 138, 0.07)",
      buttonBgColor: "bg-brand-pink",
      buttonHoverColor: "hover:ring-4 hover:ring-brand-pink/40 ring-offset-2 ring-offset-site-surface hover:shadow-[0_10px_40px_-10px_rgba(244,91,138,0.85)]",
      buttonTextColor: "text-white",
      iconColor: "text-brand-pink",
      statusColor: "text-brand-pink",
      statusSurface: "border-brand-pink/40 bg-brand-pink/10",
    },
    {
      title: t("items.ios.title"),
      description: t("items.ios.description"),
      buttonText: t("items.ios.button"),
      statusText: t("items.ios.status"),
      isDevelopment: true,
      href: null,
      openInNewTab: false,
      icon: <AppleBrandLogo className="w-8 h-8" />,
      buttonIcon: <Hourglass className="w-6 h-6 animate-pulse" weight="bold" />,
      spotlightColor: "rgba(161, 161, 170, 0.15)",
      colorPrimary: "rgba(161, 161, 170, 0.12)",
      colorSecondary: "rgba(212, 212, 216, 0.12)",
      buttonBgColor: "",
      buttonHoverColor: "",
      buttonTextColor: "text-zinc-400 dark:text-zinc-500",
      iconColor: "text-site-soft",
      statusColor: "text-zinc-500 dark:text-zinc-400",
      statusSurface: "border-zinc-300/50 bg-gradient-to-b from-zinc-100 to-zinc-200 dark:border-zinc-700/50 dark:from-zinc-800 dark:to-zinc-900",
    },
  ];

  return (
    <section id="platforms" className="relative z-20 mx-auto w-full max-w-7xl px-6 py-24 md:py-32">
      <LessonCardAccent seed={37} className="-right-64 top-[42%]" />
      <LessonCardAccent seed={38} depth="background" className="right-[18%] top-10" />
      <ScrollReveal className="relative z-20 flex flex-col items-center text-center max-w-3xl mx-auto mb-20">
        <span className="mb-4 block text-sm font-bold uppercase tracking-widest text-brand">
          {t("badge")}
        </span>
        <h2 className="text-4xl font-black tracking-tight text-site-text md:text-5xl lg:text-6xl">
          {t("title")}
        </h2>
      </ScrollReveal>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "50px" }}
        className="relative z-20 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 perspective-1000"
      >
        {platforms.map((item) => (
          <BentoCard
            key={item.title}
            colorPrimary={item.colorPrimary}
            colorSecondary={item.colorSecondary}
            spotlightColor={item.spotlightColor}
          >
            <div className="flex items-start justify-between mb-8 pointer-events-none">
              <ProximityBlock
                color={item.spotlightColor.replace("0.15", "0.8")}
                className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-site-border bg-site-surface/90 ${item.iconColor} shadow-[0_8px_18px_-10px_var(--site-surface-shadow)] backdrop-blur-xl transition-all duration-700 ease-[0.22,1,0.36,1] group-hover/card:-translate-y-1 group-hover/card:scale-110`}
              >
                {item.icon}
              </ProximityBlock>

              <ProximityBlock
                color={item.spotlightColor.replace("0.15", "0.8")}
                className={`rounded-lg border px-3.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ${item.statusSurface}`}
              >
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${item.statusColor}`}>
                  {item.statusText}
                </span>
              </ProximityBlock>
            </div>

            <h3 className="pointer-events-none mb-4 text-3xl font-black tracking-tight text-site-text transition-colors duration-500">
              {item.title}
            </h3>
            <p className="pointer-events-none mb-10 flex-grow text-lg leading-relaxed text-site-muted">
              {item.description}
            </p>

            <div
              className="mt-auto pointer-events-auto relative z-50 transform-gpu"
              style={{ transform: "translateZ(30px)" }}
            >
              {item.isDevelopment ? (
                <button
                  disabled
                  className="relative flex w-full cursor-not-allowed items-center justify-center rounded-2xl border border-zinc-300/40 bg-zinc-200/40 px-8 py-5 font-bold text-zinc-400 shadow-none dark:border-zinc-700/40 dark:bg-zinc-800/40 dark:text-zinc-500"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {item.buttonIcon}
                    {item.buttonText}
                  </span>
                </button>
              ) : (
                <motion.a
                  href={item.href ?? undefined}
                  target={item.openInNewTab ? "_blank" : undefined}
                  rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                  whileHover={{ y: -4, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`group/btn relative flex w-full items-center justify-center rounded-2xl px-8 py-5 font-bold shadow-xl transition-all duration-300 ease-out ${item.buttonBgColor} ${item.buttonTextColor} ${item.buttonHoverColor}`}
                >
                  <span className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {item.buttonIcon}
                    {item.buttonText}
                  </span>
                </motion.a>
              )}
            </div>
          </BentoCard>
        ))}
      </motion.div>
    </section>
  );
}
