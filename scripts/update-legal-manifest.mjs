import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const legalDirectory = resolve("public", "content", "legal");
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
};

for (const slug of documents) {
  const filePath = join(legalDirectory, `${slug}.mdx`);
  const loadingPath = join(legalDirectory, `${slug}.loading.mdx`);
  const source = await readFile(filePath, "utf8");
  const loading = await readFile(loadingPath, "utf8");
  const metadata = extractMetadata(source, slug);
  const sha256 = createHash("sha256").update(source, "utf8").digest("hex");
  const loadingSha256 = createHash("sha256")
    .update(loading, "utf8")
    .digest("hex");

  manifest.documents[slug] = {
    path: `/content/legal/${slug}.mdx`,
    loadingPath: `/content/legal/${slug}.loading.mdx`,
    sha256,
    loadingSha256,
    title: metadata.title,
    version: metadata.version,
  };
}

manifest.version = createHash("sha256")
  .update(JSON.stringify(manifest.documents), "utf8")
  .digest("hex")
  .slice(0, 16);

await writeFile(
  join(legalDirectory, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);

console.log(`Updated legal manifest ${manifest.version}`);
