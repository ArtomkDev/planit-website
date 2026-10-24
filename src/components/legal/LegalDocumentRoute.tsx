import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import {
  getLegalDocumentData,
  type LegalDocumentKind,
} from "@/content/legal-documents";
import { LegalDocument } from "./LegalDocument";

type LocaleParams = Promise<{ locale: string }>;

export async function getLegalDocumentMetadata(
  params: LocaleParams,
  kind: LegalDocumentKind,
): Promise<Metadata> {
  const { locale } = await params;
  const document = getLegalDocumentData(kind, locale);
  return createPageMetadata({ locale, path: `/wiki/${kind}`, title: document.title, description: document.summary });
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
