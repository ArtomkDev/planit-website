"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight } from "@phosphor-icons/react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

export const CallToAction = () => {
  const t = useTranslations("CTA");

  return (
    <section className="relative w-full max-w-5xl mx-auto px-6 py-24 md:py-32 z-20">
      <ScrollReveal>
        <div className="relative overflow-hidden rounded-[3rem] bg-zinc-900 dark:bg-zinc-900 border border-zinc-800 dark:border-zinc-800 p-12 md:p-20 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-zinc-900/0 to-zinc-900/0 pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
              {t("title")}
            </h2>
            <p className="text-xl text-zinc-400 mb-10">
              {t("description")}
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-white text-zinc-900 font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)]"
            >
              {t("button")}
              <ArrowRight weight="bold" className="w-5 h-5 text-indigo-500" />
            </motion.button>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};