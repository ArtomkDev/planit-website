import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { collectSeo, readSiteConfig, renderSitemap, verifyVerificationFiles } from './lib/site-seo.mjs';

const root = fileURLToPath(new URL('../',import.meta.url));
try {
  const config = await readSiteConfig(root);
  await verifyVerificationFiles(path.join(root,'public'),config);
  await verifyVerificationFiles(path.join(root,'out'),config);
  const manifest = await collectSeo(root,config);
  const outputs = {'seo-manifest.json':JSON.stringify(manifest,null,2)+'\n','sitemap.xml':renderSitemap(manifest)};
  for(const [name,value] of Object.entries(outputs)) {
    const file = path.join(root,'out',name);
    if(process.argv.includes('--check')) {
      if(await readFile(file,'utf8') !== value) throw new Error(`${name} is stale. Rebuild the website.`);
    } else await writeFile(file,value);
  }
  console.log(`SEO verified: ${manifest.pages.length} indexable pages, all locale pairs, internal links and ownership proofs.`);
} catch(error) { console.error(error.message); process.exitCode=1; }
