import legalManifestJson from "../../public/content/legal/manifest.json";

export type LegalDocumentLocale = "en" | "uk";

export type LegalDocumentKind =
  | "privacy"
  | "cookies"
  | "terms"
  | "licenses"
  | "delete";

export interface LegalDocumentMetadata {
  slug: LegalDocumentKind;
  title: string;
  navigationTitle: string;
  summary: string;
  effectiveDateLabel: string;
  effectiveDate: string;
  effectiveDateDisplay: string;
  version: string;
}

export interface LegalDocumentData extends LegalDocumentMetadata {
  assetPath: string;
  locale: LegalDocumentLocale;
}

export interface LegalManifestDocument {
  path?: string;
  loadingPath?: string;
  sha256?: string;
  loadingSha256?: string;
  version?: string;
  metadata?: LegalDocumentMetadata;
}

export interface LegalManifest {
  version?: string;
  documents?: Partial<Record<LegalDocumentKind, LegalManifestDocument>>;
  locales?: Partial<Record<LegalDocumentLocale, {
    documents?: Partial<Record<LegalDocumentKind, LegalManifestDocument>>;
  }>>;
}

export function getLegalDocumentLocale(locale: string): LegalDocumentLocale {
  return locale === "uk" ? "uk" : "en";
}

export function getLegalManifestDocument(kind: LegalDocumentKind, locale: string, manifest: LegalManifest | null) {
  const language = getLegalDocumentLocale(locale);
  return manifest?.locales?.[language]?.documents?.[kind] ??
    (language === "en" ? manifest?.documents?.[kind] : undefined);
}

export const legalDocumentOrder = [
  "privacy",
  "cookies",
  "terms",
  "licenses",
  "delete",
] as const satisfies ReadonlyArray<LegalDocumentKind>;

export function getLegalDocumentAssetPath(document: LegalDocumentKind, locale = "en") {
  const folder = getLegalDocumentLocale(locale) === "uk" ? "uk/" : "";
  return `/content/legal/${folder}${document}.mdx`;
}

export function getLegalDocumentLoadingPath(document: LegalDocumentKind, locale = "en") {
  const folder = getLegalDocumentLocale(locale) === "uk" ? "uk/" : "";
  return `/content/legal/${folder}${document}.loading.mdx`;
}

export function isLegalDocumentKind(value: string): value is LegalDocumentKind {
  return legalDocumentOrder.includes(value as LegalDocumentKind);
}

export const legalDocumentFallbackMetadata = {
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    navigationTitle: "Privacy Policy",
    summary: "Privacy at a glance",
    effectiveDateLabel: "Effective and last updated:",
    effectiveDate: "2026-07-24",
    effectiveDateDisplay: "July 24, 2026",
    version: "2.2",
  },
  cookies: {
    slug: "cookies",
    title: "Cookie & Similar Technologies Policy",
    navigationTitle: "Cookie Policy",
    summary: "Your choices at a glance",
    effectiveDateLabel: "Effective and last updated:",
    effectiveDate: "2026-07-24",
    effectiveDateDisplay: "July 24, 2026",
    version: "1.0",
  },
  terms: {
    slug: "terms",
    title: "Terms & Conditions",
    navigationTitle: "Terms & Conditions",
    summary: "Important summary",
    effectiveDateLabel: "Effective and last updated:",
    effectiveDate: "2026-07-24",
    effectiveDateDisplay: "July 24, 2026",
    version: "2.2",
  },
  licenses: {
    slug: "licenses",
    title: "Open-Source Software Licenses",
    navigationTitle: "Open-Source Licenses",
    summary: "Open-source notices at a glance",
    effectiveDateLabel: "Effective and last updated:",
    effectiveDate: "2026-07-26",
    effectiveDateDisplay: "July 26, 2026",
    version: "1.0",
  },
  delete: {
    slug: "delete",
    title: "Account & Data Deletion",
    navigationTitle: "Account Deletion",
    summary: "Choose the path that matches your situation",
    effectiveDateLabel: "Effective and last updated:",
    effectiveDate: "2026-07-24",
    effectiveDateDisplay: "July 24, 2026",
    version: "2.2",
  },
} satisfies Record<LegalDocumentKind, LegalDocumentMetadata>;

export function getLegalDocumentData(kind: LegalDocumentKind, locale: string): LegalDocumentData {
  const entry = getLegalManifestDocument(kind, locale, legalManifestJson as LegalManifest);
  return {
    ...legalDocumentFallbackMetadata[kind],
    ...entry?.metadata,
    assetPath: entry?.path ?? getLegalDocumentAssetPath(kind, locale),
    locale: getLegalDocumentLocale(locale),
  };
}
