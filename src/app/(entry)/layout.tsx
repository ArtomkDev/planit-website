import "../globals.css";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { localeRedirectScript } from "@/lib/locale-redirect";

export const metadata: Metadata = { metadataBase: new URL(SITE_URL) };

export default function EntryLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <head>
        <script id="planit-locale-redirect" dangerouslySetInnerHTML={{ __html: localeRedirectScript }} />
        <noscript><meta httpEquiv="refresh" content="0;url=/uk" /></noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
