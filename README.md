# PlanIt Website

Next.js website for PlanIt, including the hosted legal pages.

## Local Development

```powershell
npm run dev
```

Open `http://localhost:3000/uk`.

## Firebase Hosting

Firebase deploys the static Next.js export from `out` to the existing `planit-hub` Hosting site through the `legal` target.

## Runtime Legal Documents

The `/[locale]/wiki` pages are statically exported shells that fetch legal document content in the browser from:

```text
public/content/legal/*.mdx
```

The TypeScript legal registry contains only document order, runtime asset paths, and stable fallback metadata for prerendered SEO. Crawlers will only see metadata from those constants until the website is rebuilt, but browser users get the hosted `.mdx` content at runtime.

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
