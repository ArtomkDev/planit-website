"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { GithubLogo } from "@phosphor-icons/react";

const SOURCE_URL = "https://github.com/ArtomkDev/PlanIt";

export const Footer = () => {
  const tNav = useTranslations("Navigation");
  const tHero = useTranslations("Hero");
  const tFooter = useTranslations("Footer");
  const locale = useLocale();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-auto w-full overflow-hidden border-t border-zinc-200 bg-white pt-24 pb-8 dark:border-zinc-900 dark:bg-[#09090b]">
      <div className="pointer-events-none absolute inset-0 z-0 flex select-none items-center justify-center">
        <span className="w-full whitespace-nowrap text-center text-[28vw] font-black leading-none tracking-tight text-zinc-50 dark:text-zinc-900/30">
          PlanIt.
        </span>
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-16 px-6 md:gap-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-6 md:col-span-6 lg:col-span-5">
            <Link href={`/${locale}`} className="w-fit text-4xl font-black tracking-tight text-zinc-950 transition-colors hover:text-indigo-500 dark:text-white dark:hover:text-indigo-400">
              PlanIt.
            </Link>
            <p className="max-w-sm text-sm font-medium leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-base">
              {tHero("description")}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <motion.a
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href={SOURCE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200/50 bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200 dark:border-zinc-800/50 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <GithubLogo weight="fill" className="h-5 w-5" />
              </motion.a>
            </div>
          </div>

          <div className="flex flex-col gap-6 md:col-span-3 lg:col-span-2 lg:col-start-8">
            <h2 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-base">{tFooter("product")}</h2>
            <nav className="flex flex-col gap-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              <Link href={`/${locale}`} className="w-fit transition-colors hover:text-indigo-500 dark:hover:text-indigo-400">
                {tNav("home")}
              </Link>
              <Link href={`/${locale}#features`} className="w-fit transition-colors hover:text-indigo-500 dark:hover:text-indigo-400">
                {tNav("features")}
              </Link>
              <Link href={`/${locale}#platforms`} className="w-fit transition-colors hover:text-indigo-500 dark:hover:text-indigo-400">
                {tNav("platforms")}
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-6 md:col-span-3 lg:col-span-2">
            <h2 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-base">{tFooter("legal")}</h2>
            <nav className="flex flex-col gap-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              <Link href={`/${locale}/privacy`} className="w-fit transition-colors hover:text-indigo-500 dark:hover:text-indigo-400">
                {tNav("privacy")}
              </Link>
              <Link href={`/${locale}/terms`} className="w-fit transition-colors hover:text-indigo-500 dark:hover:text-indigo-400">
                {tNav("terms")}
              </Link>
              <Link href={`/${locale}/delete`} className="w-fit transition-colors hover:text-indigo-500 dark:hover:text-indigo-400">
                {tNav("delete")}
              </Link>
            </nav>
          </div>
        </div>

        <div className="flex w-full flex-col items-center justify-between gap-6 border-t border-zinc-200 pt-6 text-xs font-medium text-zinc-500 dark:border-zinc-800/50 dark:text-zinc-500 md:flex-row">
          <p>© {currentYear} PlanIt. {tFooter("rights")}</p>
          <a
            href={SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1.5 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:border-indigo-800 dark:hover:text-indigo-300"
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
