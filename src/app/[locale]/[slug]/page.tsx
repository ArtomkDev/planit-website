import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { publishedPages } from "@/content/pages";
import { createPageMetadata } from "@/lib/seo";
import { APP_URL, SITE_URL } from "@/lib/site";
import { AccentRule } from "@/components/ui/AccentRule";

export const dynamicParams = false;
export function generateStaticParams() { return publishedPages.map(page => ({ slug: page.slug })); }

function getPage(locale: string, slug: string) {
  const page = publishedPages.find(page => page.slug === slug);
  if (!page || (locale !== "uk" && locale !== "en")) notFound();
  return { page, text: page.locales[locale] };
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const { text } = getPage(locale, slug);
  return createPageMetadata({ locale, path: `/${slug}`, title: text.title, description: text.description });
}

export default async function ContentPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const { page, text } = getPage(locale, slug);
  const schema = { "@context": "https://schema.org", "@type": "WebPage", name: text.title, description: text.description, url: `${SITE_URL}/${locale}/${slug}`, inLanguage: locale, dateModified: page.updatedAt, isPartOf: { "@id": `${SITE_URL}/#website` } };
  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-14 md:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <Link href={`/${locale}`} className="mb-8 inline-flex min-h-11 items-center gap-3 text-sm font-bold text-brand-strong"><AccentRule />PlanIt</Link>
      <h1 className="text-balance text-4xl font-black leading-tight tracking-tight md:text-5xl">{text.heading}</h1>
      <p className="mt-6 text-lg leading-8 text-site-muted">{text.intro}</p>
      {text.sections.map((section, index) => (
        <section key={index} className="mt-10" aria-labelledby={`section-${index + 1}`}>
          <h2 id={`section-${index + 1}`} className="text-2xl font-bold tracking-tight">{section.heading}</h2>
          {section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex} className="mt-4 leading-8 text-site-muted">{paragraph}</p>)}
        </section>
      ))}
      <a href={APP_URL} className="mt-10 inline-flex min-h-12 items-center justify-center rounded-xl bg-site-text px-6 py-3 font-bold text-site-bg">{locale === "uk" ? "Відкрити PlanIt у браузері" : "Open PlanIt in your browser"}</a>
    </article>
  );
}
