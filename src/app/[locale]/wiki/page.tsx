import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { getLegalDocumentData } from "@/content/legal-documents";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const document = getLegalDocumentData("terms", locale);
  const baseUrl = SITE_URL;
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
      images: [`${SITE_URL}/opengraph-image`],
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
