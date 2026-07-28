"use client";

import {
  ArrowLeft,
  ArrowRight,
  HouseLine,
} from "@phosphor-icons/react";
import { NextIntlClientProvider } from "next-intl";
import { useEffect, useSyncExternalStore } from "react";
import { Header } from "@/components/layout/Header";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import enMessages from "@/i18n/locales/en.json";
import ukMessages from "@/i18n/locales/uk.json";
import styles from "./GlobalNotFound.module.css";

const copy = {
  uk: {
    eyebrow: "404 · Сторінку не знайдено",
    title: "Сторінку не знайдено.",
    description:
      "Можливо, її перемістили, видалили або в посиланні є помилка. Поверніться назад чи почніть із головної.",
    home: "На головну",
    back: "Повернутися назад",
  },
  en: {
    eyebrow: "404 · Page not found",
    title: "Page not found.",
    description:
      "It may have been moved, removed, or the link contains a typo. Go back or start again from the homepage.",
    home: "Go home",
    back: "Go back",
  },
} as const;

type Locale = keyof typeof copy;

const localeChangeEvent = "planit:404-locale-change";

function subscribeToLocale(callback: () => void) {
  const refreshLocale = () => callback();
  const hydrationCheck = window.setTimeout(refreshLocale, 0);

  window.addEventListener("popstate", refreshLocale);
  window.addEventListener(localeChangeEvent, refreshLocale);

  return () => {
    window.clearTimeout(hydrationCheck);
    window.removeEventListener("popstate", refreshLocale);
    window.removeEventListener(localeChangeEvent, refreshLocale);
  };
}

const getServerLocale = (): Locale => "uk";

function getClientLocale(): Locale {
  const pathLocale = window.location.pathname.split("/")[1];

  if (pathLocale === "uk" || pathLocale === "en") {
    return pathLocale;
  }

  try {
    const savedLocale = window.localStorage.getItem("planit:locale");
    if (savedLocale === "uk" || savedLocale === "en") {
      return savedLocale;
    }
  } catch {
    // Fall back to the browser language when storage is unavailable.
  }

  return window.navigator.language.toLowerCase().startsWith("en") ? "en" : "uk";
}

function NotFoundContent({ locale }: { locale: Locale }) {
  const content = copy[locale];
  const homeHref = `/${locale}`;

  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.assign(homeHref);
  }

  function changeLocale() {
    const targetLocale: Locale = locale === "uk" ? "en" : "uk";
    const pathWithoutLocales = window.location.pathname.replace(
      /^(?:\/(?:en|uk))+(?=\/|$)/,
      "",
    );
    const normalizedPath = pathWithoutLocales === "/" ? "" : pathWithoutLocales;
    const nextUrl = `/${targetLocale}${normalizedPath}${window.location.search}${window.location.hash}`;

    try {
      window.localStorage.setItem("planit:locale", targetLocale);
      document.cookie = `NEXT_LOCALE=${targetLocale}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // The URL remains enough to retain the selected locale.
    }

    window.history.replaceState(window.history.state, "", nextUrl);
    window.dispatchEvent(new Event(localeChangeEvent));
  }

  return (
    <div className={styles.root}>
      <Header
        documentNavigation
        onLocaleChange={changeLocale}
      />

      <main className={styles.main}>
        <div aria-hidden className={styles.backgroundCode}>
          404
        </div>

        <section className={styles.content}>
          <p className={styles.eyebrow}>{content.eyebrow}</p>
          <h1 className={styles.title}>{content.title}</h1>
          <p className={styles.description}>{content.description}</p>

          <div className={styles.actions}>
            <a href={homeHref} className={styles.primaryAction}>
              <HouseLine className="h-5 w-5" weight="bold" />
              {content.home}
              <ArrowRight
                className={`${styles.arrow} h-4 w-4`}
                weight="bold"
              />
            </a>
            <button
              type="button"
              onClick={goBack}
              className={styles.secondaryAction}
            >
              <ArrowLeft className="h-4 w-4" weight="bold" />
              {content.back}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export function GlobalNotFoundClient() {
  const locale = useSyncExternalStore(
    subscribeToLocale,
    getClientLocale,
    getServerLocale,
  );
  const messages = locale === "uk" ? ukMessages : enMessages;

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <NextIntlClientProvider
      key={locale}
      messages={messages}
      locale={locale}
      timeZone="Europe/Kyiv"
    >
      <ThemeProvider>
        <NotFoundContent locale={locale} />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
