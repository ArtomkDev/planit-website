import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { INDEXABLE_ROBOTS, localeAlternates, localeUrl } from "@/lib/seo";
import { WebsiteIdentity } from "@/components/metadata/WebsiteIdentity";

const title = "PlanItflow — офіційний сайт PlanIt, навчального планера";
const description = "PlanItflow (planitflow.com) — офіційний сайт PlanIt. Розклад занять, завдання й матеріали для студентів та школярів у браузері та на Android.";
const image = { url: localeUrl("uk", "/opengraph-image"), width: 1200, height: 630, alt: "PlanIt: навчальний розклад, завдання й матеріали для Android та вебверсії", type: "image/png" };

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  applicationName: "PlanIt",
  alternates: { canonical: `${SITE_URL}/`, languages: localeAlternates() },
  robots: INDEXABLE_ROBOTS,
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined },
  openGraph: { siteName: "PlanIt", title, description, url: `${SITE_URL}/`, type: "website", locale: "uk_UA", alternateLocale: "en_US", images: [image] },
  twitter: { card: "summary_large_image", title, description, images: [image] },
};

// The head redirects visitors before paint; crawlers stay here (see locale-redirect.ts).
// Real fallback content gives crawlers and browsers without JavaScript linked destinations.
export default function EntryPage() {
  return (
    <>
      <WebsiteIdentity />
      <main className="mx-auto max-w-2xl px-6 py-20 font-sans text-site-text">
        <h1 className="text-4xl font-black">PlanIt — навчальний планер</h1>
        <p className="mt-6 text-lg leading-8 text-site-muted">PlanItflow (planitflow.com) — офіційний сайт PlanIt. Розклад занять, завдання й матеріали разом: організуйте навчання у браузері та на Android.</p>
        <p className="mt-4 text-lg leading-8 text-site-muted" lang="en">PlanItflow is the official website of PlanIt, a class schedule and study planner for students on the web and Android.</p>
        <nav aria-label="Мова / Language" className="mt-8 flex flex-wrap gap-6">
          <Link className="underline underline-offset-4" href="/uk" hrefLang="uk">Українська</Link>
          <Link className="underline underline-offset-4" href="/en" hrefLang="en" lang="en">English — PlanIt class schedule and study planner</Link>
        </nav>
      </main>
    </>
  );
}
