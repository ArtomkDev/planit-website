"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";

const localeStorageKey = "planit:locale";

export function LocalePreference() {
  const locale = useLocale();

  useEffect(() => {
    try {
      window.localStorage.setItem(localeStorageKey, locale);
      document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Locale redirects can still fall back to navigator.language.
    }
  }, [locale]);

  return null;
}
