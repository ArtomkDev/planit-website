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
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);

  const smoothMouseX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 100, damping: 20 });
  const smoothTiltX = useSpring(tiltX, { stiffness: 120, damping: 15 });
  const smoothTiltY = useSpring(tiltY, { stiffness: 120, damping: 15 });

  const rotateX = useTransform(smoothTiltY, [-0.5, 0.5], ["6deg", "-6deg"]);
  const rotateY = useTransform(smoothTiltX, [-0.5, 0.5], ["-6deg", "6deg"]);

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

  const borderSpotlight = useMotionTemplate`radial-gradient(400px circle at ${smoothMouseX}px ${smoothMouseY}px, rgba(99, 102, 241, 0.5), transparent 80%)`;
  const cardSpotlight = useMotionTemplate`radial-gradient(600px circle at ${smoothMouseX}px ${smoothMouseY}px, rgba(99, 102, 241, 0.08), transparent 80%)`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      variants={fadeInUp}
      whileHover={{ scale: 0.98 }}
      className="relative group rounded-[2.5rem] p-[1px] transition-all duration-700 ease-out transform-gpu perspective-1000"
    >
      <motion.div
        className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ background: borderSpotlight }}
      />
      
      <div className="relative h-full flex flex-col gap-6 p-8 md:p-10 rounded-[2.5rem] bg-zinc-50/80 dark:bg-zinc-900/60 backdrop-blur-2xl border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden transform-gpu">
        
        <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-60 transition-opacity duration-700 mix-blend-overlay group-hover:opacity-70 dark:group-hover:opacity-80">
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M0 32V0h32" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400 dark:text-zinc-600/80" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>

        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"
          style={{ background: cardSpotlight }}
        />

        <div
          className="absolute inset-0 opacity-[0.15] dark:opacity-[0.05] pointer-events-none z-0 mix-blend-overlay"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />

        <div className="relative z-10 pointer-events-none transform-gpu flex flex-col h-full" style={{ transform: "translateZ(30px)" }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/90 dark:bg-zinc-950/90 text-indigo-500 mb-8 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_16px_-6px_rgba(0,0,0,0.4)] group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-700 ease-[0.22,1,0.36,1]">
            {icon}
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-500">
            {title}
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg mt-auto">
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