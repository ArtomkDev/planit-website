import {
  getLegalDocumentMetadata,
  LegalDocumentRoute,
} from "@/components/legal/LegalDocumentRoute";

const kind = "delete";

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return getLegalDocumentMetadata(params, kind);
}

export default function DeletePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return <LegalDocumentRoute params={params} kind={kind} />;
}
