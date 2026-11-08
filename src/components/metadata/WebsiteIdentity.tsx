import { SITE_URL } from "@/lib/site";
import { JsonLd } from "./JsonLd";

// The same identity belongs to the root and both localized homepages.
export function WebsiteIdentity() {
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "PlanIt",
    alternateName: ["PlanItflow", "planitflow.com", "PlanIt: Timetable & Planner"],
    url: `${SITE_URL}/`,
    inLanguage: ["uk", "en"],
    publisher: { "@type": "Person", name: "Artomk" },
  };
  return <JsonLd data={website} />;
}
