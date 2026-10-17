# PlanIt Website

Next.js website for PlanIt, including the hosted legal pages.

## Local Development

```powershell
npm run dev
```

Open `http://localhost:3000/uk`.

Opening `/` automatically selects the saved locale (`planit:locale` or `NEXT_LOCALE`), then the first supported browser language (`uk` or `en`), with Ukrainian as the default. It preserves the query and fragment without showing a language-selection page. With JavaScript disabled, it opens `/uk`. Explicit localized URLs remain available, and the header language switch updates the saved preference.

## Local Production Preview

The project uses `output: "export"`, so `next start` is not supported. Build the static site, then serve the generated `out` directory:

```powershell
npm run build
npm start
```

Open `http://localhost:4173/uk`. `npm start` and `npm run preview:export` use the same static server. Set `PORT` or pass a port with `npm start -- 3000` to change the default. Rebuild after changing application code.

## Firebase Hosting

Firebase deploys the static Next.js export from `out` to the existing `planit-hub` Hosting site through the `legal` target.

## Runtime Legal Documents

The `/[locale]/wiki` pages are statically exported shells that fetch legal document content in the browser from:

```text
public/content/legal/*.mdx
```

English documents remain at `/content/legal/*.mdx`; Ukrainian documents are served from `/content/legal/uk/*.mdx`. The reader, title, dates, loading placeholders, language attributes and cache follow the page locale. The manifest includes hashes and metadata for both languages. Prerendered SEO uses that metadata when the site is built; the full document body is fetched in the browser.

To update legal text without rebuilding the Next site, update the hosted files under `/content/legal/` and refresh `manifest.json` for cache-busting when possible:

```powershell
npm.cmd run legal:manifest
```

The publish flow also supports generated loading placeholders next to each document:

```text
public/content/legal/*.loading.mdx
```

Those files are still MDX. They keep the document block structure but replace visible text with animated placeholder spans. The legal page renders that loading MDX first, then swaps to the full `.mdx` after it finishes loading.

The website no longer keeps a local `src/content/legal/*.mdx` mirror or compiles MDX at build time. Edit legal source in the PlanIt app repo, then publish the generated runtime assets to Firebase Hosting.

### Sync and publish both languages

The source of truth is `PlanIt/content/legal/` and `PlanIt/content/legal/uk/`. Synchronization reuses the app's translation validation and loading generator, copies both languages without rewriting the text, and refreshes the manifest. If the app's generated registry is outdated, run `npm.cmd run legal:sync` in the PlanIt repository first.

Run from any PowerShell directory to synchronize, build, and publish this website with both languages:

```powershell
npm.cmd --prefix "D:\GitHub\ArtomkDev\planit-website" run legal:publish -- -LegalSourceRoot "D:\GitHub\ArtomkDev\PlanIt"
```

This deploys the existing `legal` Hosting target (`planit-hub`); it includes the built website so the updated reader is published with the documents. Use this website command for localized publication: the current app-side `legal:publish` copies only English assets.

To prepare and verify the same output without uploading:

```powershell
npm.cmd run legal:publish -- -LegalSourceRoot "D:\GitHub\ArtomkDev\PlanIt" -SkipDeploy
```

For local synchronization alone:

```powershell
npm.cmd run legal:sync -- --source "D:\GitHub\ArtomkDev\PlanIt"
```

Run this once on your PC:

```powershell
npm run firebase:login
```

Build and deploy a preview version first:

```powershell
npm run deploy:firebase:preview
```

Build and deploy to production:

```powershell
npm run deploy:firebase
```

Useful checks before publishing:

```powershell
npm run lint
npm run build:firebase
```

If the site was already built and only the Firebase upload needs to be repeated:

```powershell
npm run deploy:firebase:skip-build
```
