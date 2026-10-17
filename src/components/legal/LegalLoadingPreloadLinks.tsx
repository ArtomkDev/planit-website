import { getLegalManifestDocument, legalDocumentOrder, type LegalManifest } from "@/content/legal-documents";
import legalManifestJson from "../../../public/content/legal/manifest.json";

const legalManifest = legalManifestJson as LegalManifest;

function buildVersionedAssetUrl(path: string, version?: string) {
  if (!version) {
    return path;
  }

  const separator = path.includes("?") ? "&" : "?";

  return `${path}${separator}v=${encodeURIComponent(version)}`;
}

function getLegalLoadingPreloadUrls(locale: string) {
  return legalDocumentOrder.flatMap((documentKind) => {
    const documentManifest = getLegalManifestDocument(documentKind, locale, legalManifest);
    const loadingPath = documentManifest?.loadingPath;

    if (!loadingPath) {
      return [];
    }

    const version =
      documentManifest.loadingSha256 ??
      documentManifest.sha256 ??
      documentManifest.version ??
      legalManifest.version;

    return [buildVersionedAssetUrl(loadingPath, version)];
  });
}

export function LegalLoadingPreloadLinks({ locale }: { locale: string }) {
  return (
    <>
      {getLegalLoadingPreloadUrls(locale).map((href) => (
        <link
          as="fetch"
          crossOrigin="anonymous"
          href={href}
          key={href}
          rel="prefetch"
          type="text/plain"
        />
      ))}
    </>
  );
}
