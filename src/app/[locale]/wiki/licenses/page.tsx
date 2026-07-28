import {
  getLegalDocumentMetadata,
  LegalDocumentRoute,
} from "@/components/legal/LegalDocumentRoute";

const kind = "licenses";

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return getLegalDocumentMetadata(params, kind);
}

export default function LicensesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return <LegalDocumentRoute params={params} kind={kind} />;
}
