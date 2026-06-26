import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "../globals.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SEO.home" });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://planit-app.com";

  return {
    metadataBase: new URL(baseUrl),
    title: { template: "%s | PlanIt", default: t("title") },
    description: t("description"),
    alternates: { languages: { en: `${baseUrl}/en`, uk: `${baseUrl}/uk` } },
    openGraph: { title: t("title"), description: t("description"), url: `${baseUrl}/${locale}`, siteName: "PlanIt", locale: locale, type: "website" },
    twitter: { card: "summary_large_image", title: t("title"), description: t("description") },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning className="font-sans min-h-screen flex flex-col antialiased selection:bg-indigo-500/30 selection:text-white">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider>
            <Header />
            <main className="flex-grow flex flex-col w-full relative z-10">
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}