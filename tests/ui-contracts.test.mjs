import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import ts from 'typescript';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

async function loadModule(path) {
  const source = await readFile(path, 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop:true } });
  const compiledModule = {exports:{}};
  new Function('exports','require','module','process',outputText)(compiledModule.exports,createRequire(resolve(path)),compiledModule,process);
  return compiledModule.exports;
}
const { buildLocaleUrl, resolveSiteUrl } = await loadModule('src/lib/site.ts');
const { createMarketingEvent, dispatchMarketingEvent } = await loadModule('src/lib/marketing-events.ts');
const { getReadableCardStyle, contrastRatio } = await loadModule('src/lib/card-contrast.ts');
const { createConsentGate, analyticsOnlyConsent, deniedConsent, isAnalyticsPage } = await loadModule('src/lib/analytics-consent.ts');
const { parseCookiePreference } = await loadModule('src/lib/cookie-preferences.ts');

test('website identity uses a reachable hosting default and rejects ambiguous configured origins', () => {
  assert.equal(resolveSiteUrl(), 'https://planit-hub.web.app');
  assert.equal(resolveSiteUrl(' https://example.com/ '), 'https://example.com');
  for (const invalid of ['http://example.com', 'https://example.com/app', 'https://example.com?locale=uk', 'https://example.com#top', 'https://user:secret@example.com']) assert.throws(() => resolveSiteUrl(invalid));
});

test('marketing events only accept known categories and never accept user content or URLs', () => {
  assert.deepEqual(createMarketingEvent('cta_click', {platform:'web', placement:'top'}), {name:'cta_click', parameters:{platform:'web', placement:'top'}});
  assert.ok(createMarketingEvent('demo_interaction', {feature:'tasks'}));
  assert.ok(createMarketingEvent('faq_open', {question:'price'}));
  for (const [name, parameters] of [['cta_click',{platform:'web',placement:'top',email:'private@example.test'}],['demo_interaction',{feature:'My private class'}],['faq_open',{question:'https://example.test/token'}],['constructor',{}],['unknown',{}]]) assert.equal(createMarketingEvent(name,parameters),null);
});

test('marketing dispatch checks consent before connecting and again after async initialization', async () => {
  const event=createMarketingEvent('cta_click',{platform:'android',placement:'platforms'});
  let allowed=false, connections=0, sent=0;
  const connection={isAllowed:()=>allowed, connect:async()=>{connections++;return {};},send:()=>{sent++;}};
  assert.equal(await dispatchMarketingEvent(event,connection),false);
  assert.equal(connections,0);
  allowed=true;
  assert.equal(await dispatchMarketingEvent(event,{...connection,connect:async()=>{allowed=false;return {};}}),false);
  assert.equal(sent,0);
  allowed=true;
  assert.equal(await dispatchMarketingEvent(event,connection),true);
  assert.equal(sent,1);
  assert.equal(await dispatchMarketingEvent({...event,parameters:{...event.parameters,content:'private'}},connection),false);
  assert.equal(sent,1);
});

test('cookie preferences renew after twelve months and reject invalid stored values', () => {
  const now = Date.parse('2026-10-13T12:00:00Z');
  const value = updatedAt => JSON.stringify({choice:'accepted', updatedAt});
  assert.equal(parseCookiePreference(value('2026-10-12T12:00:00Z'), now), 'accepted');
  assert.equal(parseCookiePreference(value('2025-10-12T12:00:00Z'), now), null);
  for (const invalid of ['accepted', '{}', '{', value('invalid'), value('2026-10-14T12:00:00Z')]) assert.equal(parseCookiePreference(invalid, now), null);
});

test('locale switch preserves feature anchors and ordinary query values', () => {
  assert.equal(buildLocaleUrl('/uk', '?source=footer', '#feature-appearance', 'en'), '/en?source=footer#feature-appearance');
  assert.equal(buildLocaleUrl('/uk/wiki/privacy', '', '#rights', 'en'), '/en/wiki/privacy#rights');
});
test('locale switch retains action code and updates nested continuation language', () => {
  const result = new URL(buildLocaleUrl('/uk/auth/action', '?mode=resetPassword&oobCode=test-code&continueUrl=https%3A%2F%2Fplanit-demo.web.app%2F%3Flang%3Duk', '', 'en'), 'https://example.test');
  assert.equal(result.pathname, '/en/auth/action');
  assert.equal(result.searchParams.get('oobCode'), 'test-code');
  assert.equal(result.searchParams.get('lang'), 'en');
  assert.equal(new URL(result.searchParams.get('continueUrl')).searchParams.get('lang'), 'en');
});
test('malformed continuation is preserved for the action validator', () => {
  const result = new URL(buildLocaleUrl('/uk/auth/action', '?continueUrl=invalid', '', 'en'), 'https://example.test');
  assert.equal(result.searchParams.get('continueUrl'), 'invalid');
});
test('pending analytics bootstrap cannot grant consent after rejection', async () => {
  const gate = createConsentGate();
  assert.equal(gate.canGrant(), false);
  gate.update('accepted');
  const delayedBootstrap = Promise.resolve().then(() => gate.canGrant());
  gate.update('rejected');
  assert.equal(await delayedBootstrap, false);
  gate.update('accepted');
  assert.equal(gate.canGrant(), true);
});
test('analytics consent never grants advertising permissions', () => {
  assert.equal(analyticsOnlyConsent.analytics_storage, 'granted');
  for (const key of ['ad_storage','ad_user_data','ad_personalization']) assert.equal(analyticsOnlyConsent[key], 'denied');
  assert.equal(deniedConsent.analytics_storage, 'denied');
});

test('analytics is restricted to marketing homepages, excluding legal and account pages', () => {
  for (const route of ['/uk','/en','/uk/']) assert.equal(isAnalyticsPage(route),true);
  for (const route of ['/','/uk/wiki','/en/wiki/privacy','/uk/auth/action','/auth/action','/uk/missing']) assert.equal(isAnalyticsPage(route),false);
});
test('card text remains readable across bright, dark, and mixed gradients', () => {
  const pairs = [['#4facfe','#00f2fe'],['#000000','#ffffff'],['#ec4899','#f97316'],['#3B82F6','#3B82F6'],['#111827','#111827']];
  const rgb = color => [1,3,5].map(offset => parseInt(color.slice(offset,offset+2),16));
  for (const colors of pairs) {
    const {textColor,scrimOpacity} = getReadableCardStyle(colors);
    const start = rgb(colors[0]), end = rgb(colors[1]);
    for (let index=0; index<=100; index++) {
      const background = '#'+start.map((value,component)=>Math.round((value+(end[component]-value)*index/100)*(1-scrimOpacity)).toString(16).padStart(2,'0')).join('');
      assert.ok(contrastRatio(textColor,background)>=4.5, `${colors} at ${index}%`);
    }
  }
  assert.equal(getReadableCardStyle(['hsl(180 100% 75%)','hsl(200 100% 80%)']).textColor, '#111827');
});
test('legal manifest matches all served documents and placeholders', async () => {
  const manifest=JSON.parse(await readFile('public/content/legal/manifest.json','utf8'));
  for (const [locale,localized] of Object.entries(manifest.locales)) {
    assert.equal(Object.keys(localized.documents).length,5,locale);
    for (const [slug,entry] of Object.entries(localized.documents)) {
      for (const [pathKey,hashKey] of [['path','sha256'],['loadingPath','loadingSha256']]) {
        const content=await readFile('public'+entry[pathKey]);
        assert.equal(createHash('sha256').update(content).digest('hex'),entry[hashKey],slug+' '+pathKey);
      }
    }
  }
  assert.deepEqual(manifest.documents,manifest.locales.en.documents);
  assert.equal(manifest.version,createHash('sha256').update(JSON.stringify(manifest.locales)).digest('hex').slice(0,16));
});
test('Ukrainian legal translations match their English source revisions', async () => {
  const manifest=JSON.parse(await readFile('public/content/legal/manifest.json','utf8'));
  for (const [slug,entry] of Object.entries(manifest.locales.uk.documents)) {
    const source=await readFile('public'+manifest.locales.en.documents[slug].path,'utf8');
    assert.equal(entry.metadata.translationSourceHash,createHash('sha256').update(source.replace(/\r\n/g,'\n')).digest('hex'),slug);
    assert.equal(entry.metadata.slug,slug);
    assert.equal(entry.path,`/content/legal/uk/${slug}.mdx`);
  }
});
test('translations expose the same message keys in both languages', async () => {
  const keys=(value,prefix='')=>Object.entries(value).flatMap(([key,item])=>item && typeof item==='object' && !Array.isArray(item) ? keys(item,prefix+key+'.') : [prefix+key]).sort();
  const en=JSON.parse(await readFile('src/i18n/locales/en.json','utf8'));
  const uk=JSON.parse(await readFile('src/i18n/locales/uk.json','utf8'));
  assert.deepEqual(keys(uk),keys(en));
});

test('secondary and feedback text tokens meet contrast requirements in both themes', async () => {
  const css=await readFile('src/app/globals.css','utf8');
  for (const block of [css.match(/:root\s*\{([\s\S]*?)\}/)[1],css.match(/\.dark\s*\{([\s\S]*?)\}/)[1]]) {
    const tokens=Object.fromEntries([...block.matchAll(/(--[\w-]+):\s*(#[\da-f]{6})/gi)].map(match=>[match[1],match[2]]));
    for (const role of ['--site-muted','--site-soft','--site-success','--site-error','--brand-strong']) {
      for (const background of ['--site-bg','--site-surface']) assert.ok(contrastRatio(tokens[role],tokens[background])>=4.5,role+' on '+background);
    }
  }
});
