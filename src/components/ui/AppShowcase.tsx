"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Palette, CloudArrowUp, ShareNetwork, AppWindow } from "@phosphor-icons/react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { staggerContainer } from "@/lib/framer-variants";
import { BentoCard, ProximityBlock } from "@/components/ui/BentoCard";

export function AppShowcase() {
  const t = useTranslations("AppShowcase");

  const items = [
    {
      title: t("items.customization.title"),
      description: t("items.customization.description"),
      icon: <Palette className="w-8 h-8 text-pink-500" weight="duotone" />,
      colorPrimary: "rgba(236, 72, 153, 0.12)",
      colorSecondary: "rgba(244, 63, 94, 0.12)",
      spotlightColor: "rgba(236, 72, 153, 0.15)",
      className: "md:col-span-2",
    },
    {
      title: t("items.sync.title"),
      description: t("items.sync.description"),
      icon: <CloudArrowUp className="w-8 h-8 text-cyan-500" weight="duotone" />,
      colorPrimary: "rgba(6, 182, 212, 0.12)",
      colorSecondary: "rgba(59, 130, 246, 0.12)",
      spotlightColor: "rgba(6, 182, 212, 0.15)",
      className: "md:col-span-1",
    },
    {
      title: t("items.sharing.title"),
      description: t("items.sharing.description"),
      icon: <ShareNetwork className="w-8 h-8 text-amber-500" weight="duotone" />,
      colorPrimary: "rgba(245, 158, 11, 0.12)",
      colorSecondary: "rgba(249, 115, 22, 0.12)",
      spotlightColor: "rgba(245, 158, 11, 0.15)",
      className: "md:col-span-1",
    },
    {
      title: t("items.widgets.title"),
      description: t("items.widgets.description"),
      icon: <AppWindow className="w-8 h-8 text-emerald-500" weight="duotone" />,
      colorPrimary: "rgba(16, 185, 129, 0.12)",
      colorSecondary: "rgba(20, 184, 166, 0.12)",
      spotlightColor: "rgba(16, 185, 129, 0.15)",
      className: "md:col-span-2",
    },
  ];

  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 py-24 z-20">
      <ScrollReveal className="flex flex-col items-start mb-16">
        <span className="text-sm font-bold tracking-widest text-indigo-500 uppercase mb-4 block">
          {t("badge")}
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight max-w-2xl">
          {t("title")}
        </h2>
      </ScrollReveal>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px] perspective-1000"
      >
        {items.map((item) => (
          <BentoCard
            key={item.title}
            className={item.className}
            colorPrimary={item.colorPrimary}
            colorSecondary={item.colorSecondary}
            spotlightColor={item.spotlightColor}
            contentClassName="pointer-events-none"
          >
            <div
              style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}
              className="mb-8"
            >
              <ProximityBlock
                color={item.spotlightColor.replace("0.15", "0.8")}
                className="inline-flex shrink-0 items-center justify-center w-16 h-16 rounded-2xl bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl shadow-[0_8px_16px_-6px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_16px_-6px_rgba(0,0,0,0.4)] border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-900 dark:text-white group-hover/card:scale-110 group-hover/card:-translate-y-2 transform-gpu transition-all duration-700 ease-[0.22,1,0.36,1]"
              >
                {item.icon}
              </ProximityBlock>
            </div>

            <h3
              style={{ transform: "translateZ(20px)" }}
              className="text-2xl font-bold text-zinc-900 dark:text-white mb-3 tracking-tight transition-colors duration-500"
            >
              {item.title}
            </h3>

            <p
              style={{ transform: "translateZ(10px)" }}
              className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed max-w-md transition-colors duration-500"
            >
              {item.description}
            </p>
          </BentoCard>
        ))}
      </motion.div>
    </section>
  );
}
