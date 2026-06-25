"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Browser, DownloadSimple, ArrowRight, Hourglass } from "@phosphor-icons/react";
import { FaAndroid, FaApple } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { fadeInUp, staggerContainer } from "@/lib/framer-variants";
import { useRef, MouseEvent } from "react";

interface PlatformCardProps {
  title: string;
  description: string;
  buttonText: string;
  statusText: string;
  isDevelopment: boolean;
  icon: React.ReactNode;
  buttonIcon: React.ReactNode;
  spotlightColor: string;
  buttonBgColor: string;
  buttonHoverColor: string;
  iconColor: string;
}

const PlatformCard = ({
  title,
  description,
  buttonText,
  statusText,
  isDevelopment,
  icon,
  buttonIcon,
  spotlightColor,
  buttonBgColor,
  buttonHoverColor,
  iconColor,
}: PlatformCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);

  const smoothMouseX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 100, damping: 20 });
  const smoothTiltX = useSpring(tiltX, { stiffness: 120, damping: 15 });
  const smoothTiltY = useSpring(tiltY, { stiffness: 120, damping: 15 });

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

  const spotlight = useMotionTemplate`radial-gradient(600px circle at ${smoothMouseX}px ${smoothMouseY}px, ${spotlightColor}, transparent 80%)`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      variants={fadeInUp}
      whileHover={{ scale: 0.98 }}
      className="relative group flex flex-col h-full rounded-[2.5rem] bg-zinc-50/80 dark:bg-zinc-900/60 backdrop-blur-2xl border border-zinc-200/50 dark:border-zinc-800/50 p-[1px] transition-all duration-700 ease-out transform-gpu perspective-1000"
    >
      <motion.div
        className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"
        style={{ background: spotlight }}
      />

      <div
        className="absolute inset-0 opacity-[0.15] dark:opacity-[0.05] pointer-events-none z-0 mix-blend-overlay rounded-[2.5rem]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div
        className="relative z-10 flex flex-col h-full p-8 md:p-10 pointer-events-none transform-gpu"
        style={{ transform: "translateZ(30px)" }}
      >
        <div className="flex items-start justify-between mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/90 dark:bg-zinc-950/90 ${iconColor} backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_16px_-6px_rgba(0,0,0,0.4)] group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-700 ease-[0.22,1,0.36,1]`}>
            {icon}
          </div>
          {isDevelopment && (
            <span className="px-3.5 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase rounded-lg bg-gradient-to-b from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-300/50 dark:border-zinc-700/50 text-zinc-500 dark:text-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              {statusText}
            </span>
          )}
        </div>

        <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight transition-colors duration-500">
          {title}
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg mb-10 flex-grow">
          {description}
        </p>

        <div className="mt-auto pointer-events-auto">
          <motion.button
            whileHover={isDevelopment ? {} : { scale: 1.05 }}
            whileTap={isDevelopment ? {} : { scale: 0.95 }}
            disabled={isDevelopment}
            className={`w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-bold text-white transition-all shadow-xl ${
              isDevelopment
                ? "bg-zinc-200/40 dark:bg-zinc-800/40 text-zinc-400 dark:text-zinc-500 cursor-not-allowed shadow-none border border-zinc-300/40 dark:border-zinc-700/40"
                : `${buttonBgColor} ${buttonHoverColor}`
            }`}
          >
            {buttonIcon}
            {buttonText}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export const Platforms = () => {
  const t = useTranslations("Platforms");

  const platformsData = [
    {
      title: t("items.android.title"),
      description: t("items.android.description"),
      buttonText: t("items.android.button"),
      statusText: t("items.android.status"),
      isDevelopment: false,
      icon: <FaAndroid className="w-8 h-8" />,
      buttonIcon: <DownloadSimple weight="bold" className="w-6 h-6" />,
      spotlightColor: "rgba(16, 185, 129, 0.15)",
      buttonBgColor: "bg-emerald-500",
      buttonHoverColor: "hover:bg-emerald-600 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]",
      iconColor: "text-emerald-500",
    },
    {
      title: t("items.web.title"),
      description: t("items.web.description"),
      buttonText: t("items.web.button"),
      statusText: t("items.web.status"),
      isDevelopment: false,
      icon: <Browser weight="fill" className="w-8 h-8" />,
      buttonIcon: <ArrowRight weight="bold" className="w-6 h-6" />,
      spotlightColor: "rgba(139, 92, 246, 0.15)",
      buttonBgColor: "bg-violet-500",
      buttonHoverColor: "hover:bg-violet-600 hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.5)]",
      iconColor: "text-violet-500",
    },
    {
      title: t("items.ios.title"),
      description: t("items.ios.description"),
      buttonText: t("items.ios.button"),
      statusText: t("items.ios.status"),
      isDevelopment: true,
      icon: <FaApple className="w-8 h-8" />,
      buttonIcon: <Hourglass weight="bold" className="w-6 h-6 animate-pulse" />,
      spotlightColor: "rgba(161, 161, 170, 0.15)",
      buttonBgColor: "",
      buttonHoverColor: "",
      iconColor: "text-zinc-500 dark:text-zinc-300",
    },
  ];

  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 py-24 md:py-32 z-20">
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
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 perspective-1000"
      >
        {platformsData.map((item, idx) => (
          <PlatformCard key={idx} {...item} />
        ))}
      </motion.div>
    </section>
  );
};