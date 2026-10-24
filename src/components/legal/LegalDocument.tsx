import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import {
  getLegalDocumentLoadingPath,
  getLegalDocumentData,
  getLegalManifestDocument,
  legalDocumentOrder,
  type LegalManifest,
  type LegalDocumentKind,
} from "@/content/legal-documents";
import legalManifestJson from "../../../public/content/legal/manifest.json";
import { LegalDocumentIcon, LegalSupportArrow } from "./LegalIcons";
import { LegalDocumentClient } from "./LegalDocumentClient";
import { LegalLoadingPreloader } from "./LegalLoadingPreloader";
import { LegalLoadingPreloadLinks } from "./LegalLoadingPreloadLinks";
import styles from "./LegalDocument.module.css";
import { SUPPORT_URL } from "@/lib/site";

export type { LegalDocumentKind } from "@/content/legal-documents";

interface LegalDocumentProps {
  locale: string;
  kind: LegalDocumentKind;
}

const legalManifest = legalManifestJson as LegalManifest;
const publicDirectory = resolve(process.cwd(), "public");

function resolvePublicAssetPath(assetPath: string) {
  const resolvedPath = resolve(publicDirectory, assetPath.replace(/^\/+/, ""));
  const relativePath = relative(publicDirectory, resolvedPath);

  if (
    !relativePath ||
    relativePath.startsWith("..") ||
    isAbsolute(relativePath)
  ) {
    return null;
  }

  return resolvedPath;
}

async function getInitialLoadingHtml(kind: LegalDocumentKind, locale: string) {
  try {
    const documentManifest = getLegalManifestDocument(kind, locale, legalManifest);
    const loadingPath =
      documentManifest?.loadingPath ?? getLegalDocumentLoadingPath(kind, locale);
    const filePath = resolvePublicAssetPath(loadingPath);

    if (!filePath) {
      return "";
    }

    const source = await readFile(filePath, "utf8");
    const expectedSha256 = documentManifest?.loadingSha256;

    if (expectedSha256) {
      const actualSha256 = createHash("sha256")
        .update(source, "utf8")
        .digest("hex");

      if (actualSha256.toLowerCase() !== expectedSha256.toLowerCase()) {
        return "";
      }
    }

    return source
      .replace(/^\s*;?\s*/, "")
      .trim()
      .replace(/\bclassName\s*=/g, "class=");
  } catch {
    return "";
  }
}

export async function LegalDocument({ locale, kind }: LegalDocumentProps) {
  setRequestLocale(locale);
  const tDoc = await getTranslations({
    locale,
    namespace: "LegalDocument",
  });
  const document = getLegalDocumentData(kind, locale);
  const initialLoadingHtml = await getInitialLoadingHtml(kind, locale);
  const documentLinks = legalDocumentOrder.map((documentKind) => {
    const isActive = kind === documentKind;
    return (
      <Link
        key={documentKind}
        href={`/${locale}/wiki/${documentKind}`}
        aria-current={isActive ? "page" : undefined}
        className={`group relative flex min-h-11 w-full items-start gap-3 rounded-[6px] p-3 text-left transition-colors ${
          isActive ? "bg-site-text text-site-bg" : "text-site-muted hover:bg-site-surface-muted hover:text-site-text"
        }`}
      >
        {isActive && <span aria-hidden="true" className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-brand" />}
        <span aria-hidden="true" className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] ${
          isActive ? "bg-site-bg/10" : "bg-site-surface-muted"
        }`}>
          <LegalDocumentIcon kind={documentKind} className="h-5 w-5" weight="bold" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold leading-6">{tDoc(`titles.${documentKind}`)}</span>
          <span className={`mt-1 block text-sm leading-6 ${isActive ? "text-site-bg" : "text-site-muted"}`}>
            {tDoc(`summaries.${documentKind}`)}
          </span>
        </span>
      </Link>
    );
  });

  return (
    <div
      className={`${styles.wikiPage} relative isolate min-h-screen overflow-hidden bg-site-bg`}
    >
      <LegalLoadingPreloadLinks locale={locale} />
      <LegalLoadingPreloader />
      <a className={styles.skipLink} href="#legal-main-content">
        {tDoc("skipContent")}
      </a>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 border-b border-site-border/70 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand)_8%,transparent),transparent_72%)]"
      />

      <div className={styles.wikiLayout}>
        <aside className={styles.wikiSidebar}>
          <div className="rounded-[8px] border border-site-border bg-site-surface/88 p-2 shadow-[0_18px_60px_-42px_var(--site-surface-shadow)] backdrop-blur-xl">
            <div className="hidden px-3 pb-3 pt-2 lg:block">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-site-muted">
                {tDoc("eyebrow")}
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-site-text">
                PlanIt Wiki
              </h2>
            </div>
            <nav aria-label={tDoc("navigation")} className="hidden gap-1 lg:grid">
              {documentLinks}
            </nav>
            <details data-document-navigation className="group lg:hidden">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-[6px] px-3 py-2 text-base font-bold text-site-text marker:content-none [&::-webkit-details-marker]:hidden">
                {tDoc("navigation")}
                <span aria-hidden="true" className="text-2xl font-normal text-brand-strong group-open:rotate-45">+</span>
              </summary>
              <nav aria-label={tDoc("navigation")} className="grid max-h-[60svh] gap-1 overflow-y-auto pt-2">
                {documentLinks}
              </nav>
            </details>
          </div>
        </aside>

        <div
          id="legal-main-content"
          tabIndex={-1}
          className={`${styles.wikiContent} min-w-0 scroll-mt-28`}
        >
          <LegalDocumentClient
            locale={locale}
            kind={kind}
            fallbackDocument={document}
            initialLoadingHtml={initialLoadingHtml}
          />

          <div className="relative mt-6 overflow-hidden rounded-[8px] border border-site-border bg-site-surface p-8 text-center shadow-[0_24px_90px_-58px_var(--site-surface-shadow)] sm:p-10">
            <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand/10 via-transparent to-transparent" />
            <div className="pointer-events-none absolute -left-16 -top-16 z-0 h-48 w-48 rounded-[42%_58%_68%_32%/44%_52%_48%_56%] bg-brand-teal opacity-20 blur-[42px] mix-blend-multiply dark:mix-blend-screen" />
            <div className="pointer-events-none absolute -bottom-20 -right-16 z-0 h-56 w-56 rounded-[56%_44%_36%_64%/50%_46%_54%_50%] bg-brand-pink opacity-20 blur-[48px] mix-blend-multiply dark:mix-blend-screen" />
            <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                {tDoc("supportLabel")}
              </p>
              <p className="mt-3 text-2xl font-black tracking-tight text-site-text sm:text-3xl">
                {tDoc("support")}
              </p>
              <a
                href={SUPPORT_URL}
                className="group mt-7 inline-flex items-center justify-center gap-3 rounded-full bg-site-text px-7 py-4 text-sm font-black text-site-bg shadow-[0_18px_48px_-26px_var(--site-surface-shadow)] transition-transform hover:-translate-y-0.5"
              >
                {tDoc("supportAction")}
                <LegalSupportArrow
                  className="h-4 w-4 text-brand transition-transform group-hover:translate-x-1"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
