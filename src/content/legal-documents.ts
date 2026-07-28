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
}

export const legalDocumentOrder = [
  "privacy",
  "cookies",
  "terms",
  "licenses",
  "delete",
] as const satisfies ReadonlyArray<LegalDocumentKind>;

export function getLegalDocumentAssetPath(document: LegalDocumentKind) {
  return `/content/legal/${document}.mdx`;
}

export function getLegalDocumentLoadingPath(document: LegalDocumentKind) {
  return `/content/legal/${document}.loading.mdx`;
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

export const legalDocuments = {
  privacy: {
    ...legalDocumentFallbackMetadata.privacy,
    assetPath: getLegalDocumentAssetPath("privacy"),
  },
  cookies: {
    ...legalDocumentFallbackMetadata.cookies,
    assetPath: getLegalDocumentAssetPath("cookies"),
  },
  terms: {
    ...legalDocumentFallbackMetadata.terms,
    assetPath: getLegalDocumentAssetPath("terms"),
  },
  licenses: {
    ...legalDocumentFallbackMetadata.licenses,
    assetPath: getLegalDocumentAssetPath("licenses"),
  },
  delete: {
    ...legalDocumentFallbackMetadata.delete,
    assetPath: getLegalDocumentAssetPath("delete"),
  },
} satisfies Record<LegalDocumentKind, LegalDocumentData>;
