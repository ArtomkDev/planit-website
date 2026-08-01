import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import {
  getLegalDocumentLoadingPath,
  legalDocumentOrder,
  legalDocuments,
  type LegalDocumentKind,
} from "@/content/legal-documents";
import legalManifestJson from "../../../public/content/legal/manifest.json";
import { LegalDocumentIcon, LegalSupportArrow } from "./LegalIcons";
import { LegalDocumentClient } from "./LegalDocumentClient";
import styles from "./LegalDocument.module.css";

export type { LegalDocumentKind } from "@/content/legal-documents";

interface LegalDocumentProps {
  locale: string;
  kind: LegalDocumentKind;
}

type LegalSeedManifestDocument = {
  loadingPath?: string;
  loadingSha256?: string;
};

type LegalSeedManifest = {
  documents?: Partial<Record<string, LegalSeedManifestDocument>>;
};

const legalManifest = legalManifestJson as LegalSeedManifest;
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

async function getInitialLoadingHtml(kind: LegalDocumentKind) {
  try {
    const documentManifest = legalManifest.documents?.[kind];
    const loadingPath =
      documentManifest?.loadingPath ?? getLegalDocumentLoadingPath(kind);
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
  const document = legalDocuments[kind];
  const initialLoadingHtml = await getInitialLoadingHtml(kind);

  return (
    <div
      className={`${styles.wikiPage} relative isolate min-h-screen overflow-hidden bg-[#fbfbfc] dark:bg-[#09090b]`}
    >
      <a className={styles.skipLink} href="#legal-main-content">
        Skip to content
      </a>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 border-b border-zinc-200/70 bg-[linear-gradient(180deg,rgba(244,91,138,0.055),transparent_72%)] dark:border-zinc-900 dark:bg-[linear-gradient(180deg,rgba(62,247,210,0.035),transparent_72%)]"
      />

      <div className={styles.wikiLayout}>
        <aside className={styles.wikiSidebar}>
          <div className="rounded-[8px] border border-zinc-200 bg-white/88 p-2 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/78">
            <div className="px-3 pb-3 pt-2">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
                {tDoc("eyebrow")}
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
                PlanIt Wiki
              </h2>
            </div>
            <nav aria-label="Legal documents" className="grid gap-1">
              {legalDocumentOrder.map((documentKind) => {
                const data = legalDocuments[documentKind];
                const isActive = kind === documentKind;

                return (
                  <Link
                    key={documentKind}
                    href={`/${locale}/wiki/${documentKind}`}
                    aria-current={isActive ? "page" : undefined}
                    className={`group relative flex w-full items-start gap-3 rounded-[6px] p-3 text-left transition-colors ${
                      isActive
                        ? "bg-zinc-950 text-white shadow-[0_18px_44px_-34px_rgba(15,23,42,0.5)] dark:bg-white dark:text-zinc-950"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    {isActive ? (
                      <span
                        aria-hidden
                        className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-[#F45B8A] dark:bg-[#3EF7D2]"
                      />
                    ) : null}
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] ${
                        isActive
                          ? "bg-white/10 text-white dark:bg-zinc-950/10 dark:text-zinc-950"
                          : "bg-zinc-100 text-zinc-500 group-hover:bg-white group-hover:text-zinc-950 dark:bg-zinc-900 dark:group-hover:bg-zinc-800 dark:group-hover:text-white"
                      }`}
                    >
                      <LegalDocumentIcon
                        kind={documentKind}
                        className="h-5 w-5"
                        weight="bold"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-black">
                        {data.navigationTitle}
                      </span>
                      <span
                        className={`mt-1 line-clamp-2 block text-xs font-semibold leading-5 ${
                          isActive
                            ? "text-zinc-300 dark:text-zinc-600"
                            : "text-zinc-500 dark:text-zinc-500"
                        }`}
                      >
                        {data.summary}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <div
          id="legal-main-content"
          className={`${styles.wikiContent} min-w-0 scroll-mt-28`}
        >
          <LegalDocumentClient
            locale={locale}
            kind={kind}
            fallbackDocument={document}
            initialLoadingHtml={initialLoadingHtml}
          />

          <div className="relative mt-6 overflow-hidden rounded-[8px] border border-zinc-200 bg-zinc-50 p-8 text-center shadow-[0_24px_90px_-58px_rgba(15,23,42,0.55)] dark:border-zinc-800 dark:bg-zinc-900 sm:p-10">
            <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#F45B8A]/6 via-transparent to-transparent dark:from-[#3EF7D2]/10" />
            <div className="pointer-events-none absolute -left-16 -top-16 z-0 h-48 w-48 rounded-[42%_58%_68%_32%/44%_52%_48%_56%] bg-[#3EF7D2] opacity-20 blur-[42px] mix-blend-multiply dark:mix-blend-screen" />
            <div className="pointer-events-none absolute -bottom-20 -right-16 z-0 h-56 w-56 rounded-[56%_44%_36%_64%/50%_46%_54%_50%] bg-[#F45B8A] opacity-20 blur-[48px] mix-blend-multiply dark:mix-blend-screen" />
            <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                PlanIt support
              </p>
              <p className="mt-3 text-2xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
                {tDoc("support")}
              </p>
              <a
                href="mailto:planit.app.support@gmail.com"
                className="group mt-7 inline-flex items-center justify-center gap-3 rounded-full bg-zinc-950 px-7 py-4 text-sm font-black text-white shadow-[0_18px_48px_-26px_rgba(15,23,42,0.75)] transition-transform hover:-translate-y-0.5 dark:bg-white dark:text-zinc-950"
              >
                {tDoc("supportAction")}
                <LegalSupportArrow
                  className="h-4 w-4 text-[#F45B8A] transition-transform group-hover:translate-x-1 dark:text-[#0DAF93]"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
