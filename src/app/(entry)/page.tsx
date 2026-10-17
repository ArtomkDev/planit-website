import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "PlanIt",
  alternates: { canonical: `${SITE_URL}/uk` },
  robots: { index: false, follow: true },
  openGraph: { images: [`${SITE_URL}/opengraph-image`] },
  twitter: { images: [`${SITE_URL}/twitter-image`] },
};

// The entry layout immediately opens the preferred localized homepage.
export default function EntryPage() {
  return null;
}
