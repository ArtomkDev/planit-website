import type { Metadata } from "next";
import { GlobalNotFoundClient } from "./global-not-found-client";
import "./globals.css";

export const metadata: Metadata = {
  title: "404 | PlanIt",
  description: "This page could not be found in PlanIt.",
};

export default function GlobalNotFound() {
  return (
    <html lang="uk" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#09090b] font-sans text-white antialiased selection:bg-[#F45B8A]/25 dark:selection:bg-[#3EF7D2]/25"
      >
        <GlobalNotFoundClient />
      </body>
    </html>
  );
}
