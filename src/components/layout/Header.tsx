'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { ArrowRight } from '@phosphor-icons/react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://planit-demo.web.app';

export const Header = () => {
  const t = useTranslations('Navigation');
  const locale = useLocale();
  const pathname = usePathname();

  const targetLocale = locale === 'en' ? 'uk' : 'en';
  const togglePath = pathname.replace(`/${locale}`, `/${targetLocale}`);
  const navigationItems = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}#features`, label: t('features') },
    { href: `/${locale}#platforms`, label: t('platforms') },
    { href: `/${locale}#workflow`, label: t('workflow') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/60 bg-white/65 shadow-[0_1px_0_rgba(255,255,255,0.4)_inset] backdrop-blur-2xl dark:border-zinc-800/70 dark:bg-zinc-950/65">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href={`/${locale}`} className="text-2xl font-black tracking-tight text-zinc-950 transition-colors hover:text-indigo-500 dark:text-white dark:hover:text-indigo-400">
            PlanIt.
          </Link>
          <nav className="hidden items-center gap-1 rounded-full border border-zinc-200/70 bg-white/55 p-1 text-sm font-bold text-zinc-600 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-900/55 dark:text-zinc-400 lg:flex">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 transition-colors hover:bg-zinc-950 hover:text-white dark:hover:bg-white dark:hover:text-zinc-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={APP_URL}
            className="hidden h-10 items-center justify-center gap-2 rounded-full bg-zinc-950 px-4 text-sm font-black text-white shadow-[0_14px_40px_-18px_rgba(15,23,42,0.8)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_46px_-18px_rgba(79,70,229,0.85)] dark:bg-white dark:text-zinc-950 sm:inline-flex"
          >
            {t('openApp')}
            <ArrowRight weight="bold" className="h-4 w-4" />
          </Link>
          <Link
            href={togglePath}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300/60 bg-zinc-100/70 text-xs font-black tracking-widest text-zinc-800 backdrop-blur-md transition-colors hover:bg-zinc-200/80 dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-200 dark:hover:bg-zinc-700/80"
          >
            {t('language')}
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
