"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { warmAllLegalLoadingDocuments } from "./LegalDocumentClient";

export function LegalLoadingPreloader() {
  const locale = useLocale();

  useEffect(() => {
    void warmAllLegalLoadingDocuments(locale);
  }, [locale]);

  return null;
}
