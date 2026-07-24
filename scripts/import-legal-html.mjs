import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(scriptDirectory, "..");
const sourceDirectory = process.argv[2]
  ? resolve(process.argv[2])
  : resolve(projectDirectory, "..", "PlanIt", "legal-hosting");
const outputDirectory = join(projectDirectory, "src", "content", "legal");

const documents = ["privacy", "terms", "cookies", "delete"];

function decodeText(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&middot;", "·")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isoDate(displayDate) {
  const parsed = new Date(`${displayDate} UTC`);

  if (Number.isNaN(parsed.valueOf())) {
    throw new Error(`Cannot parse legal document date: ${displayDate}`);
  }

  return parsed.toISOString().slice(0, 10);
}

function normalizedVisibleText(value) {
  return decodeText(
    value
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

function tagCounts(value) {
  const counts = new Map();
  const tags = value.matchAll(/<\s*([a-z][a-z0-9-]*)\b/gi);

  for (const match of tags) {
    const tag = match[1].toLowerCase();
    counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }

  return [...counts.entries()]
    .filter(([tag]) => !["main"].includes(tag))
    .sort(([left], [right]) => left.localeCompare(right));
}

function verifyImport(sourceContent, outputContent, summary, slug) {
  const sourceText = normalizedVisibleText(sourceContent);
  const outputText = normalizedVisibleText(
    outputContent.replaceAll("{legalMetadata.summary}", summary),
  );
  const sourceTags = JSON.stringify(tagCounts(sourceContent));
  const outputTags = JSON.stringify(tagCounts(outputContent));

  if (sourceText !== outputText) {
    throw new Error(`Visible legal text changed while importing ${slug}.html`);
  }

  if (sourceTags !== outputTags) {
    throw new Error(`Legal document structure changed while importing ${slug}.html`);
  }

  return createHash("sha256").update(sourceText, "utf8").digest("hex");
}

function extractDocument(html, slug) {
  const titleMatch = html.match(/<h1>([\s\S]*?)<\/h1>/i);
  const navigationMatch = html.match(
    /<a\b[^>]*class="nav-link active"[^>]*>([\s\S]*?)<\/a>/i,
  );
  const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);

  if (!titleMatch || !navigationMatch || !mainMatch) {
    throw new Error(`Cannot find the legal document shell in ${slug}.html`);
  }

  const metaMatch = mainMatch[1].match(
    /<p class="legal-meta"><strong>([\s\S]*?)<\/strong>\s*([^<&]+?)\s*&middot;\s*Version\s*([^<]+)<\/p>/i,
  );
  const summaryMatch = mainMatch[1].match(
    /<div class="summary">\s*<strong>([\s\S]*?)<\/strong>/i,
  );

  if (!metaMatch || !summaryMatch) {
    throw new Error(`Cannot find metadata in ${slug}.html`);
  }

  const effectiveDateDisplay = decodeText(metaMatch[2]);
  const summary = decodeText(summaryMatch[1]);
  let content = mainMatch[1]
    .replace(metaMatch[0], "")
    .replace(
      /(<div class="summary">\s*<strong>)[\s\S]*?(<\/strong>)/i,
      "$1{legalMetadata.summary}$2",
    )
    .replace(/\bhref="(privacy|terms|cookies|delete)\.html(?=([#"]))/g, 'href="./$1')
    .replace(/\bclass=/g, "className=")
    .replace(/<br\s*>/g, "<br />")
    .replace(/\n\s+<\/(td|p)>/g, "</$1>")
    .trim();

  const contentLines = content.split(/\r?\n/);
  const nonEmptyLines = contentLines
    .slice(1, -1)
    .filter((line) => line.trim());
  const indentation = Math.min(
    ...nonEmptyLines.map((line) => line.match(/^\s*/)?.[0].length ?? 0),
  );
  content = contentLines
    .map((line, index) => {
      if (index === 0 || index === contentLines.length - 1 || !line.trim()) {
        return line;
      }

      return line.slice(Math.min(indentation, line.length));
    })
    .join("\n");

  const metadata = {
    slug,
    title: decodeText(titleMatch[1]),
    navigationTitle: decodeText(navigationMatch[1]),
    summary,
    effectiveDateLabel: decodeText(metaMatch[1]),
    effectiveDate: isoDate(effectiveDateDisplay),
    effectiveDateDisplay,
    version: decodeText(metaMatch[3]),
  };
  const sourceContent = mainMatch[1].replace(metaMatch[0], "").trim();
  const checksum = verifyImport(sourceContent, content, summary, slug);

  return {
    checksum,
    mdx: `export const legalMetadata = ${JSON.stringify(metadata, null, 2)};\n\n${content}\n`,
  };
}

await mkdir(outputDirectory, { recursive: true });

for (const slug of documents) {
  const sourcePath = join(sourceDirectory, `${slug}.html`);
  const outputPath = join(outputDirectory, `${slug}.mdx`);
  const html = await readFile(sourcePath, "utf8");
  const { checksum, mdx } = extractDocument(html, slug);

  await writeFile(outputPath, mdx, "utf8");
  console.log(`Imported and verified ${slug}.html (${checksum})`);
}
