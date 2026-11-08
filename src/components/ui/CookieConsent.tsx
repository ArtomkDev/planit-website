"use client";

import { ArrowRight, Cookie, X } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CookieConsentChoice } from "@/lib/firebase";
import { parseCookiePreference } from "@/lib/cookie-preferences";
import { isAnalyticsPage } from "@/lib/analytics-consent";
import { usePathname } from "next/navigation";

const storageKey = "planit-cookie-consent";
const preferencesEvent = "planit:cookie-preferences";
function readConsent(): CookieConsentChoice | null {
  try {
    return parseCookiePreference(window.localStorage.getItem(storageKey));
  } catch { /* Treat unreadable storage as no consent. */ }
  return null;
}
const subscribe = () => () => {};
export const CookieConsent = () => {
  const t = useTranslations("CookieConsent");
  const locale = useLocale();
  const analyticsAllowed = isAnalyticsPage(usePathname());
  const reduceMotion = useReducedMotion();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const [choice, setChoice] = useState<CookieConsentChoice | null>(null);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const synced = useRef<CookieConsentChoice | null>(null);
  const acceptButton = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const effective = choice ?? (mounted ? readConsent() : null);
  const visible = mounted && (preferencesOpen || (!effective && analyticsAllowed));

  useEffect(() => {
    function reopen() {
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setPreferencesOpen(true);
    }
    function storageChanged(event: StorageEvent) {
      if (event.key === storageKey || event.key === null) setChoice(readConsent());
    }
    window.addEventListener(preferencesEvent, reopen);
    window.addEventListener("storage", storageChanged);
    return () => {
      window.removeEventListener(preferencesEvent, reopen);
      window.removeEventListener("storage", storageChanged);
    };
  }, []);
  useEffect(() => {
    if (preferencesOpen) acceptButton.current?.focus();
  }, [preferencesOpen]);
  useEffect(() => {
    if (!effective && !synced.current) return;
    const next = analyticsAllowed ? effective ?? "rejected" : "rejected";
    if (synced.current === next) return;
    synced.current = next;
    void import("@/lib/firebase").then(({ updateFirebaseAnalyticsConsent }) => updateFirebaseAnalyticsConsent(next));
  }, [effective, analyticsAllowed]);
  function choose(next: CookieConsentChoice) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ choice: next, version: 1, updatedAt: new Date().toISOString() }));
    } catch { /* Keep the choice for this session. */ }
    setChoice(next);
    close();
  }
  function close() {
    setPreferencesOpen(false);
    returnFocus.current?.focus();
    returnFocus.current = null;
  }
  const analyticsBadge = !effective ? t("analyticsOptional") : t(effective === "accepted" ? "analyticsOn" : "analyticsOff");

  return <AnimatePresence>{visible && <motion.aside
    aria-labelledby="cookie-consent-title" aria-describedby="cookie-consent-description"
    className="fixed inset-x-4 bottom-4 z-[60] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl border border-site-border bg-site-surface p-5 shadow-[0_28px_70px_-36px_var(--site-surface-shadow)] sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-[420px]"
    initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: reduceMotion ? 0 : 24 }} transition={{ duration: reduceMotion ? 0 : 0.22 }}>
    <div className="flex items-center gap-3">
      <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-brand-soft text-brand">
        <Cookie size={24} weight="duotone" />
      </span>
      <h2 id="cookie-consent-title" className="min-w-0 flex-1 text-lg font-black leading-tight tracking-tight text-site-text">{t("title")}</h2>
      {preferencesOpen && effective && <button type="button" onClick={close} aria-label={t("close")} className="-mr-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-site-muted hover:bg-site-surface-muted">
        <X aria-hidden="true" size={18} weight="bold" />
      </button>}
    </div>
    <p id="cookie-consent-description" className="mt-3 text-sm leading-[22px] text-site-muted">{t("description")}</p>
    <ul className="mt-4 rounded-2xl border border-site-border bg-site-surface-muted px-3.5">
      {[
        { title: t("necessaryTitle"), description: t("necessaryDescription"), badge: t("necessaryBadge"), active: true },
        { title: t("analyticsTitle"), description: t("analyticsDescription"), badge: analyticsBadge, active: effective === "accepted" },
      ].map((category) => <li key={category.title} className="flex items-center gap-3 border-b border-site-border-strong py-3 last:border-b-0">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-site-text">{category.title}</p>
          <p className="text-[13px] leading-[18px] text-site-muted">{category.description}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-bold leading-[18px] ${category.active ? "border-brand-soft bg-brand-soft text-brand-strong" : "border-site-border-strong text-site-muted"}`}>{category.badge}</span>
      </li>)}
    </ul>
    <div className="mt-4 flex flex-wrap gap-2">
      <button type="button" onClick={() => choose("rejected")} className="min-h-11 grow basis-[140px] rounded-[14px] border border-site-border-strong bg-site-surface-muted px-4 text-sm font-bold text-site-text hover:bg-site-bg">{t("reject")}</button>
      <button ref={acceptButton} type="button" onClick={() => choose("accepted")} className="min-h-11 grow basis-[140px] rounded-[14px] border border-site-border-strong bg-site-surface-muted px-4 text-sm font-bold text-site-text hover:bg-site-bg">{t("accept")}</button>
    </div>
    <Link href={`/${locale}/wiki/cookies`} className="-mb-2 mt-2 inline-flex min-h-9 items-center gap-1.5 text-[13px] font-semibold text-site-muted hover:text-brand-strong">
      {t("policy")}
      <ArrowRight aria-hidden="true" size={14} weight="bold" />
    </Link>
  </motion.aside>}</AnimatePresence>;
};
