"use client";

import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { Lightning, ShieldCheck, ArrowsMerge, Code } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { fadeInUp, staggerContainer } from "@/lib/framer-variants";
import { useRef, MouseEvent } from "react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const mouseXSpring = useSpring(tiltX, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(tiltY, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

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

  const borderBackground = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(99, 102, 241, 0.4), transparent 80%)`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      variants={fadeInUp}
      className="relative group rounded-[2.5rem] p-[1px] transition-transform duration-500"
    >
      <motion.div
        className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ background: borderBackground }}
      />
      
      <div className="relative h-full flex flex-col gap-6 p-8 md:p-10 rounded-[2.5rem] bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden transform-gpu">
        
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg_at_50%_50%,rgba(99,102,241,0.08)_0deg,rgba(6,182,212,0.08)_120deg,rgba(236,72,153,0.08)_240deg,rgba(99,102,241,0.08)_360deg)] dark:bg-[conic-gradient(from_0deg_at_50%_50%,rgba(99,102,241,0.18)_0deg,rgba(6,182,212,0.18)_120deg,rgba(236,72,153,0.18)_240deg,rgba(99,102,241,0.18)_360deg)] blur-3xl opacity-80"
          />
          <motion.div
            animate={{ rotate: [360, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15)_0%,transparent_50%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.25)_0%,transparent_50%)] blur-2xl mix-blend-overlay"
          />
        </div>

        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-[0.12] dark:group-hover:opacity-[0.06] transition-opacity duration-1000 pointer-events-none z-0 mix-blend-overlay"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />

        <div className="relative z-10 pointer-events-none" style={{ transform: "translateZ(40px)" }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-100/50 dark:bg-zinc-800/50 text-indigo-500 mb-6 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-700/50 shadow-inner group-hover:scale-110 transition-transform duration-700 ease-out">
            {icon}
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-500">
            {title}
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export const Features = () => {
  const t = useTranslations("Features");

  const featureItems = [
    {
      icon: <Lightning weight="duotone" className="w-8 h-8" />,
      title: t("items.speed.title"),
      description: t("items.speed.description"),
    },
    {
      icon: <ShieldCheck weight="duotone" className="w-8 h-8" />,
      title: t("items.security.title"),
      description: t("items.security.description"),
    },
    {
      icon: <ArrowsMerge weight="duotone" className="w-8 h-8" />,
      title: t("items.sync.title"),
      description: t("items.sync.description"),
    },
    {
      icon: <Code weight="duotone" className="w-8 h-8" />,
      title: t("items.analytics.title"),
      description: t("items.analytics.description"),
    },
  ];

  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 py-24 md:py-32 z-20">
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
        {featureItems.map((item, idx) => (
          <FeatureCard key={idx} {...item} />
        ))}
      </motion.div>
    </section>
  );
};