"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";
import {
  BellRinging,
  CalendarCheck,
  ListChecks,
  Paperclip,
  ShareNetwork,
} from "@phosphor-icons/react";
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
  const t = useTranslations("AppShowcase");

  const items: InfiniteRibbonItem[] = [
    {
      id: "schedule",
      label: t("ribbon.schedule"),
      icon: <CalendarCheck weight="duotone" className="w-8 h-8 text-amber-500" />,
    },
    {
      id: "tasks",
      label: t("ribbon.tasks"),
      icon: <ListChecks weight="duotone" className="w-8 h-8 text-emerald-500" />,
    },
    {
      id: "materials",
      label: t("ribbon.materials"),
      icon: <Paperclip weight="duotone" className="w-8 h-8 text-pink-500" />,
    },
    {
      id: "reminders",
      label: t("ribbon.reminders"),
      icon: <BellRinging weight="duotone" className="w-8 h-8 text-cyan-500" />,
    },
    {
      id: "sharing",
      label: t("ribbon.sharing"),
      icon: <ShareNetwork weight="duotone" className="w-8 h-8 text-indigo-500" />,
    },
  ];

  const duplicatedItems = [...items, ...items, ...items, ...items];

  return (
    <section className={cn("relative z-20 flex w-full items-center overflow-hidden border-y border-site-border/70 bg-site-surface/72 py-12 shadow-[0_18px_70px_-56px_var(--site-surface-shadow)] backdrop-blur-sm", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-30 w-32 bg-gradient-to-r from-site-surface to-transparent" />
      
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
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-site-border bg-site-surface-muted shadow-sm transition-all duration-500 ease-[0.22,1,0.36,1] group-hover:-translate-y-1 group-hover:scale-110">
              {item.icon}
            </div>
            <span className="whitespace-nowrap text-2xl font-black uppercase tracking-tighter text-site-text transition-colors duration-500 group-hover:text-brand md:text-3xl">
              {item.label}
            </span>
            <div className="ml-8 h-2 w-2 rounded-full bg-site-border-strong md:ml-16" />
          </div>
        ))}
      </motion.div>

      <div className="pointer-events-none absolute inset-y-0 right-0 z-30 w-32 bg-gradient-to-l from-site-surface to-transparent" />
    </section>
  );
}
