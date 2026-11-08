import { Hero } from "@/components/ui/Hero";
import { AppShowcase } from "@/components/ui/AppShowcase";
import { Platforms } from "@/components/ui/Platforms";
import { CallToAction } from "@/components/ui/CallToAction";
import { FeatureShowcase } from "@/components/features/FeatureShowcase";
import { FAQ, faqItems } from "@/components/ui/FAQ";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SITE_URL, APP_URL, PLAY_MARKET_URL } from "@/lib/site";
import { localeUrl } from "@/lib/seo";
import { MarketingAnalytics } from "@/components/analytics/MarketingAnalytics";
import { WebsiteIdentity } from "@/components/metadata/WebsiteIdentity";
import { JsonLd } from "@/components/metadata/JsonLd";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("SEO.home");
  const tFaq = await getTranslations("FAQ");
  const url = localeUrl(locale);
  const application = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#application`,
    name: "PlanIt",
    alternateName: "PlanItflow",
    description: t("description"),
    url,
    image: localeUrl(locale, "/opengraph-image"),
    operatingSystem: "Android, Web",
    applicationCategory: "EducationalApplication",
    applicationSubCategory: "Study planner",
    inLanguage: ["uk", "en"],
    installUrl: APP_URL,
    downloadUrl: PLAY_MARKET_URL,
    sameAs: [PLAY_MARKET_URL],
    mainEntityOfPage: url,
    isAccessibleForFree: true,
    author: { "@type": "Person", name: "Artomk" },
    publisher: { "@type": "Person", name: "Artomk" },
    offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
  };
  // Mirrors the visible FAQ section word for word.
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    inLanguage: locale,
    mainEntity: faqItems.map(item => ({
      "@type": "Question",
      name: tFaq(`items.${item}.question`),
      acceptedAnswer: { "@type": "Answer", text: tFaq(`items.${item}.answer`) },
    })),
  };
  return (
    <div className="flex w-full flex-col overflow-x-clip">
      <JsonLd data={application} />
      <JsonLd data={faq} />
      <WebsiteIdentity />
      <MarketingAnalytics />
      <Hero />
      <div className="relative isolate flex w-full flex-col">
        <FeatureShowcase />
        <AppShowcase />
        <Platforms />
        <FAQ />
        <CallToAction />
      </div>
    </div>
  );
}
