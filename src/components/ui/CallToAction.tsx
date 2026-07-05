"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight } from "@phosphor-icons/react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { LessonCardAccent } from "@/components/ui/LessonCardAccent";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://planit-demo.web.app";

const shapeOneOuterVariants = {
  rest: {
    scale: 1,
    rotate: 0,
    x: 0,
    y: 0,
    opacity: 0.3,
    transition: { type: "spring", stiffness: 50, damping: 15 },
  },
  hover: {
    scale: 1.2,
    rotate: 45,
    x: 40,
    y: -40,
    opacity: 0.7,
    transition: { type: "spring", stiffness: 50, damping: 15 },
  },
  buttonHover: {
    scale: 1.8,
    rotate: 90,
    x: 70,
    y: -70,
    opacity: 0.9,
    transition: { type: "spring", stiffness: 50, damping: 12 },
  },
};

const shapeTwoOuterVariants = {
  rest: {
    scale: 1,
    rotate: 0,
    x: 0,
    y: 0,
    opacity: 0.3,
    transition: { type: "spring", stiffness: 50, damping: 15 },
  },
  hover: {
    scale: 1.25,
    rotate: -45,
    x: -40,
    y: 40,
    opacity: 0.7,
    transition: { type: "spring", stiffness: 50, damping: 15 },
  },
  buttonHover: {
    scale: 1.9,
    rotate: -90,
    x: -70,
    y: 70,
    opacity: 0.9,
    transition: { type: "spring", stiffness: 50, damping: 12 },
  },
};

export const CallToAction = () => {
  const t = useTranslations("CTA");
  const [isCardHovered, setIsCardHovered] = useState<boolean>(false);
  const [isButtonHovered, setIsButtonHovered] = useState<boolean>(false);

  const animationState = isButtonHovered ? "buttonHover" : isCardHovered ? "hover" : "rest";

  return (
    <section className="relative w-full max-w-5xl mx-auto px-6 py-24 md:py-32 z-20">
      <LessonCardAccent seed={59} className="-right-72 -top-2" />
      <LessonCardAccent seed={60} depth="background" className="right-[5%] bottom-4" />
      <ScrollReveal className="relative z-20">
        <div
          onMouseEnter={() => setIsCardHovered(true)}
          onMouseLeave={() => setIsCardHovered(false)}
          className="relative overflow-hidden rounded-[3rem] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-12 md:p-20 text-center transition-colors duration-500 shadow-xl dark:shadow-none"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#F45B8A]/5 via-transparent to-transparent dark:from-[#3EF7D2]/10 pointer-events-none z-0" />
          
          <motion.div
            variants={shapeOneOuterVariants}
            initial="rest"
            animate={animationState}
            className="absolute -top-16 -left-16 w-72 h-72 blur-[40px] pointer-events-none mix-blend-multiply dark:mix-blend-screen z-0"
          >
            <motion.div
              animate={{
                scale: [0.9, 0.95, 0.9],
                borderRadius: [
                  "40% 60% 70% 30% / 40% 50% 60% 50%",
                  "50% 50% 60% 40% / 50% 60% 50% 40%",
                  "40% 60% 70% 30% / 40% 50% 60% 50%",
                ],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-full h-full bg-[#3EF7D2]"
            />
          </motion.div>
          
          <motion.div
            variants={shapeTwoOuterVariants}
            initial="rest"
            animate={animationState}
            className="absolute -bottom-16 -right-16 w-80 h-80 blur-[40px] pointer-events-none mix-blend-multiply dark:mix-blend-screen z-0"
          >
            <motion.div
              animate={{
                scale: [0.9, 0.95, 0.9],
                borderRadius: [
                  "50% 50% 30% 70% / 50% 50% 70% 30%",
                  "40% 60% 40% 60% / 60% 40% 60% 40%",
                  "50% 50% 30% 70% / 50% 50% 70% 30%",
                ],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-full h-full bg-[#F45B8A]"
            />
          </motion.div>

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tight mb-6">
              {t("title")}
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-10">
              {t("description")}
            </p>
            
            <motion.a
              href={APP_URL}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
              className="group inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-lg transition-colors transition-shadow duration-300 shadow-[0_0_40px_-10px_rgba(0,0,0,0.15)] dark:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)]"
            >
              {t("button")}
              <ArrowRight 
                weight="bold" 
                className="w-5 h-5 text-[#F45B8A] transition-colors duration-300 group-hover:text-[#3EF7D2]" 
              />
            </motion.a>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};