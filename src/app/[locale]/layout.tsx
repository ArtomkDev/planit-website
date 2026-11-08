import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { createPageMetadata } from "@/lib/seo";
import { publishedPages } from "@/content/pages";
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
import { FloatingSectionNavigation } from "@/components/ui/FloatingSectionNavigation";
import "../globals.css";

const locales = ["uk", "en"] as const;

const themeInitializationScript = `
  (function () {
    try {
      var storedTheme = localStorage.getItem("theme");
      var isDark = storedTheme === "dark" ||
        (storedTheme !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", isDark);
    } catch (error) {
      document.documentElement.classList.toggle(
        "dark",
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }
  })();
`;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "SEO.home" });

  // The localized homepage uses these values; nested pages replace them with createPageMetadata().
  return {
    ...createPageMetadata({ locale, title: t("title"), description: t("description"), imageAlt: t("imageAlt") }),
    title: { absolute: t("title"), template: "%s | PlanIt" },
    metadataBase: new URL(SITE_URL),
    applicationName: "PlanIt",
    authors: [{ name: "Artomk" }],
    creator: "Artomk",
    publisher: "Artomk",
    category: "education",
    verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
      </head>
      <body suppressHydrationWarning className="flex min-h-screen flex-col bg-site-bg font-sans text-site-text antialiased selection:bg-brand/25 selection:text-site-text">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider>
            <LocalePreference />
            <Header />
            <main id="main-content" tabIndex={-1} className="flex-grow flex flex-col w-full relative z-10">
              {children}
            </main>
            <Footer contentLinks={publishedPages.map(page => ({ href: `/${locale}/${page.slug}`, title: page.locales[locale === "uk" ? "uk" : "en"].title }))} />
            <FloatingSectionNavigation />
            <CookieConsent />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
