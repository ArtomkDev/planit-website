import type { Metadata } from "next";
import { SITE_URL } from "./site";

export function createPageMetadata({ locale, path = "", title, description }: { locale: string; path?: string; title: string; description: string }): Metadata {
  if (!["uk", "en"].includes(locale) || (path && !/^\/[a-z0-9/-]+$/.test(path))) throw new Error("Use a supported locale and an absolute page path without the locale prefix.");
  const url = `${SITE_URL}/${locale}${path}`;
  const fullTitle = /\bPlanIt\b/i.test(title) ? title : `${title} | PlanIt`;
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: url, languages: { uk: `${SITE_URL}/uk${path}`, en: `${SITE_URL}/en${path}`, ...(!path ? { "x-default": `${SITE_URL}/` } : {}) } },
    openGraph: { title: fullTitle, description, url, siteName: "PlanIt", locale: locale === "uk" ? "uk_UA" : "en_US", alternateLocale: locale === "uk" ? "en_US" : "uk_UA", type: "website", images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [`${SITE_URL}/twitter-image`] },
  };
}
