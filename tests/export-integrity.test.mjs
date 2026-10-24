import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { verifyExport } from '../scripts/verify-export.mjs';

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'planit-export-'));
  t.after(async () => {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(tmpdir()));
    assert.ok(path.basename(root).startsWith('planit-export-'));
    await rm(root, { recursive: true, force: true });
  });
  for (const folder of ['src','scripts','public/content/legal/uk','out/content/legal/uk']) await mkdir(path.join(root,folder),{recursive:true});
  const manifest={version:'fixture',locales:{}};
  for (const locale of ['uk','en']) {
    const documents={};
    for (const kind of ['privacy','cookies','terms','licenses','delete']) {
      const prefix=locale==='en'?'/content/legal':`/content/legal/${locale}`;
      const entry={};
      for (const [key,hashKey,suffix] of [['path','sha256','.mdx'],['loadingPath','loadingSha256','.loading.mdx']]) {
        const asset=`${prefix}/${kind}${suffix}`,content=`${locale}:${kind}:${key}`;
        for (const folder of ['public','out']) await writeFile(path.join(root,folder,asset),content);
        entry[key]=asset;entry[hashKey]=createHash('sha256').update(content).digest('hex');
      }
      documents[kind]=entry;
    }
    manifest.locales[locale]={documents};
    await writeFile(path.join(root,`out/${locale}.html`),`<link rel="canonical" href="https://example.test/${locale}">`);
  }
  for (const folder of ['public','out']) await writeFile(path.join(root,folder,'content/legal/manifest.json'),JSON.stringify(manifest));
  for (const image of ['opengraph-image','twitter-image']) await writeFile(path.join(root,'out',image),Buffer.from('89504e470d0a1a0a','hex'));
  await writeFile(path.join(root,'src/page.tsx'),'original source');
  return root;
}

test('deployment preflight accepts the complete build and rejects changed source when skipping build',async t=>{
  const root=await fixture(t);
  const recorded=await verifyExport({root,recordBuild:true});
  assert.deepEqual(await verifyExport({root}),recorded);
  await writeFile(path.join(root,'src/page.tsx'),'updated source');
  await assert.rejects(verifyExport({root}),/changed since the last build/);
});

test('deployment preflight detects a legal asset replaced without updating its manifest',async t=>{
  const root=await fixture(t);
  await verifyExport({root,recordBuild:true});
  await writeFile(path.join(root,'out/content/legal/uk/privacy.mdx'),'different revision');
  await assert.rejects(verifyExport({root}),/Legal integrity mismatch: uk\/privacy/);
});

test('deployment preflight requires a recorded build and rejects modified export files',async t=>{
  const root=await fixture(t);
  await assert.rejects(verifyExport({root}),/No verified build stamp/);
  await verifyExport({root,recordBuild:true});
  await writeFile(path.join(root,'out/uk.html'),'<link rel="canonical" href="https://example.test/uk">new content');
  await assert.rejects(verifyExport({root}),/changed since the last build/);
});
