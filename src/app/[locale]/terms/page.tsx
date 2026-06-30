import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SEO.terms" });
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://planit-demo.web.app";
  const url = `${baseUrl}/${locale}/terms`;

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: url,
      languages: {
        en: `${baseUrl}/en/terms`,
        uk: `${baseUrl}/uk/terms`,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url,
      siteName: "PlanIt",
      locale,
      type: "website",
    },
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <LegalDocument locale={locale} kind="terms" />;
}
