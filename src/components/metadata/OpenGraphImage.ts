import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Each social-preview-<locale>-dark.png is exported at 1200×630 from the matching .svg master (it imports into Figma).
// The -light.svg masters are design sources only.
export default async function OpenGraphImage(locale: "uk" | "en") {
  const image = await readFile(join(process.cwd(), `src/components/metadata/social-preview-${locale}-dark.png`));
  return new Response(new Uint8Array(image), { headers: { "Content-Type": "image/png" } });
}
