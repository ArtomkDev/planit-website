import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, copyFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { collectSeo, renderSitemap, verifyVerificationFiles, assertRouteContinuity, inspectHtml, sha256 } from '../scripts/lib/site-seo.mjs';
import { runSteps, parseOptions, previewUrl } from '../scripts/site-update.mjs';
import { validateContentPages } from '../src/lib/content-page-schema.mjs';

function pageHtml(route, overrides={}) {
  const locale=route.split('/')[1] || 'uk';
  const url='https://example.test'+route;
  const suffix=route==='/'?'':route.replace(/^\/(uk|en)/,'');
  return `<html lang="${locale}"><head><title>${overrides.title || 'Page '+route}</title><meta name="description" content="Useful description for ${route}"/><link rel="canonical" href="${overrides.canonical || url}"/><meta property="og:url" content="${url}"/><meta property="og:image" content="https://example.test/opengraph-image"/>${['uk','en'].map(language=>`<link rel="alternate" hrefLang="${language}" href="https://example.test/${language}${suffix}"/>`).join('')}${['/','/uk','/en'].includes(route)?'<link rel="alternate" hrefLang="x-default" href="https://example.test/"/>':''}</head><body><main><h1>Useful page</h1><a href="/uk">Home</a></main></body></html>`;
}

async function fixture(t) {
  const root=await mkdtemp(path.join(tmpdir(),'planit-release-'));
  t.after(async()=>{
    assert.equal(path.dirname(path.resolve(root)),path.resolve(tmpdir()));
    assert.ok(path.basename(root).startsWith('planit-release-'));
    await rm(root,{recursive:true,force:true});
  });
  for(const folder of ['out/content/legal','out/uk','out/en','public','src/content']) await mkdir(path.join(root,folder),{recursive:true});
  await writeFile(path.join(root,'firebase.json'),JSON.stringify({hosting:{redirects:[]}}));
  await writeFile(path.join(root,'src/content/pages.json'),'[]');
  await writeFile(path.join(root,'out/content/legal/manifest.json'),JSON.stringify({locales:{uk:{documents:{}},en:{documents:{}}}}));
  await writeFile(path.join(root,'out/opengraph-image'),'image');
  for(const route of ['/','/uk','/en']) await writeFile(path.join(root,'out',route==='/'?'index.html':route+'.html'),pageHtml(route));
  const proof='google-site-verification: googleabc.html';
  for(const folder of ['public','out']) await writeFile(path.join(root,folder,'googleabc.html'),proof);
  return {root,config:{origin:'https://example.test',locales:['uk','en'],verificationFiles:[{path:'/googleabc.html',sha256:sha256(proof)}]}};
}

test('new exported locale pairs enter the sitemap without maintaining a route list',async t=>{
  const {root,config}=await fixture(t);
  for(const locale of ['uk','en']) await writeFile(path.join(root,`out/${locale}/new-page.html`),pageHtml(`/${locale}/new-page`));
  await writeFile(path.join(root,'out/uk/private.html'),'<meta name="robots" content="noindex, nofollow"/>');
  const manifest=await collectSeo(root,config);
  assert.equal(manifest.pages.length,5);
  const xml=renderSitemap(manifest);
  assert.ok(xml.includes('<loc>https://example.test/uk/new-page</loc>'));
  assert.ok(xml.includes('hreflang="en" href="https://example.test/en/new-page"'));
  assert.ok(!xml.includes('private'));
  assert.ok(!xml.includes('<lastmod>'),'build dates must not become content dates');
});

test('inherited homepage canonical and missing translations stop the release',async t=>{
  const {root,config}=await fixture(t);
  await writeFile(path.join(root,'out/uk/new-page.html'),pageHtml('/uk/new-page',{canonical:'https://example.test/uk'}));
  await assert.rejects(collectSeo(root,config),/self-referencing canonical/);
  await writeFile(path.join(root,'out/uk/new-page.html'),pageHtml('/uk/new-page'));
  await assert.rejects(collectSeo(root,config),/missing page or reciprocal hreflang/);
});

test('duplicate titles and broken internal destinations stop the release',async t=>{
  const {root,config}=await fixture(t);
  await writeFile(path.join(root,'out/index.html'),pageHtml('/',{title:'Page /uk'}));
  await assert.rejects(collectSeo(root,config),/duplicate title/);
  await writeFile(path.join(root,'out/index.html'),pageHtml('/').replace('href="/uk"','href="/uk/missing"'));
  await assert.rejects(collectSeo(root,config),/broken internal URL/);
});

test('missing or changed ownership files are rejected before publication',async t=>{
  const {root,config}=await fixture(t);
  await verifyVerificationFiles(path.join(root,'public'),config);
  await writeFile(path.join(root,'public/googleabc.html'),'changed');
  await assert.rejects(verifyVerificationFiles(path.join(root,'public'),config),/changed/);
  await rm(path.join(root,'public/googleabc.html'));
  await assert.rejects(verifyVerificationFiles(path.join(root,'public'),config),/Missing ownership proof/);
});

test('previous URLs require permanent redirects to existing pages, including through a chain',()=>{
  assert.throws(()=>assertRouteContinuity(['/uk/old'],['/uk/new'],[]),/disappeared/);
  assert.throws(()=>assertRouteContinuity(['/uk/old'],['/uk/new'],[{source:'/uk/old',destination:'/uk/new',type:302}]),/disappeared/);
  assertRouteContinuity(['/uk/old'],['/uk/new'],[{source:'/uk/old',destination:'/uk/moved',type:301},{source:'/uk/moved',destination:'/uk/new',type:308}]);
  assert.throws(()=>assertRouteContinuity(['/uk/old'],[],[{source:'/uk/old',destination:'/uk/old',type:301}]),/disappeared/);
});

test('a failed check stops the workflow before upload',async()=>{
  const visited=[];
  await assert.rejects(runSteps(['build','seo','upload','verify'],async step=>{visited.push(step);if(step==='seo')throw new Error('bad metadata');}),/bad metadata/);
  assert.deepEqual(visited,['build','seo']);
});

test('release arguments reject unknown flags and preview URLs must belong to the configured site',()=>{
  assert.deepEqual(parseOptions(['--check','--no-sync-legal']),{check:true,noSyncLegal:true});
  assert.throws(()=>parseOptions(['--skip-build','--legal-source','../PlanIt']),/requires a new build/);
  assert.throws(()=>parseOptions(['--typo']),/Unknown/);
  assert.equal(previewUrl({result:{site:{url:'https://planit-hub--preview-abc.web.app'}}},'planit-hub'),'https://planit-hub--preview-abc.web.app');
  assert.throws(()=>previewUrl({url:'https://other--preview.web.app'},'planit-hub'),/could not be identified/);
});

test('drafts stay unpublished and incomplete or reserved pages cannot be published',async()=>{
  const draft={slug:'new-page',published:false};
  assert.equal(validateContentPages([draft])[0].published,false);
  assert.throws(()=>validateContentPages([{...draft,slug:'../escape'}]),/Invalid or reserved/);
  assert.throws(()=>validateContentPages([{...draft,slug:'wiki'}]),/Invalid or reserved/);
  const published=JSON.parse(await readFile('src/content/pages.json','utf8'))[0];
  validateContentPages([published]);
  assert.throws(()=>validateContentPages([{...published,locales:{uk:published.locales.uk}}]),/en/);
  assert.throws(()=>validateContentPages([published,published]),/Duplicate/);
});

test('HTML parsing ignores serialized scripts and handles attribute case and entities',()=>{
  const page=inspectHtml(pageHtml('/uk').replace('<title>Page /uk</title>','<title>PlanIt &amp; study</title>')+'<script>"<h1>Serialized</h1>"</script>','/uk');
  assert.equal(page.h1Count,1);
  assert.equal(page.title,'PlanIt & study');
  assert.equal(page.alternates.en,'https://example.test/en');
});

test('page command creates a draft and refuses duplicate or conflicting routes without changing content',async t=>{
  const {root}=await fixture(t);
  for(const folder of ['scripts','src/lib']) await mkdir(path.join(root,folder),{recursive:true});
  await copyFile('scripts/new-page.mjs',path.join(root,'scripts/new-page.mjs'));
  await copyFile('src/lib/content-page-schema.mjs',path.join(root,'src/lib/content-page-schema.mjs'));
  const command=slug=>spawnSync(process.execPath,[path.join(root,'scripts/new-page.mjs'),slug],{encoding:'utf8'});
  assert.equal(command('new-page').status,0);
  const file=path.join(root,'src/content/pages.json');
  const original=await readFile(file,'utf8');
  const [draft]=JSON.parse(original);
  assert.equal(draft.slug,'new-page');
  assert.equal(draft.published,false);
  assert.deepEqual(Object.keys(draft.locales),['uk','en']);
  assert.equal(command('new-page').status,1);
  await mkdir(path.join(root,'src/app/[locale]/custom'),{recursive:true});
  await writeFile(path.join(root,'src/app/[locale]/custom/page.tsx'),'custom route');
  assert.equal(command('custom').status,1);
  assert.equal(command('../escape').status,1);
  assert.equal(await readFile(file,'utf8'),original);
});
