'use client';

import { useState, type ComponentPropsWithoutRef, type MouseEvent } from 'react';
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

function buildAuthActionLocaleUrl(
  pathname: string,
  currentSearch: string,
  targetLocale: string,
) {
  const searchParams = new URLSearchParams(currentSearch);

  if (!searchParams.size) {
    return pathname;
  }

  searchParams.set('lang', targetLocale);

  const continueUrl = searchParams.get('continueUrl');

  if (continueUrl) {
    try {
      const parsedContinueUrl = new URL(continueUrl);
      parsedContinueUrl.searchParams.set('lang', targetLocale);
      searchParams.set('continueUrl', parsedContinueUrl.toString());
    } catch {
      // Preserve malformed values unchanged; AuthActionClient validates them.
    }
  }

  return `${pathname}?${searchParams.toString()}`;
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
  const isAuthActionPath = localeAgnosticPath === '/auth/action';
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

  function preserveAuthActionOnLocaleChange(event: MouseEvent<HTMLAnchorElement>) {
    if (!isAuthActionPath) return;

    event.preventDefault();
    window.location.assign(
      buildAuthActionLocaleUrl(togglePath, window.location.search, targetLocale),
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-site-border/70 bg-site-bg/72 shadow-[0_1px_0_rgba(255,255,255,0.55)_inset] backdrop-blur-2xl dark:shadow-none">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <HeaderLink documentNavigation={documentNavigation} href={`/${locale}`} className="text-2xl font-black tracking-tight text-site-text transition-colors hover:text-brand">
              PlanIt.
            </HeaderLink>
            <nav
              className="hidden items-center gap-1 rounded-full border border-site-border/80 bg-site-surface/62 p-1 text-sm font-bold text-site-muted shadow-sm backdrop-blur-xl lg:flex"
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
                      className="flex h-10 items-center gap-1.5 rounded-full px-4 transition-colors hover:bg-site-text hover:text-site-bg focus-visible:bg-site-text focus-visible:text-site-bg focus-visible:outline-none"
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
                      <div className="overflow-hidden rounded-[8px] border border-site-border bg-site-surface/95 p-2 shadow-[0_24px_70px_-32px_var(--site-surface-shadow)] backdrop-blur-2xl">
                        {section.items.map((item) => {
                          return (
                            <HeaderLink
                              key={item.href}
                              documentNavigation={documentNavigation}
                              href={item.href}
                              target={item.external ? '_blank' : undefined}
                              rel={item.external ? 'noopener noreferrer' : undefined}
                              onClick={closeMenu}
                              className="flex gap-3 rounded-[6px] p-3 text-left transition-colors hover:bg-site-surface-muted focus-visible:bg-site-surface-muted focus-visible:outline-none"
                            >
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-site-text text-site-bg">
                                {item.icon}
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-black text-site-text">{item.label}</span>
                                <span className="mt-0.5 block text-xs font-semibold leading-5 text-site-muted">{item.description}</span>
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
              className="hidden h-10 items-center justify-center gap-2 rounded-full bg-site-text px-4 text-sm font-black text-site-bg shadow-[0_14px_40px_-18px_var(--site-surface-shadow)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_46px_-18px_color-mix(in_srgb,var(--brand)_65%,transparent)] sm:inline-flex"
            >
              {t('openApp')}
              <ArrowRight weight="bold" className="h-4 w-4" />
            </HeaderLink>
            {onLocaleChange ? (
              <button
                type="button"
                onClick={onLocaleChange}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-site-border-strong/70 bg-site-surface-muted/75 text-xs font-black tracking-widest text-site-text backdrop-blur-md transition-colors hover:bg-site-surface"
              >
                {t('language')}
              </button>
            ) : (
              <HeaderLink
                documentNavigation={documentNavigation}
                href={togglePath}
                onClick={preserveAuthActionOnLocaleChange}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-site-border-strong/70 bg-site-surface-muted/75 text-xs font-black tracking-widest text-site-text backdrop-blur-md transition-colors hover:bg-site-surface"
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
        className={`pointer-events-none fixed inset-x-0 top-16 bottom-0 z-40 bg-site-bg/22 backdrop-blur-[10px] transition-opacity duration-300 ease-out ${
          isMenuOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </>
  );
};
