import type { ComponentType } from "react";
import type { MDXComponents } from "mdx/types";
import PrivacyContent, {
  legalMetadata as privacyMetadata,
} from "./legal/privacy.mdx";
import TermsContent, {
  legalMetadata as termsMetadata,
} from "./legal/terms.mdx";
import CookiesContent, {
  legalMetadata as cookiesMetadata,
} from "./legal/cookies.mdx";
import DeleteContent, {
  legalMetadata as deleteMetadata,
} from "./legal/delete.mdx";

export type LegalDocumentKind =
  | "privacy"
  | "terms"
  | "cookies"
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

type LegalContent = ComponentType<{
  components?: MDXComponents;
}>;

export interface LegalDocumentData extends LegalDocumentMetadata {
  Content: LegalContent;
}

function createLegalDocument(
  metadata: LegalDocumentMetadata,
  Content: LegalContent,
): LegalDocumentData {
  return {
    ...metadata,
    Content,
  };
}

export const legalDocuments = {
  privacy: createLegalDocument(privacyMetadata, PrivacyContent),
  cookies: createLegalDocument(cookiesMetadata, CookiesContent),
  terms: createLegalDocument(termsMetadata, TermsContent),
  delete: createLegalDocument(deleteMetadata, DeleteContent),
} satisfies Record<LegalDocumentKind, LegalDocumentData>;
