"use client";

import {
  ArrowRight,
  CalendarBlank,
  Certificate,
  Cookie,
  FileText,
  ShieldCheck,
  Trash,
} from "@phosphor-icons/react";
import type { LegalDocumentKind } from "@/content/legal-documents";

const documentIcons = {
  privacy: ShieldCheck,
  cookies: Cookie,
  terms: FileText,
  licenses: Certificate,
  delete: Trash,
} satisfies Record<LegalDocumentKind, typeof ShieldCheck>;

export function LegalDocumentIcon({
  kind,
  className,
  weight,
}: {
  kind: LegalDocumentKind;
  className?: string;
  weight: "bold" | "duotone";
}) {
  const Icon = documentIcons[kind];

  return <Icon className={className} weight={weight} />;
}

export function LegalCalendarIcon({ className }: { className?: string }) {
  return <CalendarBlank className={className} weight="duotone" />;
}

export function LegalSupportArrow({ className }: { className?: string }) {
  return <ArrowRight className={className} weight="bold" />;
}
