declare module "*.mdx" {
  export const legalMetadata: {
    slug: "privacy" | "terms" | "cookies" | "delete";
    title: string;
    navigationTitle: string;
    summary: string;
    effectiveDateLabel: string;
    effectiveDate: string;
    effectiveDateDisplay: string;
    version: string;
  };
}
