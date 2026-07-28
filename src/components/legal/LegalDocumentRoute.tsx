import type { Metadata } from "next";
import {
  legalDocuments,
  type LegalDocumentKind,
} from "@/content/legal-documents";
import { LegalDocument } from "./LegalDocument";

type LocaleParams = Promise<{ locale: string }>;

export async function getLegalDocumentMetadata(
  params: LocaleParams,
  kind: LegalDocumentKind,
): Promise<Metadata> {
  const { locale } = await params;
  const document = legalDocuments[kind];
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://planit-demo.web.app";
  const url = `${baseUrl}/${locale}/wiki/${kind}`;

  return {
    title: document.title,
    description: document.summary,
    alternates: {
      canonical: url,
      languages: {
        en: `${baseUrl}/en/wiki/${kind}`,
        uk: `${baseUrl}/uk/wiki/${kind}`,
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

export async function LegalDocumentRoute({
  params,
  kind,
}: {
  params: LocaleParams;
  kind: LegalDocumentKind;
}) {
  const { locale } = await params;

  return <LegalDocument locale={locale} kind={kind} />;
}
