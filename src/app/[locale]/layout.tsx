import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "../globals.css";

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="font-sans min-h-screen flex flex-col antialiased selection:bg-indigo-500/30 selection:text-white transition-colors duration-300">
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