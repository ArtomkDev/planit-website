import data from "./pages.json";
import { validateContentPages } from "@/lib/content-page-schema.mjs";

export interface ContentPageText {
  title: string;
  description: string;
  heading: string;
  intro: string;
  sections: { heading: string; paragraphs: string[] }[];
}
export interface ContentPageData {
  slug: string;
  published: boolean;
  updatedAt: string;
  locales: { uk: ContentPageText; en: ContentPageText };
}
export const contentPages = validateContentPages(data) as ContentPageData[];
export const publishedPages = contentPages.filter(page => page.published);
