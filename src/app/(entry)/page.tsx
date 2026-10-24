import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { WebsiteIdentity } from "@/components/metadata/WebsiteIdentity";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "PlanIt — навчальний планер і розклад занять",
  description: "Офіційний сайт PlanIt: розклад занять, завдання й навчальні матеріали для студентів та школярів. Доступний у браузері та для Android.",
  alternates: { canonical: `${SITE_URL}/`, languages: { uk: `${SITE_URL}/uk`, en: `${SITE_URL}/en`, "x-default": `${SITE_URL}/` } },
  robots: { index: true, follow: true },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined },
  openGraph: { siteName: "PlanIt", title: "PlanIt — навчальний планер і розклад занять", url: `${SITE_URL}/`, type: "website", images: [`${SITE_URL}/opengraph-image`] },
  twitter: { images: [`${SITE_URL}/twitter-image`] },
};

// The head still redirects before paint. Real fallback content gives crawlers
// and browsers without a working redirect useful, linked destinations.
export default function EntryPage() {
  return (
    <>
      <WebsiteIdentity />
      <main className="mx-auto max-w-2xl px-6 py-20 font-sans text-site-text">
        <h1 className="text-4xl font-black">PlanIt — навчальний планер</h1>
        <p className="mt-6 text-lg leading-8 text-site-muted">Розклад занять, завдання й матеріали разом. PlanIt допомагає студентам і школярам організувати навчання у браузері та на Android.</p>
        <nav aria-label="Мова / Language" className="mt-8 flex flex-wrap gap-6">
          <Link className="underline underline-offset-4" href="/uk" hrefLang="uk">Українська</Link>
          <Link className="underline underline-offset-4" href="/en" hrefLang="en" lang="en">English — PlanIt class schedule and study planner</Link>
        </nav>
      </main>
    </>
  );
}
