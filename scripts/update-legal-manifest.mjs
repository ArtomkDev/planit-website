import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const legalDirectory = fileURLToPath(new URL("../public/content/legal/", import.meta.url));
const documents = ["privacy", "cookies", "terms", "licenses", "delete"];

function extractMetadata(source, slug) {
  const match = source.match(
    /export\s+const\s+legalMetadata\s*=\s*({[\s\S]*?})\s*;?/,
  );

  if (!match) {
    throw new Error(`${slug}.mdx is missing export const legalMetadata.`);
  }

  const metadata = JSON.parse(match[1]);

  if (metadata.slug !== slug) {
    throw new Error(`${slug}.mdx legalMetadata.slug must be "${slug}".`);
  }

  return metadata;
}

const manifest = {
  version: "",
  documents: {},
  locales: {},
};

for (const locale of ["en", "uk"]) {
  const directory = locale === "en" ? legalDirectory : join(legalDirectory, locale);
  const localeDocuments = {};
  for (const slug of documents) {
    const filePath = join(directory, `${slug}.mdx`);
    const loadingPath = join(directory, `${slug}.loading.mdx`);
    const source = await readFile(filePath, "utf8");
    const loading = await readFile(loadingPath, "utf8");
    const metadata = extractMetadata(source, slug);
    const sha256 = createHash("sha256").update(source, "utf8").digest("hex");
    const loadingSha256 = createHash("sha256")
      .update(loading, "utf8")
      .digest("hex");

    const prefix = locale === "en" ? "/content/legal" : `/content/legal/${locale}`;
    localeDocuments[slug] = {
      path: `${prefix}/${slug}.mdx`,
      loadingPath: `${prefix}/${slug}.loading.mdx`,
      sha256,
      loadingSha256,
      title: metadata.title,
      version: metadata.version,
      metadata,
    };
  }
  manifest.locales[locale] = { documents: localeDocuments };
  if (locale === "en") manifest.documents = localeDocuments;
}

manifest.version = createHash("sha256")
  .update(JSON.stringify(manifest.locales), "utf8")
  .digest("hex")
  .slice(0, 16);

await writeFile(
  join(legalDirectory, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);

console.log(`Updated legal manifest ${manifest.version}`);
