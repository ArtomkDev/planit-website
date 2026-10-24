import { readFile } from 'node:fs/promises';
import { validateContentPages } from '../src/lib/content-page-schema.mjs';
try {
  const pages=validateContentPages(JSON.parse(await readFile(new URL('../src/content/pages.json',import.meta.url),'utf8')));
  for(const page of pages) {
    try { await readFile(new URL(`../src/app/[locale]/${page.slug}/page.tsx`,import.meta.url)); throw new Error(`Page ${page.slug} conflicts with a custom route.`); }
    catch(error) { if(error.code!=='ENOENT') throw error; }
  }
  console.log(`Content valid: ${pages.filter(page=>page.published).length} published pages; drafts stay out of the export.`);
} catch(error) { console.error(error.message); process.exitCode=1; }
