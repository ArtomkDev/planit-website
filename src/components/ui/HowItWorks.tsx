"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

export const HowItWorks = () => {
  const t = useTranslations("HowItWorks");
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const steps = [
    { num: "01", title: t("steps.step1.title"), desc: t("steps.step1.description") },
    { num: "02", title: t("steps.step2.title"), desc: t("steps.step2.description") },
    { num: "03", title: t("steps.step3.title"), desc: t("steps.step3.description") },
  ];

  return (
    <section className="relative w-full max-w-4xl mx-auto px-6 py-24 md:py-32 z-20">
      <ScrollReveal className="text-center mb-20">
        <span className="text-sm font-bold tracking-widest text-cyan-500 uppercase mb-4 block">
          {t("badge")}
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
          {t("title")}
        </h2>
      </ScrollReveal>

      <div ref={containerRef} className="relative flex flex-col gap-24">
        <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-[2px] bg-zinc-200 dark:bg-zinc-800 -translate-x-1/2 rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 w-full bg-gradient-to-b from-indigo-500 to-cyan-400"
            style={{ height: lineHeight }}
          />
        </div>

        {steps.map((step, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <ScrollReveal
              key={idx}
              className={`relative flex flex-col md:flex-row items-start md:items-center w-full ${
                isEven ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className="hidden md:block md:w-1/2" />
              
              <div className="absolute left-[27px] md:left-1/2 w-14 h-14 bg-white dark:bg-zinc-950 border-4 border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center -translate-x-1/2 z-10 shadow-xl text-zinc-400 dark:text-zinc-500 font-bold text-lg">
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-indigo-500 opacity-0"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-150px" }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                />
                {step.num}
              </div>

              <div
                className={`w-full md:w-1/2 pl-20 md:pl-0 ${
                  isEven ? "md:pr-16 text-left md:text-right" : "md:pl-16 text-left"
                }`}
              >
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm">
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                    {step.desc}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
};