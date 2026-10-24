# PlanIt Website

Next.js website for PlanIt, including the hosted legal pages.

## Update and publish

```powershell
npm.cmd run site:update
```

This is the complete release workflow: read-only legal sync, lint/tests, build, automatic sitemap and SEO checks, preserved Google verification, route continuity, website-only Firebase upload and live verification. Settings are in site.config.json. Use site:check to run it without uploading.

Create a bilingual page draft with npm.cmd run page:new -- page-slug, fill src/content/pages.json and set published to true. Metadata, sitemap and footer links are generated automatically. See [the workflow guide](docs/WEBSITE_WORKFLOW.md) for exact steps, custom pages, redirects and preview releases.

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

After updating the website legal assets, regenerate the manifest and publish a complete verified build. The reader loads document bodies at runtime, but a partial upload can leave hashes, localized metadata, and content out of sync:

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

If the site was already built and only the Firebase upload needs to be repeated, the deployment command verifies that source and exported files still match that build:

```powershell
npm run deploy:firebase:skip-build
```

## Website identity and verified releases

The default website origin is configured in site.config.json as https://planit-hub.web.app. NEXT_PUBLIC_BASE_URL can override it with a working HTTPS origin when a custom domain is connected; the build and CLI checks load the same environment. APP_URL remains a separate destination for the main application.

The root and both localized homepages publish one WebSite identity for PlanIt. The root is indexable, retains its pre-paint locale redirect and provides linked fallback content. The build discovers all indexable pages and generates their sitemap, including the root as the homepage x-default. Account action URLs remain noindex. GOOGLE_SITE_VERIFICATION can optionally supply an HTML verification tag at build time; the public Google verification file must also be preserved when file verification is used.

When multiple Firebase accounts are already signed in, select the project owner for this invocation without changing the CLI default:

~~~powershell
npm.cmd run deploy:firebase:skip-build -- -Account owner@example.com
~~~

Every successful build runs a legal-integrity and metadata check, writes a private build stamp under .next, and generates out/release.json. Deployment runs check:export and test:export before uploading, including when SkipBuild is used. A changed source tree or edited export requires a new build. Mutable document URLs and manifests revalidate rather than receiving an immutable year-long cache.

Production deployment also verifies the published release for a single configured Hosting target. For a preview URL or a separate read-only check, run:

~~~powershell
npm.cmd run check:export
npm.cmd run check:live -- https://planit-hub.web.app
~~~

check:live compares the published release with the current local export, then checks the root identity/indexability, robots sitemap reference, both languages, legal hashes, canonical URLs and PNG response types. It does not deploy. If the public website still serves an older release, the command fails explicitly.

The website records only consented CTA, demo and FAQ events. It does not track schedule creation in the separate application or send demo input values. See AUDIT.md and docs/audits/SITE_FIXES_2026-10-24.md for verification, the published release and the pending Google processing/quota limitations.
