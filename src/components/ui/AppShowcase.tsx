"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  AppWindow,
  BellRinging,
  CheckSquare,
  CloudArrowUp,
  Palette,
  Paperclip,
  ShareNetwork,
} from "@phosphor-icons/react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { staggerContainer } from "@/lib/framer-variants";
import { BentoCard, ProximityBlock } from "@/components/ui/BentoCard";
import { LessonCardAccent } from "@/components/ui/LessonCardAccent";

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
      title: t("items.tasks.title"),
      description: t("items.tasks.description"),
      icon: <CheckSquare className="w-8 h-8 text-indigo-500" weight="duotone" />,
      colorPrimary: "rgba(99, 102, 241, 0.12)",
      colorSecondary: "rgba(139, 92, 246, 0.12)",
      spotlightColor: "rgba(99, 102, 241, 0.15)",
      className: "md:col-span-1",
    },
    {
      title: t("items.reminders.title"),
      description: t("items.reminders.description"),
      icon: <BellRinging className="w-8 h-8 text-cyan-500" weight="duotone" />,
      colorPrimary: "rgba(6, 182, 212, 0.12)",
      colorSecondary: "rgba(59, 130, 246, 0.12)",
      spotlightColor: "rgba(6, 182, 212, 0.15)",
      className: "md:col-span-1",
    },
    {
      title: t("items.materials.title"),
      description: t("items.materials.description"),
      icon: <Paperclip className="w-8 h-8 text-emerald-500" weight="duotone" />,
      colorPrimary: "rgba(16, 185, 129, 0.12)",
      colorSecondary: "rgba(20, 184, 166, 0.12)",
      spotlightColor: "rgba(16, 185, 129, 0.15)",
      className: "md:col-span-2",
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
      icon: <AppWindow className="w-8 h-8 text-rose-500" weight="duotone" />,
      colorPrimary: "rgba(244, 63, 94, 0.12)",
      colorSecondary: "rgba(236, 72, 153, 0.12)",
      spotlightColor: "rgba(244, 63, 94, 0.15)",
      className: "md:col-span-1",
    },
    {
      title: t("items.sync.title"),
      description: t("items.sync.description"),
      icon: <CloudArrowUp className="w-8 h-8 text-violet-500" weight="duotone" />,
      colorPrimary: "rgba(139, 92, 246, 0.12)",
      colorSecondary: "rgba(99, 102, 241, 0.12)",
      spotlightColor: "rgba(139, 92, 246, 0.15)",
      className: "md:col-span-1",
    },
  ];

  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 py-24 z-20">
      <LessonCardAccent seed={23} className="-left-64 top-[34%]" />
      <LessonCardAccent seed={24} depth="background" className="left-[16%] bottom-6" />
      <ScrollReveal className="relative z-20 flex flex-col items-start mb-16">
        <span className="mb-4 block text-sm font-bold uppercase tracking-widest text-brand">
          {t("badge")}
        </span>
        <h2 className="max-w-2xl text-4xl font-black tracking-tight text-site-text md:text-5xl">
          {t("title")}
        </h2>
      </ScrollReveal>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-20 grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)] perspective-1000"
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
                className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-site-border bg-site-surface/90 text-site-text shadow-[0_8px_18px_-10px_var(--site-surface-shadow)] backdrop-blur-xl transition-all duration-700 ease-[0.22,1,0.36,1] group-hover/card:-translate-y-2 group-hover/card:scale-110 transform-gpu"
              >
                {item.icon}
              </ProximityBlock>
            </div>

            <h3
              style={{ transform: "translateZ(20px)" }}
              className="mb-3 text-2xl font-bold tracking-tight text-site-text transition-colors duration-500"
            >
              {item.title}
            </h3>

            <p
              style={{ transform: "translateZ(10px)" }}
              className="max-w-md font-medium leading-relaxed text-site-muted transition-colors duration-500"
            >
              {item.description}
            </p>
          </BentoCard>
        ))}
      </motion.div>
    </section>
  );
}
