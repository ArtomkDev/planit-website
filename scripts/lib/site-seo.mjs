import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import nextEnv from '@next/env';
import { validateContentPages } from '../../src/lib/content-page-schema.mjs';

export function loadBuildEnvironment(root) { nextEnv.loadEnvConfig(root, false); }

export const sha256 = value => createHash('sha256').update(value).digest('hex');
export const escapeXml = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[character]));
const decode = value => value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (_, entity) => entity[0] === '#' ? String.fromCodePoint(parseInt(entity.slice(entity[1]?.toLowerCase() === 'x' ? 2 : 1), entity[1]?.toLowerCase() === 'x' ? 16 : 10)) : ({amp:'&',quot:'"',apos:"'",lt:'<',gt:'>'}[entity.toLowerCase()]));
export const normalizePath = value => new URL(value, 'https://route.invalid').pathname.replace(/\/$/, '') || '/';

export function tags(html, tag) {
  return [...html.matchAll(new RegExp(`<${tag}\\b([^>]*)>`, 'gi'))].map(match => Object.fromEntries([...match[1].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(([,key,double,single]) => [key.toLowerCase(), decode(double ?? single)])));
}

export function inspectHtml(raw, route) {
  const html = raw.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  const meta = tags(html, 'meta');
  const links = tags(html, 'link');
  return {
    path: route,
    locale: tags(html, 'html')[0]?.lang,
    title: decode(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || ''),
    description: meta.find(item => item.name === 'description')?.content || '',
    noindex: meta.some(item => ['robots','googlebot'].includes(item.name?.toLowerCase()) && /\bnoindex\b/i.test(item.content)),
    canonicals: links.filter(item => item.rel === 'canonical').map(item => item.href),
    alternates: Object.fromEntries(links.filter(item => item.rel === 'alternate' && item.hreflang).map(item => [item.hreflang, item.href])),
    ogUrl: meta.find(item => item.property === 'og:url')?.content,
    image: meta.find(item => item.property === 'og:image')?.content,
    h1Count: [...html.matchAll(/<h1\b/gi)].length,
    destinations: [...tags(html, 'a').map(item => item.href), ...tags(html, 'img').map(item => item.src)].filter(Boolean),
  };
}

export async function filesUnder(directory) {
  return (await Promise.all((await readdir(directory, {withFileTypes:true})).map(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(file) : entry.isFile() ? [file] : [];
  }))).flat().sort();
}

export async function readSiteConfig(root) {
  loadBuildEnvironment(root);
  const config = JSON.parse(await readFile(path.join(root, 'site.config.json'), 'utf8'));
  const origin = new URL(process.env.NEXT_PUBLIC_BASE_URL || config.origin);
  if (origin.protocol !== 'https:' || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) throw new Error('Website origin must be a plain HTTPS origin.');
  if (!Array.isArray(config.locales) || config.locales.join(',') !== 'uk,en') throw new Error('This website requires the uk and en locales.');
  if (!config.hosting?.account || !config.hosting.project || !config.hosting.target) throw new Error('Configure the Firebase project, target and account in site.config.json.');
  return {...config, origin:origin.origin};
}

export async function verifyVerificationFiles(directory, config) {
  if (!config.verificationFiles?.length) throw new Error('Register the existing Google ownership proof in site.config.json.');
  for (const proof of config.verificationFiles) {
    if (!/^\/google[\da-f]+\.html$/.test(proof.path) || !/^[\da-f]{64}$/.test(proof.sha256)) throw new Error('Invalid verification file registration.');
    let bytes;
    try { bytes = await readFile(path.join(directory, proof.path)); }
    catch { throw new Error(`Missing ownership proof ${proof.path}. Restore it before publishing.`); }
    if (sha256(bytes) !== proof.sha256) throw new Error(`Ownership proof ${proof.path} changed. Restore the Google-provided file.`);
  }
}

function validatePages(pages, config) {
  const byPath = new Map(pages.map(page => [page.path, page]));
  const titles = new Set();
  for (const page of pages) {
    const expected = new URL(page.path, config.origin).href;
    if (page.canonicals.length !== 1 || new URL(page.canonicals[0]).href !== expected) throw new Error(`${page.path}: use a self-referencing canonical, expected ${expected}. Use createPageMetadata().`);
    if (!page.title.trim() || !page.description.trim() || page.h1Count !== 1) throw new Error(`${page.path}: an indexable page needs a title, description and exactly one H1.`);
    if (!page.image || new URL(page.image).origin !== config.origin || page.ogUrl && new URL(page.ogUrl).href !== expected) throw new Error(`${page.path}: social metadata must use the website origin and page URL.`);
    const titleKey = `${page.locale}:${page.title.toLowerCase()}`;
    if (titles.has(titleKey)) throw new Error(`${page.path}: duplicate title in the same language.`);
    titles.add(titleKey);
    const locale = page.path.split('/')[1];
    if (page.path !== '/' && !config.locales.includes(locale)) throw new Error(`${page.path}: indexable pages must have a supported locale prefix.`);
    if (page.path !== '/' && page.locale !== locale) throw new Error(`${page.path}: HTML language disagrees with its URL.`);
    for (const language of config.locales) {
      const alternatePath = page.path === '/' ? `/${language}` : page.path.replace(/^\/(uk|en)(?=\/|$)/, `/${language}`);
      const alternate = byPath.get(alternatePath);
      if (!alternate || !page.alternates[language] || new URL(page.alternates[language]).href !== new URL(alternatePath, config.origin).href) throw new Error(`${page.path}: missing page or reciprocal hreflang for ${language}.`);
    }
    if (['/','/uk','/en'].includes(page.path) && new URL(page.alternates['x-default'] || 'https://missing.invalid').href !== `${config.origin}/`) throw new Error(`${page.path}: homepage x-default must point at the root.`);
  }
  if (!byPath.has('/') || !byPath.has('/uk') || !byPath.has('/en')) throw new Error('Missing root or localized homepage.');
}

export function assertRouteContinuity(previousPaths, currentPaths, redirects) {
  const current = new Set(currentPaths);
  const moves = new Map(redirects.filter(item => [301,308].includes(item.type)).map(item => [item.source,item.destination]));
  for (const previous of previousPaths) {
    let route = previous;
    const seen = new Set();
    while (!current.has(route) && moves.has(route) && !seen.has(route)) { seen.add(route); route = moves.get(route); }
    if (!current.has(route)) throw new Error(`Previously published page ${previous} disappeared. Add a permanent redirect to an existing page in firebase.json.`);
  }
}

export async function collectSeo(root, config) {
  const directory = path.join(root, 'out');
  const {hosting} = JSON.parse(await readFile(path.join(root, 'firebase.json'), 'utf8'));
  const redirects = hosting.redirects || [];
  const skip = new Set(['/404','/_not-found', ...config.verificationFiles.map(proof => normalizePath(proof.path.replace(/\.html$/, ''))), ...redirects.map(item => item.source)]);
  const legal = JSON.parse(await readFile(path.join(directory, 'content/legal/manifest.json'), 'utf8'));
  const content = validateContentPages(JSON.parse(await readFile(path.join(root, 'src/content/pages.json'), 'utf8')));
  const pages = [];
  for (const file of await filesUnder(directory)) {
    if (!file.endsWith('.html')) continue;
    const relative = path.relative(directory, file).replaceAll(path.sep, '/');
    const route = normalizePath('/' + relative.replace(/(?:^|\/)index\.html$/, '').replace(/\.html$/, ''));
    if (skip.has(route)) continue;
    const page = inspectHtml(await readFile(file, 'utf8'), route);
    if (page.noindex) continue;
    const [,locale,area,kind] = route.split('/');
    const lastModified = area === 'wiki' ? legal.locales?.[locale]?.documents?.[kind]?.metadata?.effectiveDate : content.find(item => item.published && `/${locale}/${item.slug}` === route)?.updatedAt;
    pages.push({...page, ...(lastModified ? {lastModified} : {})});
  }
  validatePages(pages, config);
  for (const page of pages) {
    for (const destination of [page.image, ...page.destinations]) {
      const url = new URL(destination, new URL(page.path, config.origin));
      if (url.origin !== config.origin) continue;
      const route = normalizePath(url.pathname);
      const target = redirects.find(item => item.source === route)?.destination || route;
      const candidate = path.resolve(directory, '.' + decodeURIComponent(target));
      const relative = path.relative(directory, candidate);
      if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`${page.path}: invalid internal URL ${destination}.`);
      const candidates = target === '/' ? [path.join(directory,'index.html')] : [candidate, candidate+'.html', path.join(candidate,'index.html')];
      if (!(await Promise.all(candidates.map(file => stat(file).then(value => value.isFile(), () => false)))).some(Boolean)) throw new Error(`${page.path}: broken internal URL ${destination}.`);
    }
  }
  return {version:1, origin:config.origin, pages:pages.map(page => ({path:page.path,locale:page.locale,title:page.title,description:page.description,alternates:page.alternates,image:page.image,canonical:page.canonicals[0],...(page.lastModified ? {lastModified:page.lastModified} : {})})), redirects};
}

export function renderSitemap(manifest) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + manifest.pages.map(page => '<url>\n<loc>'+escapeXml(new URL(page.path,manifest.origin).href)+'</loc>\n'+Object.entries(page.alternates).map(([language,url])=>`<xhtml:link rel="alternate" hreflang="${escapeXml(language)}" href="${escapeXml(url)}" />\n`).join('')+(page.lastModified ? `<lastmod>${escapeXml(page.lastModified)}</lastmod>\n` : '')+'</url>\n').join('')+'</urlset>\n';
}
