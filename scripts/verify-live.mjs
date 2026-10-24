import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { readSiteConfig, sha256, inspectHtml } from './lib/site-seo.mjs';

const config = await readSiteConfig(fileURLToPath(new URL('../',import.meta.url)));
const origin = new URL(process.argv[2] || config.origin).origin;
const expectedRelease = JSON.parse(await readFile(new URL('../out/release.json', import.meta.url), 'utf8'));
const responseCache = new Map();

async function get(path) {
  if(!responseCache.has(path)) responseCache.set(path,fetch(origin + path, { cache: 'no-store', signal: AbortSignal.timeout(20_000) }));
  const response = await responseCache.get(path);
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response.clone();
}

try {
  const release = await (await get('/release.json')).json();
  if (release.buildId !== expectedRelease.buildId) throw new Error('Published release differs from the verified local build.');
  const expectedSeo = await readFile(new URL('../out/seo-manifest.json',import.meta.url),'utf8');
  if(sha256(await (await get('/seo-manifest.json')).text()) !== sha256(expectedSeo)) throw new Error('Published SEO inventory differs from this build.');
  const seo = JSON.parse(expectedSeo);
  for(const page of seo.pages) {
    const rendered=inspectHtml(await (await get(page.path)).text(),page.path);
    if(rendered.noindex || rendered.h1Count!==1 || rendered.title!==page.title || rendered.description!==page.description || rendered.canonicals.length!==1 || new URL(rendered.canonicals[0]).href!==new URL(page.canonical).href || JSON.stringify(rendered.alternates)!==JSON.stringify(page.alternates)) throw new Error(`Published page metadata differs from the build: ${page.path}.`);
  }
  for(const proof of config.verificationFiles) {
    const response=await get(proof.path);
    if(new URL(response.url).origin!==origin || sha256(Buffer.from(await response.arrayBuffer()))!==proof.sha256) throw new Error(`Published ownership proof is missing or changed: ${proof.path}.`);
  }
  for(const redirect of seo.redirects) {
    const response=await fetch(origin+redirect.source,{redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(20_000)});
    if(response.status!==redirect.type || new URL(response.headers.get('location')||'/',origin).pathname!==redirect.destination) throw new Error(`Published redirect is incorrect: ${redirect.source}.`);
  }
  const missing=await fetch(origin+`/__planit_missing_${release.buildId.slice(0,12)}`,{redirect:'manual',signal:AbortSignal.timeout(20_000)});
  if(missing.status!==404) throw new Error('The website must return HTTP 404 for missing pages.');
  const root = await (await get('/')).text();
  if (/name="robots" content="[^"]*noindex/.test(root)) throw new Error('The website root blocks indexing.');
  const identity = [...root.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1])).find(value => value['@type'] === 'WebSite');
  if (identity?.name !== 'PlanIt' || identity.url !== `${expectedRelease.siteOrigin}/`) throw new Error('Missing or incorrect root website identity.');
  const robots = await (await get('/robots.txt')).text();
  if (!robots.includes(`Sitemap: ${expectedRelease.siteOrigin}/sitemap.xml`)) throw new Error('robots.txt points at a different sitemap.');
  const sitemap = await (await get('/sitemap.xml')).text();
  for (const url of [`${expectedRelease.siteOrigin}/`, `${expectedRelease.siteOrigin}/uk`, `${expectedRelease.siteOrigin}/en`]) {
    if (!sitemap.includes(`<loc>${url}</loc>`)) throw new Error(`Missing homepage in sitemap: ${url}.`);
  }
  const manifest = await (await get('/content/legal/manifest.json')).json();
  if (manifest.version !== expectedRelease.legalVersion) throw new Error('Published legal manifest differs from this release.');
  for (const [locale, localized] of Object.entries(manifest.locales)) {
    const html = await (await get(`/${locale}`)).text();
    if (!html.includes(`rel="canonical" href="${expectedRelease.siteOrigin}/${locale}"`)) throw new Error(`Wrong canonical on /${locale}.`);
    if (/name="robots" content="[^"]*noindex/.test(html)) throw new Error(`Homepage blocks indexing: /${locale}.`);
    if (!html.includes('id="faq"') || !html.includes('id="feature-lesson"')) throw new Error(`Homepage content is stale: /${locale}.`);
    if (!html.includes(`property="og:image" content="${expectedRelease.siteOrigin}/opengraph-image"`)) throw new Error(`Missing social image on /${locale}.`);
    for (const [kind, entry] of Object.entries(localized.documents)) {
      for (const [pathKey, hashKey] of [['path', 'sha256'], ['loadingPath', 'loadingSha256']]) {
        const bytes = Buffer.from(await (await get(`${entry[pathKey]}?v=${entry[hashKey]}`)).arrayBuffer());
        if (createHash('sha256').update(bytes).digest('hex') !== entry[hashKey]) throw new Error(`Published legal integrity mismatch: ${locale}/${kind} ${pathKey}.`);
      }
      const document = await (await get(`/${locale}/wiki/${kind}`)).text();
      if (!document.includes(`rel="canonical" href="${expectedRelease.siteOrigin}/${locale}/wiki/${kind}"`)) throw new Error(`Wrong document canonical: ${locale}/${kind}.`);
      if (!document.includes(`<h1 lang="${locale}"`)) throw new Error(`Wrong document language: ${locale}/${kind}.`);
    }
  }
  for (const image of ['opengraph-image', 'twitter-image']) {
    const response = await get('/' + image);
    if (!response.headers.get('content-type')?.startsWith('image/png')) throw new Error(`${image}: incorrect Content-Type.`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error(`${image}: invalid PNG signature.`);
  }
  console.log(`Verified published release ${release.buildId.slice(0, 12)} at ${origin}: ${seo.pages.length} indexable pages, redirects, legal assets and ownership proofs.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
