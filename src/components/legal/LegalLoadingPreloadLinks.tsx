import { legalDocumentOrder } from "@/content/legal-documents";
import legalManifestJson from "../../../public/content/legal/manifest.json";

type LegalPreloadManifestDocument = {
  loadingPath?: string;
  loadingSha256?: string;
  sha256?: string;
  version?: string;
};

type LegalPreloadManifest = {
  version?: string;
  documents?: Partial<Record<string, LegalPreloadManifestDocument>>;
};

const legalManifest = legalManifestJson as LegalPreloadManifest;

function buildVersionedAssetUrl(path: string, version?: string) {
  if (!version) {
    return path;
  }

  const separator = path.includes("?") ? "&" : "?";

  return `${path}${separator}v=${encodeURIComponent(version)}`;
}

function getLegalLoadingPreloadUrls() {
  return legalDocumentOrder.flatMap((documentKind) => {
    const documentManifest = legalManifest.documents?.[documentKind];
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

export function LegalLoadingPreloadLinks() {
  return (
    <>
      {getLegalLoadingPreloadUrls().map((href) => (
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
