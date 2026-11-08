import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { breadcrumbJsonLd, createPageMetadata, webPageJsonLd } from "@/lib/seo";
import {
  getLegalDocumentData,
  type LegalDocumentKind,
} from "@/content/legal-documents";
import { JsonLd } from "@/components/metadata/JsonLd";
import { LegalDocument } from "./LegalDocument";

type LocaleParams = Promise<{ locale: string }>;

// Synced legal documents carry a short on-page summary heading, not a search snippet.
// Search descriptions live with the website translations under SEO.<kind>.
async function getLegalSeo(locale: string, kind: LegalDocumentKind) {
  const document = getLegalDocumentData(kind, locale);
  const t = await getTranslations({ locale, namespace: `SEO.${kind}` });
  return { document, path: `/wiki/${kind}`, title: document.title, description: t("description") };
}

export async function getLegalDocumentMetadata(
  params: LocaleParams,
  kind: LegalDocumentKind,
): Promise<Metadata> {
  const { locale } = await params;
  const { path, title, description } = await getLegalSeo(locale, kind);
  return createPageMetadata({ locale, path, title, description });
}

export async function LegalDocumentRoute({
  params,
  kind,
}: {
  params: LocaleParams;
  kind: LegalDocumentKind;
}) {
  const { locale } = await params;
  const { document, path, title, description } = await getLegalSeo(locale, kind);

  return (
    <>
      <JsonLd data={webPageJsonLd({ locale, path, name: title, description, dateModified: document.effectiveDate })} />
      <JsonLd data={breadcrumbJsonLd(locale, [{ name: title, path }])} />
      <LegalDocument locale={locale} kind={kind} />
    </>
  );
}
