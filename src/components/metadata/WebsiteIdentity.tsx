import { SITE_URL } from "@/lib/site";

// The same identity belongs to the root and both localized homepages.
export function WebsiteIdentity() {
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "PlanIt",
    alternateName: "PlanIt: Timetable & Planner",
    url: `${SITE_URL}/`,
    inLanguage: ["uk", "en"],
    publisher: { "@type": "Person", name: "Artomk" },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website).replace(/</g, "\\u003c") }} />;
}
