import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "PlanIt | Master Your Time",
  description: "High-end productivity and planning application.",
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="font-sans bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 min-h-screen flex flex-col antialiased selection:bg-indigo-500/30 selection:text-white">
        <NextIntlClientProvider messages={messages}>
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