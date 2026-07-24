import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LegalDocument, type LegalDocumentKind } from "@/components/legal/LegalDocument";
import { legalDocuments } from "@/content/legal-documents";

const wikiDocuments = ["privacy", "terms", "delete", "cookies"] as const satisfies ReadonlyArray<LegalDocumentKind>;

function isWikiDocument(value: string): value is LegalDocumentKind {
  return wikiDocuments.includes(value as LegalDocumentKind);
}

export function generateStaticParams() {
  return wikiDocuments.map((document) => ({ document }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; document: string }>;
}): Promise<Metadata> {
  const { locale, document } = await params;

  if (!isWikiDocument(document)) {
    notFound();
  }

  const legalDocument = legalDocuments[document];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://planit-demo.web.app";
  const url = `${baseUrl}/${locale}/wiki/${document}`;

  return {
    title: legalDocument.title,
    description: legalDocument.summary,
    alternates: {
      canonical: url,
      languages: {
        en: `${baseUrl}/en/wiki/${document}`,
        uk: `${baseUrl}/uk/wiki/${document}`,
      },
    },
    openGraph: {
      title: legalDocument.title,
      description: legalDocument.summary,
      url,
      siteName: "PlanIt",
      locale,
      type: "website",
    },
  };
}

export default async function WikiDocumentPage({
  params,
}: {
  params: Promise<{ locale: string; document: string }>;
}) {
  const { locale, document } = await params;

  if (!isWikiDocument(document)) {
    notFound();
  }

  return <LegalDocument locale={locale} kind={document} />;
}
