import type { Metadata } from "next";
import { SITE_URL } from "./site";

export const SEO_LOCALES = ["uk", "en"] as const;
export type SeoLocale = (typeof SEO_LOCALES)[number];
// Matches the entry redirect and no-JavaScript fallback: Ukrainian is the site default.
export const DEFAULT_LOCALE: SeoLocale = "uk";

// Indexable pages allow full snippets and large image previews in Search and Discover.
export const INDEXABLE_ROBOTS: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
};

export const PRIVATE_ROBOTS: Metadata["robots"] = { index: false, follow: false };

export const openGraphLocale = (locale: string) => (locale === "uk" ? "uk_UA" : "en_US");

export function localeUrl(locale: string, path = "") {
  return `${SITE_URL}/${locale}${path}`;
}

/** Reciprocal hreflang map. Homepages fall back to the language-selecting root, inner pages to the default locale. */
export function localeAlternates(path = "") {
  return {
    uk: localeUrl("uk", path),
    en: localeUrl("en", path),
    "x-default": path ? localeUrl(DEFAULT_LOCALE, path) : `${SITE_URL}/`,
  };
}

export function createPageMetadata({ locale, path = "", title, description, imageAlt }: { locale: string; path?: string; title: string; description: string; imageAlt?: string }): Metadata {
  if (!SEO_LOCALES.includes(locale as SeoLocale) || (path && !/^\/[a-z0-9/-]+$/.test(path))) throw new Error("Use a supported locale and an absolute page path without the locale prefix.");
  const url = localeUrl(locale, path);
  const fullTitle = /\bPlanIt\b/i.test(title) ? title : `${title} | PlanIt`;
  const image = { url: localeUrl(locale, "/opengraph-image"), width: 1200, height: 630, alt: imageAlt || fullTitle, type: "image/png" };
  return {
    title: { absolute: fullTitle },
    description,
    robots: INDEXABLE_ROBOTS,
    alternates: { canonical: url, languages: localeAlternates(path) },
    openGraph: { title: fullTitle, description, url, siteName: "PlanIt", locale: openGraphLocale(locale), alternateLocale: openGraphLocale(locale === "uk" ? "en" : "uk"), type: "website", images: [image] },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [image] },
  };
}

/** Escapes JSON-LD so content can never close the surrounding script element. */
export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function breadcrumbJsonLd(locale: string, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "PlanIt", path: "" }, ...items].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: localeUrl(locale, item.path),
    })),
  };
}

export function webPageJsonLd({ locale, path, name, description, dateModified }: { locale: string; path: string; name: string; description: string; dateModified?: string }) {
  const url = localeUrl(locale, path);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    name,
    description,
    url,
    inLanguage: locale,
    ...(dateModified ? { dateModified } : {}),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#application` },
    primaryImageOfPage: localeUrl(locale, "/opengraph-image"),
  };
}
