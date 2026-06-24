"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Palette, CloudArrowUp, ShareNetwork, AppWindow } from "@phosphor-icons/react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { fadeInUp, staggerContainer } from "@/lib/framer-variants";

interface BentoCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  gradient: string;
}

const BentoCard = ({ title, description, icon, className = "", gradient }: BentoCardProps) => {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ scale: 0.98 }}
      className={`relative overflow-hidden rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col justify-between group transition-all duration-500 ${className}`}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br ${gradient} pointer-events-none`} />
      
      <div className="relative z-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white dark:bg-zinc-950 shadow-md border border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-white mb-6 group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
          {title}
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed max-w-md">
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
        className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]"
      >
        <BentoCard
          title={t("items.customization.title")}
          description={t("items.customization.description")}
          icon={<Palette weight="duotone" className="w-6 h-6 text-pink-500" />}
          gradient="from-pink-500/10 to-rose-400/10"
          className="md:col-span-2"
        />
        <BentoCard
          title={t("items.sync.title")}
          description={t("items.sync.description")}
          icon={<CloudArrowUp weight="duotone" className="w-6 h-6 text-cyan-500" />}
          gradient="from-cyan-500/10 to-blue-500/10"
          className="md:col-span-1"
        />
        <BentoCard
          title={t("items.sharing.title")}
          description={t("items.sharing.description")}
          icon={<ShareNetwork weight="duotone" className="w-6 h-6 text-amber-500" />}
          gradient="from-amber-500/10 to-orange-500/10"
          className="md:col-span-1"
        />
        <BentoCard
          title={t("items.widgets.title")}
          description={t("items.widgets.description")}
          icon={<AppWindow weight="duotone" className="w-6 h-6 text-emerald-500" />}
          gradient="from-emerald-500/10 to-teal-500/10"
          className="md:col-span-2"
        />
      </motion.div>
    </section>
  );
};