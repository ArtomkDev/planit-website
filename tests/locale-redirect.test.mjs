import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = await readFile('src/lib/locale-redirect.ts', 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { localeRedirectScript } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

function redirect({ saved = null, cookie = '', languages = ['uk-UA'], language = 'uk-UA', storageBlocked = false, cookiesBlocked = false, search = '', hash = '' } = {}) {
  const destinations = [];
  runInNewContext(localeRedirectScript, {
    window: {
      localStorage: { getItem(key) {
        assert.equal(key, 'planit:locale');
        if (storageBlocked) throw new Error('Storage blocked');
        return saved;
      } },
      location: { search, hash, replace: url => destinations.push(url) },
    },
    document: { get cookie() {
      if (cookiesBlocked) throw new Error('Cookies blocked');
      return cookie;
    } },
    navigator: { languages, language },
  });
  assert.equal(destinations.length, 1, 'replace the entry history item exactly once');
  return destinations[0];
}

test('entry respects the saved locale before browser language or cookie', () => {
  assert.equal(redirect({ saved: 'en', cookie: 'NEXT_LOCALE=uk', languages: ['uk-UA'] }), '/en');
  assert.equal(redirect({ saved: 'uk', cookie: 'NEXT_LOCALE=en', languages: ['en-US'] }), '/uk');
});

test('entry uses the locale cookie when storage is unavailable or invalid', () => {
  assert.equal(redirect({ storageBlocked: true, cookie: 'theme=dark; NEXT_LOCALE=en; other=value' }), '/en');
  assert.equal(redirect({ saved: 'de', cookie: 'NEXT_LOCALE=en' }), '/en');
});

test('entry matches supported regional browser languages in preference order', () => {
  assert.equal(redirect({ languages: ['en-GB', 'uk-UA'] }), '/en');
  assert.equal(redirect({ languages: ['uk-UA', 'en-US'] }), '/uk');
  assert.equal(redirect({ languages: ['de-DE', 'EN-us', 'uk'] }), '/en');
  assert.equal(redirect({ languages: [], language: 'en-AU' }), '/en');
  assert.equal(redirect({ languages: null, language: 'en' }), '/en');
});

test('entry falls back safely with unsupported preferences or blocked browser storage', () => {
  assert.equal(redirect({ saved: '//example.com', cookie: 'NEXT_LOCALE=en-US', languages: ['de-DE'] }), '/uk');
  assert.equal(redirect({ cookie: 'OTHER_NEXT_LOCALE=en', languages: ['fr'] }), '/uk');
  assert.equal(redirect({ storageBlocked: true, cookiesBlocked: true, languages: ['en-US'] }), '/en');
  assert.equal(redirect({ languages: [], language: '' }), '/uk');
});

test('entry preserves the exact query and fragment on the localized homepage', () => {
  assert.equal(redirect({ languages: ['en-US'], search: '?source=shared&value=%D0%BC&x=a+b', hash: '#feature-appearance' }), '/en?source=shared&value=%D0%BC&x=a+b#feature-appearance');
});
