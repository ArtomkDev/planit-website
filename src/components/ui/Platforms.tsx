"use client";

import { motion } from "framer-motion";
import { Browser, DownloadSimple, ArrowRight, Hourglass, AndroidLogo, AppleLogo } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { staggerContainer } from "@/lib/framer-variants";
import { BentoCard, ProximityBlock } from "@/components/ui/BentoCard";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://planit-demo.web.app";
const SOURCE_URL = "https://github.com/ArtomkDev/PlanIt";

export function Platforms() {
  const t = useTranslations("Platforms");

  const platforms = [
    {
      title: t("items.android.title"),
      description: t("items.android.description"),
      buttonText: t("items.android.button"),
      statusText: t("items.android.status"),
      isDevelopment: false,
      href: SOURCE_URL,
      openInNewTab: true,
      icon: <AndroidLogo className="w-8 h-8" weight="fill" />,
      buttonIcon: <DownloadSimple className="w-6 h-6" weight="bold" />,
      spotlightColor: "rgba(16, 185, 129, 0.15)",
      colorPrimary: "rgba(16, 185, 129, 0.12)",
      colorSecondary: "rgba(52, 211, 153, 0.12)",
      buttonBgColor: "bg-emerald-500",
      buttonHoverColor: "hover:ring-4 hover:ring-emerald-500/40 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.8)]",
      iconColor: "text-emerald-500",
    },
    {
      title: t("items.web.title"),
      description: t("items.web.description"),
      buttonText: t("items.web.button"),
      statusText: t("items.web.status"),
      isDevelopment: false,
      href: APP_URL,
      openInNewTab: false,
      icon: <Browser className="w-8 h-8" weight="fill" />,
      buttonIcon: <ArrowRight className="w-6 h-6" weight="bold" />,
      spotlightColor: "rgba(139, 92, 246, 0.15)",
      colorPrimary: "rgba(139, 92, 246, 0.12)",
      colorSecondary: "rgba(167, 139, 250, 0.12)",
      buttonBgColor: "bg-violet-500",
      buttonHoverColor: "hover:ring-4 hover:ring-violet-500/40 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 hover:shadow-[0_10px_40px_-10px_rgba(139,92,246,0.8)]",
      iconColor: "text-violet-500",
    },
    {
      title: t("items.ios.title"),
      description: t("items.ios.description"),
      buttonText: t("items.ios.button"),
      statusText: t("items.ios.status"),
      isDevelopment: true,
      href: null,
      openInNewTab: false,
      icon: <AppleLogo className="w-8 h-8" weight="fill" />,
      buttonIcon: <Hourglass className="w-6 h-6 animate-pulse" weight="bold" />,
      spotlightColor: "rgba(161, 161, 170, 0.15)",
      colorPrimary: "rgba(161, 161, 170, 0.12)",
      colorSecondary: "rgba(212, 212, 216, 0.12)",
      buttonBgColor: "",
      buttonHoverColor: "",
      iconColor: "text-zinc-500 dark:text-zinc-300",
    },
  ];

  return (
    <section id="platforms" className="relative z-20 mx-auto w-full max-w-7xl px-6 py-24 md:py-32">
      <ScrollReveal className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20">
        <span className="text-sm font-bold tracking-widest text-indigo-500 uppercase mb-4 block">
          {t("badge")}
        </span>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-zinc-900 dark:text-white tracking-tight">
          {t("title")}
        </h2>
      </ScrollReveal>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "50px" }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 perspective-1000"
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
                className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/90 dark:bg-zinc-950/90 ${item.iconColor} backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_16px_-6px_rgba(0,0,0,0.4)] group-hover/card:scale-110 group-hover/card:-translate-y-1 transition-all duration-700 ease-[0.22,1,0.36,1]`}
              >
                {item.icon}
              </ProximityBlock>

              <ProximityBlock
                color={item.spotlightColor.replace("0.15", "0.8")}
                className={`rounded-lg border px-3.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ${
                  item.isDevelopment
                    ? "border-zinc-300/50 bg-gradient-to-b from-zinc-100 to-zinc-200 dark:border-zinc-700/50 dark:from-zinc-800 dark:to-zinc-900"
                    : "border-emerald-300/50 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/40"
                }`}
              >
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${item.isDevelopment ? "text-zinc-500 dark:text-zinc-400" : "text-emerald-700 dark:text-emerald-300"}`}>
                  {item.statusText}
                </span>
              </ProximityBlock>
            </div>

            <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight transition-colors duration-500 pointer-events-none">
              {item.title}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg mb-10 flex-grow pointer-events-none">
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
                  className={`group/btn relative flex w-full items-center justify-center rounded-2xl px-8 py-5 font-bold text-white shadow-xl transition-all duration-300 ease-out ${item.buttonBgColor} ${item.buttonHoverColor}`}
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
