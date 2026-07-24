import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { legalDocuments } from "@/content/legal-documents";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const document = legalDocuments.terms;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://planit-demo.web.app";
  const url = `${baseUrl}/${locale}/wiki`;

  return {
    title: document.title,
    description: document.summary,
    alternates: {
      canonical: url,
      languages: {
        en: `${baseUrl}/en/wiki`,
        uk: `${baseUrl}/uk/wiki`,
      },
    },
    openGraph: {
      title: document.title,
      description: document.summary,
      url,
      siteName: "PlanIt",
      locale,
      type: "website",
    },
  };
}

export default async function WikiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <LegalDocument locale={locale} kind="terms" />;
}
