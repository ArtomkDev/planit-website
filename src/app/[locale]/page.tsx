import { Hero } from "@/components/ui/Hero";
import { AppShowcase } from "@/components/ui/AppShowcase";
import { Platforms } from "@/components/ui/Platforms";
import { CallToAction } from "@/components/ui/CallToAction";
import { FeatureShowcase } from "@/components/features/FeatureShowcase";
import { FAQ } from "@/components/ui/FAQ";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SITE_URL, PLAY_MARKET_URL } from "@/lib/site";
import { MarketingAnalytics } from "@/components/analytics/MarketingAnalytics";
import { WebsiteIdentity } from "@/components/metadata/WebsiteIdentity";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("SEO.home");
  const application = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#application`,
    name: "PlanIt",
    description: t("description"),
    url: `${SITE_URL}/${locale}`,
    image: `${SITE_URL}/opengraph-image`,
    operatingSystem: "Android, Web",
    applicationCategory: "EducationalApplication",
    inLanguage: ["uk", "en"],
    downloadUrl: PLAY_MARKET_URL,
    sameAs: PLAY_MARKET_URL,
    mainEntityOfPage: `${SITE_URL}/${locale}`,
    author: { "@type": "Person", name: "Artomk" },
    offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
  };
  return (
    <div className="flex w-full flex-col overflow-x-clip">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(application).replace(/</g, "\\u003c") }} />
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
