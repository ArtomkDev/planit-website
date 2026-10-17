"use client";

import { Cookie } from "@phosphor-icons/react";
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
    setPreferencesOpen(false);
    returnFocus.current?.focus();
    returnFocus.current = null;
  }

  return <AnimatePresence>{visible && <motion.aside
    aria-labelledby="cookie-consent-title" aria-describedby="cookie-consent-description"
    className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 sm:px-6 sm:pb-6"
    initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.2 }}>
    <div className="pointer-events-auto mx-auto max-h-[calc(100dvh-5rem)] max-w-5xl overflow-y-auto rounded-2xl border border-site-border bg-site-surface p-5 shadow-[0_28px_90px_-48px_var(--site-surface-shadow)] sm:p-6">
      <div className="flex min-w-0 items-start gap-4">
        <Cookie aria-hidden="true" size={28} className="mt-1 shrink-0 text-brand" />
        <div className="min-w-0">
          <h2 id="cookie-consent-title" className="text-lg font-bold text-site-text">{t("title")}</h2>
          <p id="cookie-consent-description" className="mt-2 text-sm leading-relaxed text-site-muted">{t("description")}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button ref={acceptButton} type="button" onClick={() => choose("accepted")} className="min-h-11 rounded-full border border-site-border-strong bg-site-surface-muted px-5 py-2 text-sm font-bold text-site-text hover:bg-site-bg-muted">{t("accept")}</button>
        <button type="button" onClick={() => choose("rejected")} className="min-h-11 rounded-full border border-site-border-strong bg-site-surface-muted px-5 py-2 text-sm font-bold text-site-text hover:bg-site-bg-muted">{t("reject")}</button>
        <Link href={`/${locale}/wiki/cookies`} className="inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-site-muted hover:text-brand">{t("learnMore")}</Link>
      </div>
    </div>
  </motion.aside>}</AnimatePresence>;
};
