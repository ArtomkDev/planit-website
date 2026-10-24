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
  assert.match(html, /<h1[^>]*>PlanIt/);
  assert.match(html, /href="\/uk"/);
  assert.match(html, /href="\/en"/);
  assert.doesNotMatch(head, /name="robots" content="[^"]*noindex/);
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

test('both locales expose native FAQ answers and truthful application metadata in initial HTML', async () => {
  for (const locale of locales) {
    const raw=await readFile(`out/${locale}.html`,'utf8');
    const html=await readRoute('/'+locale);
    const canonical=new URL(html.match(/rel="canonical" href="([^"]+)"/)[1]);
    const json=raw.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
    assert.ok(json,locale+' application metadata');
    const application=JSON.parse(json);
    assert.equal(application['@type'],'SoftwareApplication');
    assert.equal(application.url,canonical.href);
    assert.equal(application.offers.price,0);
    assert.ok(!application.aggregateRating && !application.review,'ratings must not be fabricated');
    const faq=html.match(/<section id="faq"[\s\S]*?<\/section>/)?.[0];
    assert.ok(faq,locale+' FAQ');
    assert.equal([...faq.matchAll(/<details\b/g)].length,10);
    for (const match of faq.matchAll(/<details\b[\s\S]*?<\/details>/g)) {
      assert.match(match[0],/<summary\b[\s\S]*?<\/summary>/);
      assert.match(match[0],/<p\b[^>]*>[^<]+<\/p>/);
    }
    assert.doesNotMatch(raw,/<link[^>]+href="\/content\/legal\/[^\"]*loading\.mdx/,'home must not prefetch all legal placeholders');
  }
});

test('sitemap includes every language version and legal dates are stable source dates', async () => {
  const xml=await readFile('out/sitemap.xml','utf8');
  const manifest=JSON.parse(await readFile('out/content/legal/manifest.json','utf8'));
  const entries=[...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(match=>match[1]);
  const inventory=JSON.parse(await readFile('out/seo-manifest.json','utf8'));
  assert.equal(entries.length,inventory.pages.length);
  for(const locale of locales){
    for(const route of ['',...kinds.map(kind=>`/wiki/${kind}`)]){
      const entry=entries.find(value=>new URL(value.match(/<loc>([^<]+)<\/loc>/)[1]).pathname===`/${locale}${route}`);
      assert.ok(entry,locale+route);
      for(const language of locales)assert.match(entry,new RegExp(`hreflang="${language}" href="[^\"]+/${language}${route}"`));
      if(route){
        const kind=route.split('/').at(-1);
        assert.ok(entry.includes(`<lastmod>${manifest.locales[locale].documents[kind].metadata.effectiveDate}`));
      }else assert.doesNotMatch(entry,/<lastmod>/,'home date must not be fabricated at build time');
    }
  }
});

test('brand identity, locale discovery and crawler signals agree on one indexable website', async () => {
  const root=await readFile('out/index.html','utf8');
  const origin=new URL(root.match(/rel="canonical" href="([^"]+)"/)[1]).origin;
  for(const route of ['','uk','en']){
    const html=await readFile(`out/${route || 'index'}.html`,'utf8');
    const identities=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match=>JSON.parse(match[1]));
    const websites=identities.filter(value=>value['@type']==='WebSite');
    assert.equal(websites.length,1,route+' one website identity');
    assert.equal(websites[0].name,'PlanIt');
    assert.equal(websites[0].url,`${origin}/`);
    assert.deepEqual(websites[0].inLanguage,['uk','en']);
    assert.doesNotMatch(html, /name="robots" content="[^"]*noindex/);
    const languages=Object.fromEntries([...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/gi)].map(([,language,url])=>[language,new URL(url).href]));
    assert.equal(languages['x-default'],`${origin}/`);
    for(const locale of locales) assert.equal(languages[locale],`${origin}/${locale}`);
  }
  const robots=await readFile('out/robots.txt','utf8');
  assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
  assert.doesNotMatch(robots,/Disallow: \/(?:\r?\n|$)/);
  for(const route of ['auth/action',...locales.map(locale=>`${locale}/auth/action`)]){
    const html=await readFile(`out/${route}.html`,'utf8');
    assert.match(html,/name="robots" content="noindex, nofollow"/,'account actions must stay out of search');
  }
});
