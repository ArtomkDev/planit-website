import { spawnSync } from "node:child_process";
import { access, copyFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const websiteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
if (args.length && (args[0] !== "--source" || args.length !== 2)) {
  throw new Error("Usage: npm run legal:sync -- --source <PlanIt project directory>");
}
const sourceRoot = resolve(args[1] || join(websiteRoot, "..", "PlanIt"));
const sourceDirectory = join(sourceRoot, "content", "legal");
const outputDirectory = join(websiteRoot, "public", "content", "legal");
const documents = ["privacy", "cookies", "terms", "licenses", "delete"];

try {
  await Promise.all([
    sourceDirectory,
    join(sourceRoot, "scripts", "generate-legal-documents.js"),
    join(sourceRoot, "scripts", "generate-legal-loading-documents.js"),
  ].map(file => access(file)));
} catch {
  throw new Error(`PlanIt legal source or generators were not found at ${sourceRoot}`);
}

function runNode(script, args, env) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: sourceRoot,
    env: { ...process.env, ...env },
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Legal document script failed: ${script}`);
}

// Reuse the app's translation validation and loading renderer.
runNode(join(sourceRoot, "scripts", "generate-legal-documents.js"), ["--check"], {
  PLANIT_LEGAL_SOURCE_DIR: sourceDirectory,
  PLANIT_LEGAL_SYNC_WEBSITE: "0",
});

for (const language of ["en", "uk"]) {
  const folder = language === "en" ? "" : language;
  const source = join(sourceDirectory, folder);
  const output = join(outputDirectory, folder);
  await mkdir(output, { recursive: true });
  for (const slug of documents) {
    await copyFile(join(source, `${slug}.mdx`), join(output, `${slug}.mdx`));
  }
  runNode(join(sourceRoot, "scripts", "generate-legal-loading-documents.js"), [], {
    PLANIT_LEGAL_SOURCE_DIR: source,
    PLANIT_LEGAL_LOADING_OUTPUT_DIR: output,
  });
}

runNode(join(websiteRoot, "scripts", "update-legal-manifest.mjs"), [], {});
console.log(`Synced English and Ukrainian legal documents from ${sourceRoot}`);
