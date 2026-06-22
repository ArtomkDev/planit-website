"use client";

import { motion } from "framer-motion";
import { RocketLaunch, ArrowRight } from "@phosphor-icons/react";
import { fadeInUp, staggerContainer } from "@/lib/framer-variants";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-200 via-zinc-50 to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-950 opacity-60"></div>
      
      <motion.div 
        className="relative z-10 max-w-5xl mx-auto px-6 text-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeInUp} className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200 text-sm font-medium backdrop-blur-md border border-zinc-300/50 dark:border-zinc-700/50">
            <RocketLaunch weight="duotone" className="w-5 h-5 text-indigo-500" />
            PlanIt Architecture Initialized
          </span>
        </motion.div>

        <motion.h1 
          variants={fadeInUp}
          className="text-6xl md:text-8xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-8"
        >
          Master Your Time with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-400">PlanIt</span>
        </motion.h1>

        <motion.p 
          variants={fadeInUp}
          className="text-lg md:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto mb-10"
        >
          Seamless execution meets flawless design. Experience a new tier of productivity wrapped in an interface that anticipates your every move.
        </motion.p>

        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)]">
            Start Planning
            <ArrowRight weight="bold" className="w-5 h-5" />
          </button>
          <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-transparent hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white font-semibold border border-zinc-300 dark:border-zinc-700 transition-all">
            Explore Features
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}