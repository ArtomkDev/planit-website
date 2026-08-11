"use client";

import { useEffect, useState } from "react";
import {
  getLegalDocumentAssetPath,
  getLegalDocumentLoadingPath,
  isLegalDocumentKind,
  legalDocumentOrder,
  type LegalDocumentData,
  type LegalDocumentKind,
  type LegalDocumentMetadata,
} from "@/content/legal-documents";
import { LegalCalendarIcon, LegalDocumentIcon } from "./LegalIcons";
import styles from "./LegalDocument.module.css";

interface LegalDocumentClientProps {
  locale: string;
  kind: LegalDocumentKind;
  fallbackDocument: LegalDocumentData;
  initialLoadingHtml?: string;
}

interface LegalManifestDocument {
  path?: string;
  loadingPath?: string;
  sha256?: string;
  loadingSha256?: string;
  version?: string;
}

interface LegalManifest {
  version?: string;
  documents?: Partial<Record<LegalDocumentKind, LegalManifestDocument>>;
}

interface ParsedLegalDocument {
  metadata: LegalDocumentMetadata;
  html: string;
}

interface LegalAssetDescriptor {
  path: string;
  url: string;
  version?: string;
  expectedSha256?: string;
}

interface CachedLegalLoadingDocument {
  path: string;
  version: string;
  html: string;
  cachedAt: number;
}

const legalManifestPath = "/content/legal/manifest.json";
const legalLoadingCachePrefix = "planit:legal-loading:v2:";
const legacyLegalLoadingCachePrefix = "planit:legal-loading:v1:";
const legalLoadingMemoryCache = new Map<string, CachedLegalLoadingDocument>();
const legalLoadingWarmRequests = new Set<string>();

const allowedTags = new Set([
  "a",
  "br",
  "caption",
  "code",
  "dd",
  "div",
  "dl",
  "dt",
  "h2",
  "h3",
  "li",
  "nav",
  "ol",
  "p",
  "section",
  "span",
  "strong",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "ul",
]);

const allowedClasses = new Set([
  "contents",
  "danger",
  "email-btn",
  "notice",
  "small",
  "steps",
  "summary",
  "table-scroll",
  "warning",
  "sk",
  "sk-f",
  "sk-h",
  "sk-i",
  "sk-l",
  "sk-m",
  "sk-s",
  "sk-t",
  "sk-x",
]);

const metadataKeys = [
  "slug",
  "title",
  "navigationTitle",
  "summary",
  "effectiveDateLabel",
  "effectiveDate",
  "effectiveDateDisplay",
  "version",
] as const satisfies ReadonlyArray<keyof LegalDocumentMetadata>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getLegalLoadingCacheKey(kind: LegalDocumentKind) {
  return `${legalLoadingCachePrefix}${kind}`;
}

function getLegacyLegalLoadingCacheKeys(
  kind: LegalDocumentKind,
  locale: string,
) {
  return [...new Set([locale, "uk", "en"])]
    .filter(Boolean)
    .map(
      (legacyLocale) =>
        `${legacyLegalLoadingCachePrefix}${encodeURIComponent(
          legacyLocale,
        )}:${kind}`,
    );
}

function getUnversionedLoadingCacheVersion(path: string) {
  return `unversioned:${path}`;
}

function getLoadingStorageVersion(descriptor: LegalAssetDescriptor) {
  return descriptor.version ?? getUnversionedLoadingCacheVersion(descriptor.path);
}

function normalizeCachedLegalLoadingDocument(
  value: unknown,
): CachedLegalLoadingDocument | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.path !== "string" ||
    typeof value.version !== "string" ||
    typeof value.html !== "string"
  ) {
    return null;
  }

  return {
    path: value.path,
    version: value.version,
    html: value.html,
    cachedAt: typeof value.cachedAt === "number" ? value.cachedAt : 0,
  };
}

function readCachedLegalLoadingDocument(
  kind: LegalDocumentKind,
  locale: string,
) {
  const cacheKey = getLegalLoadingCacheKey(kind);
  const memoryCached = legalLoadingMemoryCache.get(cacheKey);

  if (memoryCached) {
    return memoryCached;
  }

  if (typeof window === "undefined") {
    return null;
  }

  try {
    const cacheKeys = [
      cacheKey,
      ...getLegacyLegalLoadingCacheKeys(kind, locale),
    ];

    for (const candidateCacheKey of cacheKeys) {
      const serializedCachedDocument =
        window.localStorage.getItem(candidateCacheKey);

      if (!serializedCachedDocument) {
        continue;
      }

      const cachedDocument = normalizeCachedLegalLoadingDocument(
        JSON.parse(serializedCachedDocument),
      );

      if (!cachedDocument) {
        window.localStorage.removeItem(candidateCacheKey);
        continue;
      }

      legalLoadingMemoryCache.set(cacheKey, cachedDocument);

      try {
        window.localStorage.setItem(cacheKey, JSON.stringify(cachedDocument));

        for (const legacyCacheKey of getLegacyLegalLoadingCacheKeys(
          kind,
          locale,
        )) {
          window.localStorage.removeItem(legacyCacheKey);
        }
      } catch {
        // The cached value is still usable from memory for this navigation.
      }

      return cachedDocument;
    }
  } catch {
    return null;
  }

  return null;
}

function writeCachedLegalLoadingDocument(
  kind: LegalDocumentKind,
  locale: string,
  cachedDocument: CachedLegalLoadingDocument,
) {
  const cacheKey = getLegalLoadingCacheKey(kind);
  legalLoadingMemoryCache.set(cacheKey, cachedDocument);

  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(cacheKey, JSON.stringify(cachedDocument));

    for (const legacyCacheKey of getLegacyLegalLoadingCacheKeys(kind, locale)) {
      window.localStorage.removeItem(legacyCacheKey);
    }
  } catch {
    // localStorage can be unavailable or full; the in-memory cache still helps.
  }
}

function isFreshCachedLoadingDocument(
  cachedDocument: CachedLegalLoadingDocument | null,
  descriptor: LegalAssetDescriptor,
) {
  return (
    cachedDocument?.path === descriptor.path &&
    cachedDocument.version === getLoadingStorageVersion(descriptor)
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function extractMetadataBlock(source: string) {
  const declaration = /export\s+const\s+legalMetadata\s*=/.exec(source);

  if (!declaration) {
    throw new Error("Missing legalMetadata export.");
  }

  const objectStart = source.indexOf(
    "{",
    declaration.index + declaration[0].length,
  );

  if (objectStart === -1) {
    throw new Error("Missing legalMetadata object.");
  }

  let depth = 0;
  let quote: '"' | "'" | "`" | null = null;
  let escaped = false;

  for (let index = objectStart; index < source.length; index += 1) {
    const character = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        quote = null;
      }

      continue;
    }

    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }

    if (character === "{") {
      depth += 1;
      continue;
    }

    if (character === "}") {
      depth -= 1;

      if (depth === 0) {
        return {
          objectText: source.slice(objectStart, index + 1),
          bodyStart: index + 1,
        };
      }
    }
  }

  throw new Error("Unclosed legalMetadata object.");
}

function parseLegalMetadata(
  objectText: string,
  expectedKind: LegalDocumentKind,
) {
  const parsed: unknown = JSON.parse(objectText);

  if (!isRecord(parsed)) {
    throw new Error("legalMetadata must be an object.");
  }

  const values: Record<string, string> = {};

  for (const key of metadataKeys) {
    const value = parsed[key];

    if (typeof value !== "string") {
      throw new Error(`legalMetadata.${key} must be a string.`);
    }

    values[key] = value;
  }

  if (!isLegalDocumentKind(values.slug) || values.slug !== expectedKind) {
    throw new Error("legalMetadata.slug does not match this route.");
  }

  return {
    slug: values.slug,
    title: values.title,
    navigationTitle: values.navigationTitle,
    summary: values.summary,
    effectiveDateLabel: values.effectiveDateLabel,
    effectiveDate: values.effectiveDate,
    effectiveDateDisplay: values.effectiveDateDisplay,
    version: values.version,
  };
}

function replaceMetadataExpressions(
  body: string,
  metadata: LegalDocumentMetadata,
) {
  return body.replace(
    /\{legalMetadata\.([A-Za-z_$][\w$]*)\}/g,
    (expression, key: string) => {
      const value = metadata[key as keyof LegalDocumentMetadata];

      if (typeof value !== "string") {
        throw new Error(`Unsupported metadata expression: ${expression}`);
      }

      return escapeHtml(value);
    },
  );
}

function rewriteLegalHref(href: string, locale: string) {
  const trimmedHref = href.trim();
  const legalPathMatch = trimmedHref.match(
    /^\.\/(privacy|cookies|terms|licenses|delete)(#[A-Za-z0-9_-]+)?$/,
  );
  const legalHtmlMatch = trimmedHref.match(
    /^\.\/(privacy|cookies|terms|licenses|delete)\.html(#[A-Za-z0-9_-]+)?$/,
  );
  const documentMatch = legalPathMatch ?? legalHtmlMatch;

  if (documentMatch) {
    return `/${locale}/wiki/${documentMatch[1]}${documentMatch[2] ?? ""}`;
  }

  return trimmedHref;
}

function isSafeHref(href: string) {
  const normalizedHref = href.replace(/[\u0000-\u001F\u007F\s]+/g, "");
  const loweredHref = normalizedHref.toLowerCase();

  if (
    loweredHref.startsWith("javascript:") ||
    loweredHref.startsWith("vbscript:") ||
    loweredHref.startsWith("data:")
  ) {
    return false;
  }

  if (href.startsWith("#") || href.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(href, window.location.origin);

    return ["http:", "https:", "mailto:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function sanitizeClassName(value: string) {
  return value
    .split(/\s+/)
    .filter((className) => allowedClasses.has(className))
    .join(" ");
}

function sanitizeId(value: string) {
  const trimmedValue = value.trim();

  return /^[A-Za-z][\w:-]*$/.test(trimmedValue) ? trimmedValue : "";
}

function sanitizeRel(value: string) {
  const relTokens = value
    .split(/\s+/)
    .filter((token) => ["noopener", "noreferrer"].includes(token));

  return [...new Set(relTokens)].join(" ");
}

function sanitizeAttributes(element: Element, locale: string) {
  const tagName = element.tagName.toLowerCase();

  for (const attribute of Array.from(element.attributes)) {
    const name = attribute.name.toLowerCase();
    const value = attribute.value;

    if (name.startsWith("on") || name === "style") {
      element.removeAttribute(attribute.name);
      continue;
    }

    if (name === "class") {
      const safeClassName = sanitizeClassName(value);

      if (safeClassName) {
        element.setAttribute("class", safeClassName);
      } else {
        element.removeAttribute(attribute.name);
      }

      continue;
    }

    if (name === "id") {
      const safeId = sanitizeId(value);

      if (safeId) {
        element.setAttribute("id", safeId);
      } else {
        element.removeAttribute(attribute.name);
      }

      continue;
    }

    if (tagName === "a" && name === "href") {
      const safeHref = rewriteLegalHref(value, locale);

      if (isSafeHref(safeHref)) {
        element.setAttribute("href", safeHref);
      } else {
        element.removeAttribute(attribute.name);
      }

      continue;
    }

    if (tagName === "a" && name === "target") {
      if (value === "_blank") {
        element.setAttribute("target", "_blank");
      } else {
        element.removeAttribute(attribute.name);
      }

      continue;
    }

    if (tagName === "a" && name === "rel") {
      const safeRel = sanitizeRel(value);

      if (safeRel) {
        element.setAttribute("rel", safeRel);
      } else {
        element.removeAttribute(attribute.name);
      }

      continue;
    }

    if (tagName === "nav" && name === "aria-label") {
      element.setAttribute("aria-label", value.trim());
      continue;
    }

    if (tagName === "th" && name === "scope") {
      if (["col", "colgroup", "row", "rowgroup"].includes(value)) {
        element.setAttribute("scope", value);
      } else {
        element.removeAttribute(attribute.name);
      }

      continue;
    }

    element.removeAttribute(attribute.name);
  }

  if (tagName === "a" && element.getAttribute("target") === "_blank") {
    element.setAttribute("rel", "noopener noreferrer");
  }
}

function sanitizeNode(node: Node, locale: string) {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.COMMENT_NODE) {
      child.remove();
      continue;
    }

    if (child.nodeType === Node.TEXT_NODE) {
      continue;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) {
      child.remove();
      continue;
    }

    const element = child as Element;
    const tagName = element.tagName.toLowerCase();

    if (!allowedTags.has(tagName)) {
      element.remove();
      continue;
    }

    sanitizeAttributes(element, locale);
    sanitizeNode(element, locale);
  }
}

function parseLegalDocument(
  source: string,
  kind: LegalDocumentKind,
  locale: string,
): ParsedLegalDocument {
  const metadataBlock = extractMetadataBlock(source);
  const metadata = parseLegalMetadata(metadataBlock.objectText, kind);
  const mdxBody = source
    .slice(metadataBlock.bodyStart)
    .replace(/^\s*;?\s*/, "")
    .trim();
  const htmlLikeBody = replaceMetadataExpressions(mdxBody, metadata).replace(
    /\bclassName\s*=/g,
    "class=",
  );

  return {
    metadata,
    html: sanitizeLegalHtml(htmlLikeBody, locale),
  };
}

function sanitizeLegalHtml(htmlLikeBody: string, locale: string) {
  const template = document.createElement("template");
  template.innerHTML = htmlLikeBody;
  sanitizeNode(template.content, locale);

  return template.innerHTML;
}

function normalizeManifest(value: unknown): LegalManifest | null {
  if (!isRecord(value)) {
    return null;
  }

  const manifest: LegalManifest = {};

  if (typeof value.version === "string") {
    manifest.version = value.version;
  }

  if (isRecord(value.documents)) {
    manifest.documents = {};

    for (const documentKind of legalDocumentOrder) {
      const documentManifest = value.documents[documentKind];

      if (!isRecord(documentManifest)) {
        continue;
      }

      manifest.documents[documentKind] = {
        path:
          typeof documentManifest.path === "string"
            ? documentManifest.path
            : undefined,
        loadingPath:
          typeof documentManifest.loadingPath === "string"
            ? documentManifest.loadingPath
            : undefined,
        sha256:
          typeof documentManifest.sha256 === "string"
            ? documentManifest.sha256
            : undefined,
        loadingSha256:
          typeof documentManifest.loadingSha256 === "string"
            ? documentManifest.loadingSha256
            : undefined,
        version:
          typeof documentManifest.version === "string"
            ? documentManifest.version
            : undefined,
      };
    }
  }

  return manifest;
}

export async function fetchLegalManifest() {
  try {
    const response = await fetch(legalManifestPath);

    if (!response.ok) {
      return null;
    }

    return normalizeManifest(await response.json());
  } catch {
    return null;
  }
}

function buildVersionedAssetUrl(path: string, version?: string) {
  if (!version) {
    return path;
  }

  const separator = path.includes("?") ? "&" : "?";

  return `${path}${separator}v=${encodeURIComponent(version)}`;
}

function getLegalAssetRequestCache(version?: string): RequestCache {
  return version ? "force-cache" : "no-store";
}

function getLegalDocumentAssetDescriptor(
  kind: LegalDocumentKind,
  manifest: LegalManifest | null,
): LegalAssetDescriptor {
  const manifestDocument = manifest?.documents?.[kind];
  const path = manifestDocument?.path ?? getLegalDocumentAssetPath(kind);
  const version =
    manifestDocument?.sha256 ?? manifestDocument?.version ?? manifest?.version;

  return {
    path,
    version,
    url: buildVersionedAssetUrl(path, version),
    expectedSha256: manifestDocument?.sha256,
  };
}

function getLegalLoadingAssetDescriptor(
  kind: LegalDocumentKind,
  manifest: LegalManifest | null,
): LegalAssetDescriptor {
  const manifestDocument = manifest?.documents?.[kind];
  const path =
    manifestDocument?.loadingPath ?? getLegalDocumentLoadingPath(kind);
  const version =
    manifestDocument?.loadingSha256 ??
    manifestDocument?.sha256 ??
    manifestDocument?.version ??
    manifest?.version;

  return {
    path,
    version,
    url: buildVersionedAssetUrl(path, version),
    expectedSha256: manifestDocument?.loadingSha256,
  };
}

async function sha256Hex(value: string) {
  if (
    typeof window === "undefined" ||
    typeof TextEncoder === "undefined" ||
    !window.crypto?.subtle
  ) {
    return null;
  }

  const encodedValue = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest("SHA-256", encodedValue);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyLegalAssetHash(
  source: string,
  expectedSha256: string | undefined,
  label: string,
) {
  if (!expectedSha256) {
    return;
  }

  const actualSha256 = await sha256Hex(source);

  if (!actualSha256) {
    return;
  }

  if (actualSha256.toLowerCase() !== expectedSha256.toLowerCase()) {
    throw new Error(`${label} hash mismatch.`);
  }
}

async function fetchLegalLoadingDocument(
  kind: LegalDocumentKind,
  manifest: LegalManifest | null,
) {
  const descriptor = getLegalLoadingAssetDescriptor(kind, manifest);
  const response = await fetch(descriptor.url, {
    cache: getLegalAssetRequestCache(descriptor.version),
  });

  if (!response.ok) {
    return null;
  }

  const source = await response.text();
  await verifyLegalAssetHash(
    source,
    descriptor.expectedSha256,
    `${kind} loading document`,
  );

  return {
    path: descriptor.path,
    version: getLoadingStorageVersion(descriptor),
    html: parseLegalLoadingBody(source),
    cachedAt: Date.now(),
  };
}

async function fetchLegalDocument(
  kind: LegalDocumentKind,
  manifest: LegalManifest | null,
  locale: string,
) {
  const descriptor = getLegalDocumentAssetDescriptor(kind, manifest);
  const response = await fetch(descriptor.url, {
    cache: getLegalAssetRequestCache(descriptor.version),
  });

  if (!response.ok) {
    throw new Error(`Legal document request failed: ${response.status}`);
  }

  const source = await response.text();
  await verifyLegalAssetHash(source, descriptor.expectedSha256, `${kind} document`);

  return parseLegalDocument(source, kind, locale);
}

async function ensureFreshLegalLoadingDocument(
  kind: LegalDocumentKind,
  manifest: LegalManifest | null,
  locale: string,
) {
  const descriptor = getLegalLoadingAssetDescriptor(kind, manifest);
  const cachedDocument = readCachedLegalLoadingDocument(kind, locale);

  if (isFreshCachedLoadingDocument(cachedDocument, descriptor)) {
    return cachedDocument;
  }

  const fetchedDocument = await fetchLegalLoadingDocument(kind, manifest);

  if (!fetchedDocument) {
    return cachedDocument;
  }

  writeCachedLegalLoadingDocument(kind, locale, fetchedDocument);

  return fetchedDocument;
}

export function warmLegalLoadingDocuments(
  manifest: LegalManifest | null,
  locale: string,
  activeKind?: LegalDocumentKind,
) {
  for (const documentKind of legalDocumentOrder) {
    if (activeKind && documentKind === activeKind) {
      continue;
    }

    const descriptor = getLegalLoadingAssetDescriptor(documentKind, manifest);
    const cachedDocument = readCachedLegalLoadingDocument(documentKind, locale);

    if (isFreshCachedLoadingDocument(cachedDocument, descriptor)) {
      continue;
    }

    const warmKey = `${getLegalLoadingCacheKey(documentKind)}:${getLoadingStorageVersion(
      descriptor,
    )}`;

    if (legalLoadingWarmRequests.has(warmKey)) {
      continue;
    }

    legalLoadingWarmRequests.add(warmKey);

    void ensureFreshLegalLoadingDocument(documentKind, manifest, locale).catch(
      () => {
        legalLoadingWarmRequests.delete(warmKey);
      },
    );
  }
}

export async function warmAllLegalLoadingDocuments(locale: string) {
  if (typeof window === "undefined") {
    return;
  }

  const manifest = await fetchLegalManifest();
  warmLegalLoadingDocuments(manifest, locale);
}

function parseLegalBodyOnly(source: string, locale: string) {
  const htmlLikeBody = source
    .replace(/^\s*;?\s*/, "")
    .trim()
    .replace(/\bclassName\s*=/g, "class=");

  return sanitizeLegalHtml(htmlLikeBody, locale);
}

function parseLegalLoadingBody(source: string) {
  const html = parseLegalBodyOnly(source, "en");
  const template = document.createElement("template");
  template.innerHTML = html;

  for (const anchor of Array.from(template.content.querySelectorAll("a"))) {
    anchor.removeAttribute("href");
    anchor.removeAttribute("target");
    anchor.removeAttribute("rel");
  }

  return template.innerHTML;
}

function upsertMeta(name: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);

  if (!meta) {
    meta = document.createElement("meta");
    meta.name = name;
    document.head.append(meta);
  }

  meta.content = content;
}

function LegalDocumentLoadingShell() {
  return (
    <article
      aria-busy="true"
      aria-label="Loading legal document"
      className={`${styles.prose} ${styles.loadingProse}`}
    >
      <div aria-hidden className="summary">
        <strong>
          <span className="sk sk-s sk-m" />
        </strong>
        <ul>
          {Array.from({ length: 4 }).map((_, index) => (
            <li key={`summary-${index}`}>
              <span className="sk sk-t sk-f" />
              <span className="sk sk-t sk-m" />
            </li>
          ))}
        </ul>
      </div>

      <nav aria-hidden className="contents">
        <h2>
          <span className="sk sk-h sk-m" />
        </h2>
        <ol>
          {Array.from({ length: 10 }).map((_, index) => (
            <li key={`contents-${index}`}>
              <span className={`sk sk-i ${index % 3 === 0 ? "sk-m" : "sk-x"}`} />
            </li>
          ))}
        </ol>
      </nav>

      {Array.from({ length: 4 }).map((_, sectionIndex) => (
        <section aria-hidden key={`section-${sectionIndex}`}>
          <h2>
            <span className="sk sk-h sk-l" />
          </h2>
          {Array.from({ length: sectionIndex === 0 ? 3 : 2 }).map(
            (__, paragraphIndex) => (
              <p key={`paragraph-${sectionIndex}-${paragraphIndex}`}>
                <span className="sk sk-t sk-f" />
                <span className="sk sk-t sk-l" />
                <span
                  className={`sk sk-t ${
                    (sectionIndex + paragraphIndex) % 2 === 0 ? "sk-m" : "sk-x"
                  }`}
                />
              </p>
            ),
          )}
        </section>
      ))}
    </article>
  );
}

export function LegalDocumentClient({
  locale,
  kind,
  fallbackDocument,
  initialLoadingHtml = "",
}: LegalDocumentClientProps) {
  const [documentMetadata, setDocumentMetadata] =
    useState<LegalDocumentMetadata>(fallbackDocument);
  const [html, setHtml] = useState("");
  const [loadingHtml, setLoadingHtml] = useState(initialLoadingHtml);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const cachedLoadingDocument = readCachedLegalLoadingDocument(kind, locale);
    const visibleLoadingHtml =
      initialLoadingHtml || cachedLoadingDocument?.html || "";

    async function loadLegalDocument() {
      setError(null);
      setHtml("");
      setLoadingHtml(visibleLoadingHtml);
      setDocumentMetadata(fallbackDocument);

      try {
        const manifest = await fetchLegalManifest();

        if (ignore) {
          return;
        }

        void ensureFreshLegalLoadingDocument(kind, manifest, locale)
          .then((nextLoadingDocument) => {
            if (!ignore && nextLoadingDocument?.html && !visibleLoadingHtml) {
              setLoadingHtml(nextLoadingDocument.html);
            }
          })
          .catch(() => undefined);

        warmLegalLoadingDocuments(manifest, locale, kind);

        const parsedDocument = await fetchLegalDocument(kind, manifest, locale);

        if (ignore) {
          return;
        }

        setDocumentMetadata(parsedDocument.metadata);
        setHtml(parsedDocument.html);
        setLoadingHtml("");
      } catch (loadError) {
        if (ignore) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load this document.",
        );
        setLoadingHtml("");
      }
    }

    void loadLegalDocument();

    return () => {
      ignore = true;
    };
  }, [fallbackDocument, initialLoadingHtml, kind, locale]);

  useEffect(() => {
    document.title = `${documentMetadata.title} | PlanIt`;
    upsertMeta("description", documentMetadata.summary);
  }, [documentMetadata]);

  return (
    <>
      <header className="mb-6 rounded-[8px] border border-site-border bg-site-surface/86 p-5 shadow-[0_20px_70px_-48px_var(--site-surface-shadow)] backdrop-blur-xl sm:p-7 lg:p-8">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[8px] border border-site-border bg-site-surface-muted text-site-muted shadow-[0_18px_46px_-38px_var(--site-surface-shadow)]">
          <LegalDocumentIcon
            kind={kind}
            className="h-7 w-7"
            weight="duotone"
          />
        </div>
        <h1 className="text-balance text-4xl font-black tracking-tight text-site-text sm:text-5xl lg:text-6xl">
          {documentMetadata.title}
        </h1>
        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-2 rounded-full border border-site-border bg-site-surface-muted px-3 py-2 text-xs font-bold text-site-muted">
            <LegalCalendarIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <span>
              <strong>{documentMetadata.effectiveDateLabel}</strong>{" "}
              <time dateTime={documentMetadata.effectiveDate}>
                {documentMetadata.effectiveDateDisplay}
              </time>{" "}
              &middot; Version {documentMetadata.version}
            </span>
          </span>
        </div>
      </header>

      {html ? (
        <article
          className={styles.prose}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : loadingHtml ? (
        <article
          aria-busy="true"
          aria-label="Loading legal document"
          className={`${styles.prose} ${styles.loadingProse}`}
          dangerouslySetInnerHTML={{ __html: loadingHtml }}
        />
      ) : error ? (
        <article className={styles.prose} aria-busy={!error}>
          <div
            className={`${styles.runtimeState} ${
              error ? styles.runtimeStateError : ""
            }`}
            role={error ? "alert" : "status"}
          >
            This legal document could not be loaded. Please refresh the page.
          </div>
        </article>
      ) : (
        <LegalDocumentLoadingShell />
      )}
    </>
  );
}
