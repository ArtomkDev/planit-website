import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { LocalePreference } from "@/components/i18n/LocalePreference";
import { LegalLoadingPreloader } from "@/components/legal/LegalLoadingPreloader";
import { LegalLoadingPreloadLinks } from "@/components/legal/LegalLoadingPreloadLinks";
import "../globals.css";

const locales = ["uk", "en"] as const;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "SEO.home" });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://planit-app.com";
  const url = `${baseUrl}/${locale}`;

  return {
    metadataBase: new URL(baseUrl),
    title: { template: "%s | PlanIt", default: t("title") },
    description: t("description"),
    alternates: { canonical: url, languages: { en: `${baseUrl}/en`, uk: `${baseUrl}/uk` } },
    openGraph: { title: t("title"), description: t("description"), url, siteName: "PlanIt", locale, type: "website" },
    twitter: { card: "summary_large_image", title: t("title"), description: t("description") },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning className="font-sans min-h-screen flex flex-col antialiased selection:bg-[#F45B8A]/30 selection:text-zinc-950 dark:selection:bg-[#3EF7D2]/25 dark:selection:text-white">
        <LegalLoadingPreloadLinks />
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider>
            <LocalePreference />
            <LegalLoadingPreloader />
            <Header />
            <main className="flex-grow flex flex-col w-full relative z-10">
              {children}
            </main>
            <Footer />
            <CookieConsent />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
