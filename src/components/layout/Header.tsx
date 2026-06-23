'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';

export const Header = () => {
  const t = useTranslations('Navigation');
  const locale = useLocale();
  const pathname = usePathname();

  const targetLocale = locale === 'en' ? 'uk' : 'en';
  const togglePath = pathname.replace(`/${locale}`, `/${targetLocale}`);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href={`/${locale}`} className="text-2xl font-black tracking-tighter text-indigo-500 dark:text-indigo-400">
            PlanIt.
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link href={`/${locale}`} className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
              {t('home')}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={togglePath}
            className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold tracking-widest text-zinc-800 dark:text-zinc-200 bg-zinc-200/50 dark:bg-zinc-800/50 hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 transition-colors backdrop-blur-md border border-zinc-300/50 dark:border-zinc-700/50"
          >
            {locale.toUpperCase() === 'EN' ? 'UK' : 'EN'}
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};