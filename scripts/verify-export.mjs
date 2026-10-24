import { createHash } from 'node:crypto';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadBuildEnvironment } from './lib/site-seo.mjs';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const locales = ['uk', 'en'];
const kinds = ['privacy', 'cookies', 'terms', 'licenses', 'delete'];
const hash = value => createHash('sha256').update(value).digest('hex');

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(entries.map(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(file) : entry.isFile() ? [file] : [];
  }));
  return groups.flat().sort();
}

export async function sourceFingerprint(root = projectRoot) {
  const files = (await Promise.all(['src', 'public', 'scripts'].map(folder => filesUnder(path.join(root, folder))))).flat();
  for (const file of ['site.config.json', '.firebaserc', 'package.json', 'package-lock.json', 'next.config.ts', 'firebase.json', 'tsconfig.json', '.env', '.env.local', '.env.production', '.env.production.local']) {
    try {
      await readFile(path.join(root, file));
      files.push(path.join(root, file));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  const digest = createHash('sha256');
  for (const file of files.sort()) {
    digest.update(path.relative(root, file).replaceAll(path.sep, '/'));
    digest.update(hash(await readFile(file)));
  }
  for (const name of ['NEXT_PUBLIC_BASE_URL', 'NEXT_PUBLIC_APP_URL', 'GOOGLE_SITE_VERIFICATION']) digest.update(`${name}:${process.env[name] ?? ''}`);
  return digest.digest('hex');
}

async function artifactFingerprint(directory) {
  const digest = createHash('sha256');
  for (const file of await filesUnder(directory)) {
    const relative = path.relative(directory, file).replaceAll(path.sep, '/');
    if (relative === 'release.json') continue;
    digest.update(relative);
    digest.update(hash(await readFile(file)));
  }
  return digest.digest('hex');
}

export async function verifyLegalAssets(directory, manifest) {
  for (const locale of locales) {
    for (const kind of kinds) {
      const entry = manifest.locales?.[locale]?.documents?.[kind];
      const prefix = locale === 'en' ? '/content/legal' : `/content/legal/${locale}`;
      if (!entry) throw new Error(`Missing ${locale}/${kind} in the exported legal manifest.`);
      for (const [pathKey, hashKey, suffix] of [['path', 'sha256', '.mdx'], ['loadingPath', 'loadingSha256', '.loading.mdx']]) {
        if (entry[pathKey] !== `${prefix}/${kind}${suffix}`) throw new Error(`Unexpected asset path for ${locale}/${kind}: ${pathKey}.`);
        const content = await readFile(path.join(directory, entry[pathKey]));
        if (hash(content) !== entry[hashKey]) throw new Error(`Legal integrity mismatch: ${locale}/${kind} ${pathKey}. Rebuild the complete website.`);
      }
    }
  }
}

export async function verifyExport({ root = projectRoot, recordBuild = false } = {}) {
  const directory = path.join(root, 'out');
  const manifest = JSON.parse(await readFile(path.join(directory, 'content/legal/manifest.json'), 'utf8'));
  const sourceManifest = JSON.parse(await readFile(path.join(root, 'public/content/legal/manifest.json'), 'utf8'));
  if (JSON.stringify(manifest) !== JSON.stringify(sourceManifest)) throw new Error('Exported legal manifest is stale. Run npm run build.');
  await verifyLegalAssets(directory, manifest);

  let siteOrigin;
  for (const locale of locales) {
    const html = await readFile(path.join(directory, `${locale}.html`), 'utf8');
    const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)?.[1];
    if (!canonical) throw new Error(`Missing canonical on /${locale}.`);
    const url = new URL(canonical);
    if (url.protocol !== 'https:' || /^(localhost|127\.0\.0\.1)$/.test(url.hostname) || url.pathname !== `/${locale}`) throw new Error(`Invalid canonical on /${locale}.`);
    if (siteOrigin && siteOrigin !== url.origin) throw new Error('Homepage origins disagree.');
    siteOrigin = url.origin;
  }
  for (const image of ['opengraph-image', 'twitter-image']) {
    const bytes = await readFile(path.join(directory, image));
    if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error(`${image} is not a PNG.`);
  }

  const source = await sourceFingerprint(root);
  const artifact = await artifactFingerprint(directory);
  const stampPath = path.join(root, '.next/planit-export.json');
  const release = { buildId: artifact, legalVersion: manifest.version, siteOrigin };
  if (recordBuild) {
    await mkdir(path.dirname(stampPath), { recursive: true });
    await writeFile(stampPath, JSON.stringify({ source, artifact }) + '\n');
    await writeFile(path.join(directory, 'release.json'), JSON.stringify(release, null, 2) + '\n');
  } else {
    let stamp;
    try {
      stamp = JSON.parse(await readFile(stampPath, 'utf8'));
    } catch {
      throw new Error('No verified build stamp. Run npm run build before deployment.');
    }
    if (stamp.source !== source || stamp.artifact !== artifact) throw new Error('Source or exported files changed since the last build. Run npm run build before deployment.');
    const recorded = JSON.parse(await readFile(path.join(directory, 'release.json'), 'utf8'));
    if (JSON.stringify(recorded) !== JSON.stringify(release)) throw new Error('Release metadata does not match the export. Rebuild before deployment.');
  }
  return release;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    loadBuildEnvironment(projectRoot);
    const release = await verifyExport({ recordBuild: process.argv.includes('--record-build') });
    console.log(`Verified export ${release.buildId.slice(0, 12)}: both locales, legal integrity, canonical origins and PNG assets.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
