'use client';

import { useState, type ComponentPropsWithoutRef } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { ArrowRight, CaretDown, Certificate, Cookie, FileText, Lifebuoy, RocketLaunch, ShieldCheck, Trash } from '@phosphor-icons/react';
import { AndroidRobotLogo } from '@/components/ui/BrandIcons';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://planit-demo.web.app';
const PLAY_MARKET_URL = 'https://play.google.com/store/apps/details?id=com.artomk.planit';

interface HeaderProps {
  onLocaleChange?: () => void;
  documentNavigation?: boolean;
}

type HeaderLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
  documentNavigation?: boolean;
  href: string;
};

function HeaderLink({ documentNavigation, href, ...props }: HeaderLinkProps) {
  if (documentNavigation) {
    return <a href={href} {...props} />;
  }

  return <Link href={href} {...props} />;
}

export const Header = ({ onLocaleChange, documentNavigation }: HeaderProps) => {
  const t = useTranslations('Navigation');
  const locale = useLocale();
  const pathname = usePathname();
  const [menuState, setMenuState] = useState<{ pathname: string; section: string | null }>({
    pathname,
    section: null,
  });

  const targetLocale = locale === 'en' ? 'uk' : 'en';
  const localeAgnosticPath = pathname.replace(/^(?:\/(?:en|uk))+(?=\/|$)/, '');
  const togglePath = `/${targetLocale}${localeAgnosticPath === '/' ? '' : localeAgnosticPath}`;
  const menuSections = [
    {
      label: t('productSection'),
      items: [
        { href: APP_URL, label: t('openApp'), description: t('openAppDescription'), icon: <RocketLaunch weight="bold" className="h-5 w-5" />, external: true },
        { href: PLAY_MARKET_URL, label: t('playStore'), description: t('playStoreDescription'), icon: <AndroidRobotLogo className="h-5 w-5" />, external: true },
      ],
    },
    {
      label: t('documentsSection'),
      items: [
        { href: `/${locale}/wiki/terms`, label: t('terms'), description: t('termsDescription'), icon: <FileText weight="bold" className="h-5 w-5" /> },
        { href: `/${locale}/wiki/privacy`, label: t('privacy'), description: t('privacyDescription'), icon: <ShieldCheck weight="bold" className="h-5 w-5" /> },
        { href: `/${locale}/wiki/cookies`, label: t('cookies'), description: t('cookiesDescription'), icon: <Cookie weight="bold" className="h-5 w-5" /> },
        { href: `/${locale}/wiki/licenses`, label: t('licenses'), description: t('licensesDescription'), icon: <Certificate weight="bold" className="h-5 w-5" /> },
      ],
    },
    {
      label: t('supportSection'),
      items: [
        { href: `/${locale}/wiki/delete`, label: t('delete'), description: t('deleteDescription'), icon: <Trash weight="bold" className="h-5 w-5" /> },
        { href: 'mailto:support@planit-app.com', label: t('support'), description: t('supportDescription'), icon: <Lifebuoy weight="bold" className="h-5 w-5" />, external: true },
      ],
    },
  ];
  const openSection = menuState.pathname === pathname ? menuState.section : null;
  const isMenuOpen = openSection !== null;

  function closeMenu() {
    setMenuState({ pathname, section: null });
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  function openMenuSection(section: string) {
    setMenuState({ pathname, section });
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/60 bg-white/65 shadow-[0_1px_0_rgba(255,255,255,0.4)_inset] backdrop-blur-2xl dark:border-zinc-800/70 dark:bg-zinc-950/65">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <HeaderLink documentNavigation={documentNavigation} href={`/${locale}`} className="text-2xl font-black tracking-tight text-zinc-950 transition-colors hover:text-[#F45B8A] dark:text-white dark:hover:text-[#3EF7D2]">
              PlanIt.
            </HeaderLink>
            <nav
              className="hidden items-center gap-1 rounded-full border border-zinc-200/70 bg-white/55 p-1 text-sm font-bold text-zinc-600 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-900/55 dark:text-zinc-400 lg:flex"
              onMouseLeave={closeMenu}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  closeMenu();
                }
              }}
            >
              {menuSections.map((section) => {
                const isSectionOpen = openSection === section.label;

                return (
                  <div
                    key={section.label}
                    className="relative"
                    onMouseEnter={() => openMenuSection(section.label)}
                  >
                    <button
                      type="button"
                      aria-expanded={isSectionOpen}
                      onFocus={() => openMenuSection(section.label)}
                      className="flex h-10 items-center gap-1.5 rounded-full px-4 transition-colors hover:bg-zinc-950 hover:text-white focus-visible:bg-zinc-950 focus-visible:text-white focus-visible:outline-none dark:hover:bg-white dark:hover:text-zinc-950 dark:focus-visible:bg-white dark:focus-visible:text-zinc-950"
                    >
                      {section.label}
                      <CaretDown weight="bold" className={`h-3.5 w-3.5 transition-transform duration-200 ${isSectionOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <div
                      className={`absolute left-1/2 top-full w-[22rem] -translate-x-1/2 pt-3 transition-all duration-200 ease-out ${
                        isSectionOpen
                          ? 'visible translate-y-0 opacity-100'
                          : 'invisible -translate-y-1 opacity-0 pointer-events-none'
                      }`}
                    >
                      <div className="overflow-hidden rounded-[8px] border border-zinc-200/80 bg-white/95 p-2 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.45)] backdrop-blur-2xl dark:border-zinc-800/80 dark:bg-zinc-950/95">
                        {section.items.map((item) => {
                          return (
                            <HeaderLink
                              key={item.href}
                              documentNavigation={documentNavigation}
                              href={item.href}
                              target={item.external ? '_blank' : undefined}
                              rel={item.external ? 'noopener noreferrer' : undefined}
                              onClick={closeMenu}
                              className="flex gap-3 rounded-[6px] p-3 text-left transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100 focus-visible:outline-none dark:hover:bg-zinc-900 dark:focus-visible:bg-zinc-900"
                            >
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                                {item.icon}
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-black text-zinc-950 dark:text-white">{item.label}</span>
                                <span className="mt-0.5 block text-xs font-semibold leading-5 text-zinc-500 dark:text-zinc-400">{item.description}</span>
                              </span>
                            </HeaderLink>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <HeaderLink
              documentNavigation={documentNavigation}
              href={APP_URL}
              className="hidden h-10 items-center justify-center gap-2 rounded-full bg-zinc-950 px-4 text-sm font-black text-white shadow-[0_14px_40px_-18px_rgba(15,23,42,0.8)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_46px_-18px_rgba(244,91,138,0.65)] dark:bg-white dark:text-zinc-950 sm:inline-flex"
            >
              {t('openApp')}
              <ArrowRight weight="bold" className="h-4 w-4" />
            </HeaderLink>
            {onLocaleChange ? (
              <button
                type="button"
                onClick={onLocaleChange}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300/60 bg-zinc-100/70 text-xs font-black tracking-widest text-zinc-800 backdrop-blur-md transition-colors hover:bg-zinc-200/80 dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-200 dark:hover:bg-zinc-700/80"
              >
                {t('language')}
              </button>
            ) : (
              <HeaderLink
                documentNavigation={documentNavigation}
                href={togglePath}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300/60 bg-zinc-100/70 text-xs font-black tracking-widest text-zinc-800 backdrop-blur-md transition-colors hover:bg-zinc-200/80 dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-200 dark:hover:bg-zinc-700/80"
              >
                {t('language')}
              </HeaderLink>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-x-0 top-16 bottom-0 z-40 bg-white/18 backdrop-blur-[10px] transition-opacity duration-300 ease-out dark:bg-zinc-950/22 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </>
  );
};
