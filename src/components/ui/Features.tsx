"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Lightning, ShieldCheck, ArrowsMerge, Code } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { staggerContainer } from "@/lib/framer-variants";
import { BentoCard, ProximityBlock } from "@/components/ui/BentoCard";
import { useEffect, useRef } from "react";

function InteractiveGridPattern() {
  const gridRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const isHovered = useMotionValue(0);

  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 25 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 25 });
  const smoothHover = useSpring(isHovered, { stiffness: 50, damping: 25 });

  const x = useTransform(smoothX, [0, 1], ["-10%", "10%"]);
  const y = useTransform(smoothY, [0, 1], ["-10%", "10%"]);
  const scale = useTransform(smoothHover, [0, 1], [1, 1.25]);

  useEffect(() => {
    const cardElement = gridRef.current?.closest(".group\\/card");
    if (!cardElement) return;

    const handleMouseMove = (event: MouseEvent) => {
      const bounds = cardElement.getBoundingClientRect();
      mouseX.set((event.clientX - bounds.left) / bounds.width);
      mouseY.set((event.clientY - bounds.top) / bounds.height);
    };

    const handleMouseEnter = () => {
      isHovered.set(1);
    };

    const handleMouseLeave = () => {
      isHovered.set(0);
      mouseX.set(0.5);
      mouseY.set(0.5);
    };

    cardElement.addEventListener("mousemove", handleMouseMove as EventListener);
    cardElement.addEventListener("mouseenter", handleMouseEnter);
    cardElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cardElement.removeEventListener("mousemove", handleMouseMove as EventListener);
      cardElement.removeEventListener("mouseenter", handleMouseEnter);
      cardElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mouseX, mouseY, isHovered]);

  return (
    <motion.div
      ref={gridRef}
      style={{ x, y, scale }}
      className="absolute inset-0 w-full h-full transform-gpu origin-center"
    >
      <svg className="absolute -inset-[20%] w-[140%] h-[140%]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="interactive-grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 40V0h40" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400 dark:text-zinc-600/80" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#interactive-grid-pattern)" />
      </svg>
    </motion.div>
  );
}

export function Features() {
  const t = useTranslations("Features");

  const featureItems = [
    {
      icon: <Lightning className="w-8 h-8" weight="duotone" />,
      title: t("items.speed.title"),
      description: t("items.speed.description"),
    },
    {
      icon: <ShieldCheck className="w-8 h-8" weight="duotone" />,
      title: t("items.security.title"),
      description: t("items.security.description"),
    },
    {
      icon: <ArrowsMerge className="w-8 h-8" weight="duotone" />,
      title: t("items.sync.title"),
      description: t("items.sync.description"),
    },
    {
      icon: <Code className="w-8 h-8" weight="duotone" />,
      title: t("items.analytics.title"),
      description: t("items.analytics.description"),
    },
  ];

  return (
    <section id="features" className="relative z-20 mx-auto w-full max-w-7xl px-6 py-24 md:py-32">
      <ScrollReveal className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20">
        <span className="text-sm font-bold tracking-widest text-indigo-500 uppercase mb-4 block">
          {t("badge")}
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white mb-6 tracking-tight">
          {t("title")}
        </h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          {t("description")}
        </p>
      </ScrollReveal>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 perspective-1000"
      >
        {featureItems.map((item) => (
          <BentoCard
            key={item.title}
            pattern={<InteractiveGridPattern />}
            colorPrimary="rgba(99, 102, 241, 0.12)"
            colorSecondary="rgba(168, 85, 247, 0.12)"
            spotlightColor="rgba(99, 102, 241, 0.15)"
            contentClassName="pointer-events-none"
          >
            <ProximityBlock
              color="rgba(99, 102, 241, 0.8)"
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/90 dark:bg-zinc-950/90 text-indigo-500 mb-8 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_16px_-6px_rgba(0,0,0,0.4)] group-hover/card:scale-110 group-hover/card:-translate-y-1 transition-all duration-700 ease-[0.22,1,0.36,1]"
            >
              {item.icon}
            </ProximityBlock>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight group-hover/card:text-indigo-600 dark:group-hover/card:text-indigo-400 transition-colors duration-500">
              {item.title}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg mt-auto">
              {item.description}
            </p>
          </BentoCard>
        ))}
      </motion.div>
    </section>
  );
}
