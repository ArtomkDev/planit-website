import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';

test('preview serves entry, metadata, document redirects, and real 404 status', async () => {
  const server = spawn(process.execPath, ['scripts/serve-static-export.mjs', '4174'], {stdio:['ignore','pipe','pipe']});
  try {
    await new Promise((resolve,reject) => {
      const timer=setTimeout(()=>reject(new Error('preview failed to start')),10000);
      server.once('error',reject);
      server.stderr.once('data', data=>reject(new Error(String(data))));
      server.stdout.once('data',()=>{clearTimeout(timer);resolve();});
    });
    const get = path => fetch('http://127.0.0.1:4174'+path, {redirect:'manual'});
    for (const path of ['/','/uk','/en','/icon','/apple-icon','/opengraph-image','/twitter-image','/robots.txt','/sitemap.xml','/manifest.webmanifest','/release.json']) assert.equal((await get(path)).status,200,path);
    const {hosting}=JSON.parse(await readFile('firebase.json','utf8'));
    const manifest=JSON.parse(await readFile('out/content/legal/manifest.json','utf8'));
    for (const [locale,localized] of Object.entries(manifest.locales)) {
      for (const [kind,entry] of Object.entries(localized.documents)) {
        for (const path of [entry.path,entry.loadingPath]) {
          const asset=await get(`${path}?v=${entry.sha256}`);
          assert.equal(asset.status,200,`${locale}/${kind}: ${path}`);
          assert.equal(asset.headers.get('cache-control'),'no-cache','mutable legal paths must revalidate');
          assert.equal(await asset.text(),await readFile('out'+path,'utf8'));
        }
      }
    }
    for (const redirect of hosting.redirects) {
      const response=await get(redirect.source+'?source=old-link');
      assert.equal(response.status,redirect.type);
      assert.equal(response.headers.get('location'),redirect.destination+'?source=old-link');
      assert.equal((await get(redirect.destination)).status,200);
    }
    for (const path of ['/uk/missing-page','/de','/..%2Fpackage.json']) assert.equal((await get(path)).status,404,path);
    const image=await get('/opengraph-image');
    assert.match(image.headers.get('content-type'),/image\/png/);
    assert.deepEqual([...new Uint8Array(await image.arrayBuffer()).slice(0,8)],[137,80,78,71,13,10,26,10]);
  } finally {
    server.kill();
  }
});
