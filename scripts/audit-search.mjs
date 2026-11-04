// Public HTTP evidence only. This does not impersonate a verified Google crawler,
// submit indexing requests, or infer Google index status from a site: query.
import { resolve4, resolve6, resolveCname, resolveTxt } from 'node:dns/promises';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectHtml, readSiteConfig, sha256, tags } from './lib/site-seo.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const config = await readSiteConfig(root);
const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== '--output')) throw new Error('Usage: npm run audit:search -- [--output audit-evidence/search-audit-2026-10-25/live.json]');
const output = path.resolve(root, args[1] || 'audit-evidence/search-audit-latest.json');
const origin = config.origin;
const hostname = new URL(origin).hostname;
const failures = [];
const observations = [];
const responses = new Map();

async function request(url, userAgent = 'Mozilla/5.0 (compatible; PlanItSearchAudit/1.0)') {
  const key = `${userAgent}:${url}`;
  if (!responses.has(key)) responses.set(key, (async () => {
    const started = performance.now();
    const response = await fetch(url, { redirect: 'manual', cache: 'no-store', headers: { 'user-agent': userAgent }, signal: AbortSignal.timeout(25_000) });
    const bytes = Buffer.from(await response.arrayBuffer());
    return { url, status: response.status, elapsedMs: Math.round(performance.now() - started), headers: Object.fromEntries(['content-type','x-robots-tag','location','cache-control','last-modified','content-encoding'].map(name => [name, response.headers.get(name)])), bytes, body: bytes.toString('utf8'), sha256: sha256(bytes) };
  })());
  return responses.get(key);
}

const evidence = response => {
  return Object.fromEntries(Object.entries(response).filter(([key]) => !['body','bytes'].includes(key)));
};
const check = (condition, message) => { if (!condition) failures.push(message); };
const noindexHeader = response => /\b(noindex|none)\b/i.test(response.headers['x-robots-tag'] || '');
const structuredData = html => [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map(match => JSON.parse(match[1]));
const visibleText = html => html.replace(/<(script|style|head)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

try {
  const dnsResults = await Promise.allSettled([resolve4(hostname), resolve6(hostname), resolveTxt(hostname), resolveCname(`www.${hostname}`)]);
  const dns = Object.fromEntries(['a','aaaa','txt','wwwCname'].map((name,index) => [name, dnsResults[index].status === 'fulfilled' ? dnsResults[index].value : { error: dnsResults[index].reason.code }]));
  const [robotsResponse, sitemapResponse, releaseResponse] = await Promise.all(['/robots.txt','/sitemap.xml','/release.json'].map(route => request(origin + route)));
  check(robotsResponse.status === 200, 'robots.txt must return 200.');
  check(robotsResponse.body.includes(`Sitemap: ${origin}/sitemap.xml`), 'robots.txt must advertise the canonical sitemap.');
  check(!/^Disallow:\s*\/\s*$/im.test(robotsResponse.body), 'robots.txt must not block the entire site.');
  check(sitemapResponse.status === 200 && /<urlset\b/.test(sitemapResponse.body), 'The sitemap must return XML and HTTP 200.');
  const urls = [...sitemapResponse.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  check(urls.length > 0 && new Set(urls).size === urls.length, 'The sitemap must contain unique page URLs.');
  check(urls.every(url => new URL(url).origin === origin), 'Every sitemap URL must use the canonical origin.');
  const pages = [];
  // Limit concurrent public requests to four.
  for (let index = 0; index < urls.length; index += 4) {
    pages.push(...await Promise.all(urls.slice(index,index+4).map(async url => {
      const response = await request(url);
      const route = new URL(url).pathname;
      const parsed = inspectHtml(response.body,route);
      const schemas = structuredData(response.body);
      const text = visibleText(response.body);
      check(response.status === 200, `${route}: expected HTTP 200, received ${response.status}.`);
      check(!parsed.noindex && !noindexHeader(response), `${route}: indexing is blocked in HTML or HTTP headers.`);
      check(parsed.canonicals.length === 1 && new URL(parsed.canonicals[0]).href === new URL(url).href, `${route}: incorrect canonical.`);
      check(parsed.h1Count === 1 && parsed.title && parsed.description, `${route}: missing title, description or single H1.`);
      for (const locale of config.locales) {
        const expected = `${origin}/${locale}${route === '/' ? '' : route.replace(/^\/(uk|en)/, '')}`;
        check(parsed.alternates[locale] && new URL(parsed.alternates[locale]).href === expected, `${route}: incorrect ${locale} hreflang.`);
      }
      const seo = Object.fromEntries(Object.entries(parsed).filter(([key]) => key !== 'destinations'));
      return { ...evidence(response), ...seo, visibleTextCharacters: text.length, visiblePlanItflow: /\bPlanItflow\b/i.test(text), schemas };
    })));
  }
  const homepagePaths = ['/','/uk','/en'];
  for (const route of homepagePaths) {
    const page = pages.find(item => item.path === route);
    check(Boolean(page), `${route}: missing homepage in sitemap.`);
    if (!page) continue;
    const website = page.schemas.find(schema => schema['@type'] === 'WebSite');
    check(website?.name === 'PlanIt' && website.url === `${origin}/`, `${route}: missing consistent website identity.`);
    if (!website?.alternateName?.includes('PlanItflow') || !page.visiblePlanItflow || !/PlanItflow/i.test(page.title)) observations.push(`${route}: PlanItflow is not consistently present in the title, visible text and website alternateName.`);
  }
  const bots = [];
  for (const [name, agent] of Object.entries({ Googlebot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', Bingbot: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)' })) {
    for (const route of homepagePaths) {
      const response = await request(origin + route,agent);
      const standard = await request(origin + route);
      check(response.status === standard.status && response.sha256 === standard.sha256, `${route}: different response with ${name} user-agent.`);
      bots.push({ agent: name, ...evidence(response), matchesStandardResponse: response.sha256 === standard.sha256 });
    }
  }
  const redirects = [];
  for (const url of [`http://${hostname}/uk?source=seo-audit`, `https://www.${hostname}/uk?source=seo-audit`]) {
    const response = await request(url);
    check([301,308].includes(response.status), `${url}: expected a permanent HTTPS/apex redirect.`);
    check(response.headers.location && new URL(response.headers.location,url).href === `${origin}/uk?source=seo-audit`, `${url}: redirect loses the path or query.`);
    redirects.push(evidence(response));
  }
  const missing = await request(`${origin}/__planit_search_audit_missing`);
  check(missing.status === 404, 'Unknown pages must return HTTP 404.');
  const rootResponse = await request(origin + '/');
  const homeResponse = await request(origin + '/uk');
  const assetUrls = [...new Set([...tags(homeResponse.body,'script').map(item => item.src), ...tags(homeResponse.body,'link').filter(item => item.rel === 'stylesheet').map(item => item.href), `${origin}/robots.txt`, `${origin}/opengraph-image`].filter(Boolean).map(url => new URL(url,origin).href))].filter(url => new URL(url).origin === origin);
  const assets = [];
  for (let index=0;index<assetUrls.length;index+=4) assets.push(...await Promise.all(assetUrls.slice(index,index+4).map(async url => {
    const response = await request(url);
    check(response.status === 200, `Asset unavailable: ${url} (${response.status}).`);
    return evidence(response);
  })));
  const proofs = await Promise.all(config.verificationFiles.map(async proof => {
    const initial = await request(origin+proof.path);
    let response = initial;
    // Firebase cleanUrls redirects .html to the same-origin extensionless URL.
    if ([301,302,307,308].includes(initial.status) && initial.headers.location) {
      const destination = new URL(initial.headers.location,initial.url);
      check(destination.origin === origin, `Google ownership proof redirects outside the website: ${proof.path}.`);
      if (destination.origin === origin) response = await request(destination.href);
    }
    check(response.status === 200 && response.sha256 === proof.sha256, `Google ownership proof missing or changed: ${proof.path}.`);
    return { requestedUrl: initial.url, ...(response !== initial ? { redirect: evidence(initial) } : {}), ...evidence(response) };
  }));
  const legacyHosts = [];
  for (const host of ['planit-hub.web.app','planit-hub.firebaseapp.com']) {
    const response = await request(`https://${host}/uk`);
    const parsed = inspectHtml(response.body,'/uk');
    legacyHosts.push({ ...evidence(response), canonicals: parsed.canonicals });
    if (response.status === 200) {
      check(parsed.canonicals[0] === `${origin}/uk`, `${host}: duplicate host must point canonical at the custom domain.`);
      observations.push(`${host} serves a duplicate with a canonical to ${origin}; it does not redirect by hostname.`);
    }
  }
  const playPrivacyEntry = [];
  let privacyUrl = 'https://planit-hub.web.app/privacy.html';
  for (let hop=0;hop<4;hop++) {
    const response = await request(privacyUrl);
    playPrivacyEntry.push({ ...evidence(response), ...(response.status === 200 ? { seo: inspectHtml(response.body,new URL(privacyUrl).pathname), javascriptRedirect: /location\.replace/.test(response.body) } : {}) });
    if (![301,302,307,308].includes(response.status) || !response.headers.location) break;
    privacyUrl = new URL(response.headers.location,privacyUrl).href;
  }
  const privacyFinal = playPrivacyEntry.at(-1);
  check(privacyFinal.status === 200, 'The privacy URL published on Google Play must reach an existing page.');
  if (privacyFinal.javascriptRedirect) observations.push('The privacy URL published on Google Play requires a JavaScript redirect through a noindex legacy page.');
  const report = { checkedAt: new Date().toISOString(), origin, scope: 'Public HTTP/DNS only; user-agent tests do not prove that real Googlebot has crawled. Read Search Console for index status, penalties and field performance.', dns, release: releaseResponse.status === 200 ? JSON.parse(releaseResponse.body) : null, robots: { ...evidence(robotsResponse), body: robotsResponse.body }, sitemap: { ...evidence(sitemapResponse), pageCount: urls.length }, pages, bots, redirects, missingPage: evidence(missing), assets, proofs, legacyHosts, playPrivacyEntry, rootLocaleRedirect: /id="planit-locale-redirect"/.test(rootResponse.body), failures, observations };
  await mkdir(path.dirname(output),{recursive:true});
  await writeFile(output,JSON.stringify(report,null,2)+'\n');
  console.log(`Search audit: ${pages.length} sitemap pages, ${bots.length} crawler user-agent responses, ${assets.length} assets. ${failures.length} failures; ${observations.length} observations.\nEvidence: ${output}`);
  if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
} catch (error) {
  console.error(`Search audit failed: ${error.message}`);
  process.exitCode = 1;
}
