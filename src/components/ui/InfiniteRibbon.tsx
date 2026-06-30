"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";
import { Lightning, ShieldCheck, ArrowsMerge, Code, Star } from "@phosphor-icons/react";
import { cn } from "@/lib/utils/classNames";

export interface InfiniteRibbonItem {
  id: string;
  label: string;
  icon: ReactNode;
}

export interface InfiniteRibbonProps {
  className?: string;
  speed?: number;
}

export function InfiniteRibbon({ className, speed = 35 }: InfiniteRibbonProps) {
  const t = useTranslations("Features");

  const items: InfiniteRibbonItem[] = [
    {
      id: "speed",
      label: t("items.speed.title"),
      icon: <Lightning weight="duotone" className="w-8 h-8 text-amber-500" />,
    },
    {
      id: "security",
      label: t("items.security.title"),
      icon: <ShieldCheck weight="duotone" className="w-8 h-8 text-emerald-500" />,
    },
    {
      id: "sync",
      label: t("items.sync.title"),
      icon: <ArrowsMerge weight="duotone" className="w-8 h-8 text-cyan-500" />,
    },
    {
      id: "analytics",
      label: t("items.analytics.title"),
      icon: <Code weight="duotone" className="w-8 h-8 text-indigo-500" />,
    },
    {
      id: "premium",
      label: t("title"),
      icon: <Star weight="duotone" className="w-8 h-8 text-pink-500" />,
    },
  ];

  const duplicatedItems = [...items, ...items, ...items, ...items];

  return (
    <section className={cn("relative w-full overflow-hidden py-12 bg-white dark:bg-[#09090b] border-y border-zinc-200/50 dark:border-zinc-800/50 z-20 flex items-center", className)}>
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white dark:from-[#09090b] to-transparent z-30 pointer-events-none" />
      
      <motion.div
        className="flex w-max shrink-0 items-center transform-gpu"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: speed,
        }}
      >
        {duplicatedItems.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="flex items-center gap-4 px-8 md:px-16 group cursor-default"
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500 ease-[0.22,1,0.36,1]">
              {item.icon}
            </div>
            <span className="text-2xl md:text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase whitespace-nowrap transition-colors duration-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400">
              {item.label}
            </span>
            <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700 ml-8 md:ml-16" />
          </div>
        ))}
      </motion.div>

      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white dark:from-[#09090b] to-transparent z-30 pointer-events-none" />
    </section>
  );
}
