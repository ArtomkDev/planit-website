import type { Metadata } from "next";
import { GlobalNotFoundClient } from "./global-not-found-client";
import "./globals.css";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "404 | PlanIt",
  description: "This page could not be found in PlanIt.",
  openGraph: { images: [`${SITE_URL}/opengraph-image`] },
  twitter: { images: [`${SITE_URL}/twitter-image`] },
};

export default function GlobalNotFound() {
  return (
    <html lang="uk" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-site-bg font-sans text-site-text antialiased selection:bg-[#F45B8A]/25 dark:selection:bg-[#3EF7D2]/25"
      >
        <GlobalNotFoundClient />
      </body>
    </html>
  );
}
