'use client';

import { useEffect, useRef, useState, type ComponentPropsWithoutRef, type MouseEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { ArrowRight, CaretDown, Certificate, Cookie, FileText, Lifebuoy, List, RocketLaunch, ShieldCheck, Trash, X } from '@phosphor-icons/react';
import { AndroidRobotLogo } from '@/components/ui/BrandIcons';
import { Wordmark } from '@/components/ui/Wordmark';
import { APP_URL, PLAY_MARKET_URL, SUPPORT_URL, buildLocaleUrl } from '@/lib/site';

interface HeaderProps {
  onLocaleChange?: () => void;
  documentNavigation?: boolean;
}
type HeaderLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
  documentNavigation?: boolean;
  href: string;
};
function HeaderLink({ documentNavigation, href, ...props }: HeaderLinkProps) {
  return documentNavigation ? <a href={href} {...props} /> : <Link href={href} {...props} />;
}

export const Header = ({ onLocaleChange, documentNavigation }: HeaderProps) => {
  const t = useTranslations('Navigation');
  const locale = useLocale();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const [menu, setMenu] = useState({ pathname, section: '', mobile: false });
  const section = menu.pathname === pathname ? menu.section : '';
  const mobileOpen = menu.pathname === pathname && menu.mobile;
  const targetLocale = locale === 'en' ? 'uk' : 'en';
  const sections: { id: string; label: string; items: { href: string; label: string; description: string; icon: ReactNode; external?: boolean }[] }[] = [
    { id: 'product', label: t('productSection'), items: [
      { href: APP_URL, label: t('openApp'), description: t('openAppDescription'), icon: <RocketLaunch weight="bold" className="h-5 w-5" />, external: false },
      { href: PLAY_MARKET_URL, label: t('playStore'), description: t('playStoreDescription'), icon: <AndroidRobotLogo className="h-5 w-5" />, external: true },
    ] },
    { id: 'documents', label: t('documentsSection'), items: [
      { href: `/${locale}/wiki/terms`, label: t('terms'), description: t('termsDescription'), icon: <FileText weight="bold" className="h-5 w-5" /> },
      { href: `/${locale}/wiki/privacy`, label: t('privacy'), description: t('privacyDescription'), icon: <ShieldCheck weight="bold" className="h-5 w-5" /> },
      { href: `/${locale}/wiki/cookies`, label: t('cookies'), description: t('cookiesDescription'), icon: <Cookie weight="bold" className="h-5 w-5" /> },
      { href: `/${locale}/wiki/licenses`, label: t('licenses'), description: t('licensesDescription'), icon: <Certificate weight="bold" className="h-5 w-5" /> },
    ] },
    { id: 'support', label: t('supportSection'), items: [
      { href: `/${locale}/wiki/delete`, label: t('delete'), description: t('deleteDescription'), icon: <Trash weight="bold" className="h-5 w-5" /> },
      { href: SUPPORT_URL, label: t('support'), description: t('supportDescription'), icon: <Lifebuoy weight="bold" className="h-5 w-5" /> },
    ] },
  ];

  function closeMenu() { setMenu({ pathname, section: '', mobile: false }); }

  useEffect(() => {
    if (!section && !mobileOpen) return;
    function dismiss(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setMenu({ pathname, section: '', mobile: false });
      }
    }
    function escape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setMenu({ pathname, section: '', mobile: false });
      (mobileOpen ? mobileTriggerRef.current : triggerRef.current)?.focus();
    }
    function resize() { setMenu({ pathname, section: '', mobile: false }); }
    const media = window.matchMedia('(min-width: 1024px)');
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    media.addEventListener('change', resize);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
      media.removeEventListener('change', resize);
    };
  }, [pathname, section, mobileOpen]);

  function changeLocale(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    window.location.assign(buildLocaleUrl(pathname, window.location.search, window.location.hash, targetLocale));
  }

  function links(items: (typeof sections)[number]['items']) {
    return items.map(item => (
      <HeaderLink key={item.href} documentNavigation={documentNavigation} href={item.href}
        target={item.external ? '_blank' : undefined} rel={item.external ? 'noopener noreferrer' : undefined}
        aria-current={pathname === item.href ? 'page' : undefined} onClick={closeMenu}
        className="flex min-h-11 gap-3 rounded-md p-3 text-left transition-colors hover:bg-site-surface-muted aria-[current=page]:bg-site-surface-muted">
        <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-site-text text-site-bg">{item.icon}</span>
        <span className="min-w-0"><span className="block text-sm font-bold text-site-text">{item.label}</span>
          <span className="mt-0.5 block text-xs leading-5 text-site-muted">{item.description}</span></span>
      </HeaderLink>
    ));
  }

  return (
    <header ref={headerRef} className="sticky top-0 z-50 w-full border-b border-site-border/70 bg-site-bg/95 backdrop-blur-2xl"
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) closeMenu(); }}>
      <a href="#main-content" className="skip-link">{t('skipContent')}</a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <HeaderLink documentNavigation={documentNavigation} href={`/${locale}`} className="text-2xl font-black tracking-tight text-site-text transition-opacity hover:opacity-75"><Wordmark /></HeaderLink>
          <nav aria-label={t('globalNavigation')} className="hidden items-center gap-1 text-sm font-bold text-site-muted lg:flex">
            {sections.map(group => {
              const open = section === group.id;
              const active = group.items.some(item => item.href === pathname);
              return <div key={group.id} className="relative">
                <button type="button" aria-expanded={open} aria-controls={`header-${group.id}`} data-active={active || undefined}
                  onClick={event => { triggerRef.current = event.currentTarget; setMenu({ pathname, section: open ? '' : group.id, mobile: false }); }}
                  className="flex min-h-11 items-center gap-1.5 rounded-lg px-4 transition-colors hover:bg-site-surface-muted hover:text-site-text aria-expanded:bg-site-surface-muted aria-expanded:text-site-text data-[active=true]:text-brand-strong">
                  {group.label}<CaretDown aria-hidden="true" weight="bold" className={`h-3.5 w-3.5 ${open ? 'rotate-180' : ''}`} />
                </button>
                <div id={`header-${group.id}`} hidden={!open} className="absolute left-0 top-full w-[22rem] pt-3">
                  <div className="rounded-lg border border-site-border bg-site-surface p-2 shadow-[0_24px_70px_-32px_var(--site-surface-shadow)]">{links(group.items)}</div>
                </div>
              </div>;
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <HeaderLink documentNavigation={documentNavigation} href={APP_URL} className="hidden min-h-11 items-center justify-center gap-2 rounded-full bg-site-text px-4 text-sm font-bold text-site-bg hover:opacity-85 sm:inline-flex">
            {t('openApp')}<ArrowRight aria-hidden="true" weight="bold" className="h-4 w-4" />
          </HeaderLink>
          {onLocaleChange ? <button type="button" onClick={onLocaleChange} aria-label={t('switchLanguage')} className="inline-flex header-icon">{t('language')}</button>
            : <HeaderLink documentNavigation={documentNavigation} href={buildLocaleUrl(pathname, '', '', targetLocale)} onClick={changeLocale} aria-label={t('switchLanguage')} className="inline-flex header-icon">{t('language')}</HeaderLink>}
          <ThemeToggle />
          <button ref={mobileTriggerRef} type="button" className="inline-flex header-icon lg:hidden" aria-label={t(mobileOpen ? 'closeMenu' : 'openMenu')} aria-expanded={mobileOpen} aria-controls="mobile-navigation"
            onClick={() => setMenu({ pathname, section: '', mobile: !mobileOpen })}>{mobileOpen ? <X aria-hidden="true" size={22} /> : <List aria-hidden="true" size={22} />}</button>
        </div>
      </div>
      <nav id="mobile-navigation" aria-label={t('globalNavigation')} hidden={!mobileOpen} className="absolute inset-x-0 top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto border-y border-site-border bg-site-surface px-4 py-3 shadow-lg lg:hidden">
        {sections.map(group => <div key={group.id} className="mx-auto max-w-xl py-2">
          <h2 className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-site-muted">{group.label}</h2>{links(group.items)}
        </div>)}
      </nav>
    </header>
  );
};
