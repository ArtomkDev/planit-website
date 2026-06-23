'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export const Footer = () => {
  const t = useTranslations('Navigation');
  const locale = useLocale();

  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 py-8 mt-auto backdrop-blur-md bg-zinc-50/50 dark:bg-zinc-950/50">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
        <p>© {new Date().getFullYear()} PlanIt Architecture.</p>
        <div className="flex items-center gap-6 font-medium">
          <Link href={`/${locale}/privacy`} className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
            {t('privacy')}
          </Link>
          <Link href={`/${locale}/terms`} className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
            {t('terms')}
          </Link>
        </div>
      </div>
    </footer>
  );
};