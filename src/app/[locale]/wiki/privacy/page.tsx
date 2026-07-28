import {
  getLegalDocumentMetadata,
  LegalDocumentRoute,
} from "@/components/legal/LegalDocumentRoute";

const kind = "privacy";

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return getLegalDocumentMetadata(params, kind);
}

export default function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return <LegalDocumentRoute params={params} kind={kind} />;
}
