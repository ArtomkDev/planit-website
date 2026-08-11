"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { AndroidRobotLogo } from "@/components/ui/BrandIcons";
import { useState, useRef } from "react";

const PLAY_MARKET_URL = "https://play.google.com/store/apps/details?id=com.artomk.planit";

export const Footer = () => {
  const tNav = useTranslations("Navigation");
  const tHero = useTranslations("Hero");
  const tFooter = useTranslations("Footer");
  const locale = useLocale();
  const currentYear = new Date().getFullYear();

  const backgroundText = ["P", "l", "a", "n", "I", "t", "."];
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // Створюємо масив посилань на HTML-елементи кожної букви
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Точне відстеження мишки по реальних координатах букв
  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const mouseX = e.clientX;
    let foundIndex = null;

    // Перевіряємо кожну букву: чи знаходиться курсор в її межах по осі X
    for (let i = 0; i < letterRefs.current.length; i++) {
      const el = letterRefs.current[i];
      if (el) {
        const rect = el.getBoundingClientRect();
        if (mouseX >= rect.left && mouseX <= rect.right) {
          foundIndex = i;
          break; // Знайшли потрібну букву, зупиняємо цикл
        }
      }
    }

    if (hoveredIndex !== foundIndex) {
      setHoveredIndex(foundIndex);
    }
  };

  const handlePointerLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <footer
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative z-10 mt-auto w-full overflow-hidden border-t border-site-border bg-site-bg pb-8 pt-24"
    >
      {/* Задній шар з великими буквами */}
      <div className="pointer-events-none absolute inset-0 z-0 flex select-none items-center justify-center">
        <div className="flex w-full justify-center whitespace-nowrap text-[28vw] font-black leading-none tracking-tight">
          {backgroundText.map((letter, index) => (
            <motion.span
              key={index}
              ref={(el) => {
                letterRefs.current[index] = el;
              }}
              animate={{
                y: hoveredIndex === index ? "-8%" : "0%",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className={`inline-block cursor-default transition-colors duration-300 ${
                hoveredIndex === index
                  ? "text-brand"
                  : "text-site-surface-muted dark:text-site-surface/30"
              }`}
            >
              {letter}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Передній шар з контентом (Матове скло) */}
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-12 px-6 md:gap-24">
        
        <div className="grid grid-cols-1 gap-12 rounded-3xl bg-site-surface/68 p-8 shadow-[0_24px_70px_-48px_var(--site-surface-shadow)] ring-1 ring-site-border/70 backdrop-blur-md md:grid-cols-12 lg:gap-8">
          
          <div className="flex flex-col gap-6 md:col-span-6 lg:col-span-5">
            <Link href={`/${locale}`} className="w-fit text-4xl font-black tracking-tight text-site-text transition-colors hover:text-brand">
              PlanIt.
            </Link>
            <p className="max-w-sm text-sm font-medium leading-relaxed text-site-muted md:text-base">
              {tHero("description")}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <motion.a
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href={PLAY_MARKET_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={tFooter("status")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-site-border bg-site-surface-muted text-site-muted transition-colors hover:border-site-border-strong hover:bg-site-surface"
              >
                <AndroidRobotLogo className="h-5 w-5" />
              </motion.a>
            </div>
          </div>

          <div className="flex flex-col gap-6 md:col-span-3 lg:col-span-2 lg:col-start-8">
            <h2 className="text-sm font-bold tracking-tight text-site-text md:text-base">{tFooter("product")}</h2>
            <nav className="flex flex-col gap-4 text-sm font-medium text-site-muted">
              <Link href={`/${locale}`} className="w-fit transition-colors hover:text-brand">
                {tNav("home")}
              </Link>
              <Link href={`/${locale}#platforms`} className="w-fit transition-colors hover:text-brand">
                {tNav("platforms")}
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-6 md:col-span-3 lg:col-span-2">
            <h2 className="text-sm font-bold tracking-tight text-site-text md:text-base">{tFooter("legal")}</h2>
            <nav className="flex flex-col gap-4 text-sm font-medium text-site-muted">
              <Link href={`/${locale}/wiki/privacy`} className="w-fit transition-colors hover:text-brand">
                {tNav("privacy")}
              </Link>
              <Link href={`/${locale}/wiki/terms`} className="w-fit transition-colors hover:text-brand">
                {tNav("terms")}
              </Link>
              <Link href={`/${locale}/wiki/delete`} className="w-fit transition-colors hover:text-brand">
                {tNav("delete")}
              </Link>
              <Link href={`/${locale}/wiki/cookies`} className="w-fit transition-colors hover:text-brand">
                {tNav("cookies")}
              </Link>
              <Link href={`/${locale}/wiki/licenses`} className="w-fit transition-colors hover:text-brand">
                {tNav("licenses")}
              </Link>
            </nav>
          </div>
        </div>

        {/* Нижня панель */}
        <div className="flex w-full flex-col items-center justify-between gap-6 pt-2 text-xs font-medium text-site-soft md:flex-row">
          <div className="max-w-xl text-center md:text-left">
            <p>© {currentYear} PlanIt. {tFooter("rights")}</p>
            <p className="mt-2 text-[11px] leading-5 text-site-soft">
              {tFooter("androidAttribution")}
            </p>
          </div>
          <a
            href={PLAY_MARKET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-full border border-site-border bg-site-surface-muted px-3 py-1.5 transition-colors hover:border-brand/45 hover:text-brand"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="tracking-wide">{tFooter("status")}</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
