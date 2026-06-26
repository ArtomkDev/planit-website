"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { GithubLogo, TwitterLogo, DiscordLogo } from "@phosphor-icons/react";

export const Footer = () => {
  const tNav = useTranslations("Navigation");
  const tHero = useTranslations("Hero");
  const locale = useLocale();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full overflow-hidden bg-white dark:bg-[#09090b] border-t border-zinc-200 dark:border-zinc-900 pt-24 pb-8 mt-auto z-10">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <span className="text-[28vw] font-black leading-none text-zinc-50 dark:text-zinc-900/30 tracking-tighter w-full text-center whitespace-nowrap">
          PlanIt.
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col gap-16 md:gap-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
          <div className="flex flex-col gap-6 md:col-span-6 lg:col-span-5">
            <Link
              href={`/${locale}`}
              className="text-4xl font-black tracking-tighter text-indigo-500 dark:text-indigo-400 w-fit"
            >
              PlanIt.
            </Link>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-sm text-sm md:text-base font-medium leading-relaxed">
              {tHero("description")}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <motion.a
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href="https://github.com/ArtomkDev/PlanIt-website"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors border border-zinc-200/50 dark:border-zinc-800/50"
              >
                <GithubLogo weight="fill" className="w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href="#"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-[#5865F2] hover:text-white dark:hover:bg-[#5865F2] dark:hover:text-white transition-colors border border-zinc-200/50 dark:border-zinc-800/50"
              >
                <DiscordLogo weight="fill" className="w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href="#"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-[#1DA1F2] hover:text-white dark:hover:bg-[#1DA1F2] dark:hover:text-white transition-colors border border-zinc-200/50 dark:border-zinc-800/50"
              >
                <TwitterLogo weight="fill" className="w-5 h-5" />
              </motion.a>
            </div>
          </div>

          <div className="md:col-span-3 lg:col-span-2 lg:col-start-8 flex flex-col gap-6">
            <h4 className="text-zinc-900 dark:text-zinc-100 font-bold text-sm md:text-base tracking-tight">Product</h4>
            <nav className="flex flex-col gap-4 text-zinc-500 dark:text-zinc-400 font-medium text-sm">
              <Link href={`/${locale}`} className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors w-fit">
                {tNav("home")}
              </Link>
              <Link href={`/${locale}#features`} className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors w-fit">
                {tNav("features")}
              </Link>
            </nav>
          </div>

          <div className="md:col-span-3 lg:col-span-2 flex flex-col gap-6">
            <h4 className="text-zinc-900 dark:text-zinc-100 font-bold text-sm md:text-base tracking-tight">Legal</h4>
            <nav className="flex flex-col gap-4 text-zinc-500 dark:text-zinc-400 font-medium text-sm">
              <Link href={`/${locale}/privacy`} className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors w-fit">
                {tNav("privacy")}
              </Link>
              <Link href={`/${locale}/terms`} className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors w-fit">
                {tNav("terms")}
              </Link>
            </nav>
          </div>
        </div>

        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-zinc-200 dark:border-zinc-800/50 text-xs font-medium text-zinc-500 dark:text-zinc-500">
          <p>© {currentYear} PlanIt. All rights reserved.</p>
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="tracking-wide">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};