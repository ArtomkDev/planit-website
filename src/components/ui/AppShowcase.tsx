"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { Palette, CloudArrowUp, ShareNetwork, AppWindow } from "@phosphor-icons/react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { fadeInUp, staggerContainer } from "@/lib/framer-variants";
import { MouseEvent, useRef } from "react";

interface BentoCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  colorPrimary: string;
  colorSecondary: string;
  spotlightColor: string;
}

const BentoCard = ({
  title,
  description,
  icon,
  className = "",
  colorPrimary,
  colorSecondary,
  spotlightColor,
}: BentoCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);

  const smoothMouseX = useSpring(mouseX, { stiffness: 120, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 120, damping: 20 });
  const smoothTiltX = useSpring(tiltX, { stiffness: 100, damping: 18 });
  const smoothTiltY = useSpring(tiltY, { stiffness: 100, damping: 18 });

  const rotateX = useTransform(smoothTiltY, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(smoothTiltX, [-0.5, 0.5], ["-8deg", "8deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;

    mouseX.set(localX);
    mouseY.set(localY);
    tiltX.set(localX / width - 0.5);
    tiltY.set(localY / height - 0.5);
  };

  const handleMouseLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  const spotlight = useMotionTemplate`radial-gradient(700px circle at ${smoothMouseX}px ${smoothMouseY}px, ${spotlightColor}, transparent 100%)`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      variants={fadeInUp}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      whileHover={{ scale: 0.98 }}
      className={`relative overflow-hidden rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col justify-between group transition-all duration-700 perspective-1000 transform-gpu ${className}`}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none overflow-hidden rounded-[2rem] z-0">
        <motion.div
          animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] blur-[140px] opacity-60 mix-blend-normal dark:mix-blend-lighten"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%, ${colorPrimary} 0%, transparent 20%, ${colorSecondary} 50%, transparent 80%, ${colorPrimary} 100%)`,
          }}
        />

        <motion.div
          animate={{ rotate: [360, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[50%] -right-[50%] w-[200%] h-[200%] blur-[120px] opacity-50 mix-blend-normal dark:mix-blend-lighten"
          style={{
            background: `radial-gradient(ellipse at center, ${colorSecondary} 0%, transparent 70%)`,
          }}
        />

        <motion.div
          className="absolute inset-0 z-10 opacity-80"
          style={{ background: spotlight }}
        />

        <div
          className="absolute inset-0 z-20 mix-blend-overlay opacity-[0.15] dark:opacity-[0.08]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-30 pointer-events-none transform-gpu" style={{ transform: "translateZ(40px)" }}>
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl shadow-[0_8px_16px_-6px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_16px_-6px_rgba(0,0,0,0.4)] border border-zinc-100 dark:border-zinc-800/50 text-zinc-900 dark:text-white mb-8 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-700 ease-[0.22,1,0.36,1]">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3 tracking-tight transition-colors duration-500">
          {title}
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed max-w-md transition-colors duration-500">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export const AppShowcase = () => {
  const t = useTranslations("AppShowcase");

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
        <BentoCard
          title={t("items.customization.title")}
          description={t("items.customization.description")}
          icon={<Palette weight="duotone" className="w-7 h-7 text-pink-500" />}
          colorPrimary="rgba(236, 72, 153, 0.12)"
          colorSecondary="rgba(244, 63, 94, 0.12)"
          spotlightColor="rgba(236, 72, 153, 0.15)"
          className="md:col-span-2"
        />
        <BentoCard
          title={t("items.sync.title")}
          description={t("items.sync.description")}
          icon={<CloudArrowUp weight="duotone" className="w-7 h-7 text-cyan-500" />}
          colorPrimary="rgba(6, 182, 212, 0.12)"
          colorSecondary="rgba(59, 130, 246, 0.12)"
          spotlightColor="rgba(6, 182, 212, 0.15)"
          className="md:col-span-1"
        />
        <BentoCard
          title={t("items.sharing.title")}
          description={t("items.sharing.description")}
          icon={<ShareNetwork weight="duotone" className="w-7 h-7 text-amber-500" />}
          colorPrimary="rgba(245, 158, 11, 0.12)"
          colorSecondary="rgba(249, 115, 22, 0.12)"
          spotlightColor="rgba(245, 158, 11, 0.15)"
          className="md:col-span-1"
        />
        <BentoCard
          title={t("items.widgets.title")}
          description={t("items.widgets.description")}
          icon={<AppWindow weight="duotone" className="w-7 h-7 text-emerald-500" />}
          colorPrimary="rgba(16, 185, 129, 0.12)"
          colorSecondary="rgba(20, 184, 166, 0.12)"
          spotlightColor="rgba(16, 185, 129, 0.15)"
          className="md:col-span-2"
        />
      </motion.div>
    </section>
  );
};