import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const kinds=['privacy','cookies','terms','licenses','delete'];
const locales=['uk','en'];
const readRoute=async route=>(await readFile(`out${route}.html`,'utf8')).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');

test('root export redirects before displaying content and provides a no-JavaScript fallback', async () => {
  const html = await readFile('out/index.html', 'utf8');
  const head = html.match(/<head>[\s\S]*?<\/head>/)?.[0];
  const script = head?.match(/<script\b[^>]*id="planit-locale-redirect"[^>]*>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'locale redirect must be inline in the initial head');
  assert.match(head, /<noscript><meta http-equiv="refresh" content="0;url=\/uk"\/><\/noscript>/);
  assert.doesNotMatch(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, ''), /<main\b|<h1\b|<a\b/);
  for (const [saved, languages, expected] of [[null, ['en-US'], 'en'], [null, ['uk-UA'], 'uk'], ['en', ['uk-UA'], 'en'], [null, ['de-DE'], 'uk']]) {
    let destination;
    runInNewContext(script, {
      window: { localStorage: { getItem: () => saved }, location: { search: '?source=entry', hash: '#features', replace: url => { destination = url; } } },
      document: { cookie: '' },
      navigator: { languages },
    });
    assert.equal(destination, `/${expected}?source=entry#features`);
  }
  for (const locale of locales) assert.ok(!(await readFile(`out/${locale}.html`, 'utf8')).includes('id="planit-locale-redirect"'), 'explicit locale URLs must stay on their selected locale');
});

test('global header only contains destinations, with equivalent mobile links', async () => {
  for (const locale of locales) {
    const html=await readRoute('/'+locale);
    const header=html.match(/<header\b[\s\S]*?<\/header>/)?.[0];
    assert.ok(header);
    assert.ok(!header.includes(`#features`),'features shortcut must stay out of the header');
    assert.match(header,/id="mobile-navigation"/);
    for (const kind of kinds) assert.equal([...header.matchAll(new RegExp(`href="/${locale}/wiki/${kind}"`,'g'))].length,2,kind+' desktop and mobile');
    for (const id of ['features','feature-lesson','feature-appearance','feature-tasks','feature-schedule','platforms']) assert.ok(html.includes(`id="${id}"`));
    assert.ok(!html.includes('href="#feature-'),'intro shortcuts must not return');
  }
});
test('all document canonical URLs use the website origin',async()=>{
  for (const locale of locales) {
    const home=await readRoute('/'+locale);
    const homeCanonical=new URL(home.match(/rel="canonical" href="([^"]+)"/)[1]);
    for (const kind of kinds) {
      const html=await readRoute(`/${locale}/wiki/${kind}`);
      const url=new URL(html.match(/rel="canonical" href="([^"]+)"/)[1]);
      assert.equal(url.origin,homeCanonical.origin);
      assert.equal(url.pathname,`/${locale}/wiki/${kind}`);
      assert.match(html,/aria-current="page"/);
    }
  }
});
test('every internal exported navigation destination and asset exists',async()=>{
  for (const locale of locales) {
    for (const route of ['/'+locale,...kinds.map(kind=>`/${locale}/wiki/${kind}`),`/${locale}/wiki`,`/${locale}/auth/action`]) {
      const html=await readRoute(route);
      const raw=await readFile(`out${route}.html`,'utf8');
      const destinations=[...html.matchAll(/href="(\/[^"?]*)[^"]*"/g),...raw.matchAll(/src="(\/[^"?]*)[^"]*"/g)];
      for (const match of destinations) {
        const target=match[1].split('#')[0];
        if (!target) continue;
        const path=target==='/'?'out/index.html':'out'+target;
        const candidates=[path,path+'.html',path+'/index.html'];
        assert.ok((await Promise.all(candidates.map(file=>access(file).then(()=>true,()=>false)))).some(Boolean),route+' -> '+target);
      }
    }
  }
});

test('legal pages prerender localized titles, language attributes, and loading assets',async()=>{
  const manifest=JSON.parse(await readFile('out/content/legal/manifest.json','utf8'));
  for (const locale of locales) {
    for (const kind of kinds) {
      const entry=manifest.locales[locale].documents[kind];
      const html=await readRoute(`/${locale}/wiki/${kind}`);
      const title=entry.metadata.title.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#x27;');
      assert.ok(html.includes(title),`${locale}/${kind} title`);
      assert.match(html,new RegExp(`<h1 lang="${locale}"`));
      assert.ok(html.includes(`${entry.loadingPath}?v=${entry.loadingSha256}`),`${locale}/${kind} loading prefetch`);
      assert.ok(!html.includes('Офіційний текст документа доступний англійською.'));
    }
  }
});

test('social previews never reference localhost and exist on landing pages', async () => {
  for (const path of ['out/index.html','out/auth/action.html','out/404.html',...locales.map(locale=>`out/${locale}.html`)]) {
    const html = await readFile(path,'utf8');
    const images = [...html.matchAll(/<meta (?:property="og:image"|name="twitter:image") content="([^"]+)"/g)];
    assert.equal(images.length,2,path);
    for (const [,url] of images) assert.ok(!new URL(url).hostname.includes('localhost'),path+' '+url);
  }
});
