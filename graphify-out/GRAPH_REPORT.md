# Graph Report - .  (2026-08-01)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 427 nodes · 619 edges · 29 communities (21 shown, 8 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `61d1fc88`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 26

## God Nodes (most connected - your core abstractions)
1. `scripts` - 19 edges
2. `compilerOptions` - 16 edges
3. `cn()` - 14 edges
4. `getLegalDocumentMetadata()` - 11 edges
5. `LessonCardAccent()` - 9 edges
6. `LegalDocumentKind` - 8 edges
7. `privacy` - 7 edges
8. `cookies` - 7 edges
9. `terms` - 7 edges
10. `licenses` - 7 edges

## Surprising Connections (you probably didn't know these)
- `generateMetadata()` --calls--> `getLegalDocumentMetadata()`  [EXTRACTED]
  src/app/[locale]/wiki/cookies/page.tsx → src/components/legal/LegalDocumentRoute.tsx
- `generateMetadata()` --calls--> `getLegalDocumentMetadata()`  [EXTRACTED]
  src/app/[locale]/wiki/delete/page.tsx → src/components/legal/LegalDocumentRoute.tsx
- `generateMetadata()` --calls--> `getLegalDocumentMetadata()`  [EXTRACTED]
  src/app/[locale]/wiki/licenses/page.tsx → src/components/legal/LegalDocumentRoute.tsx
- `generateMetadata()` --calls--> `getLegalDocumentMetadata()`  [EXTRACTED]
  src/app/[locale]/wiki/privacy/page.tsx → src/components/legal/LegalDocumentRoute.tsx
- `generateMetadata()` --calls--> `getLegalDocumentMetadata()`  [EXTRACTED]
  src/app/[locale]/wiki/terms/page.tsx → src/components/legal/LegalDocumentRoute.tsx

## Import Cycles
- None detected.

## Communities (29 total, 8 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (58): LegalDocumentProps, allowedClasses, allowedTags, buildVersionedAssetUrl(), CachedLegalLoadingDocument, ensureFreshLegalLoadingDocument(), escapeHtml(), extractMetadataBlock() (+50 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (28): copy, getClientLocale(), getServerLocale(), GlobalNotFoundClient(), Locale, subscribeToLocale(), metadata, locales (+20 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (27): ScrollReveal(), ScrollRevealProps, AppShowcase(), BentoCard(), BentoCardProps, ProximityBlock(), ProximityBlockProps, BreakCard() (+19 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (37): loadingPath, loadingSha256, path, sha256, title, version, loadingPath, loadingSha256 (+29 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (33): eslint, eslint-config-next, firebase-tools, devDependencies, eslint, eslint-config-next, firebase-tools, tailwindcss (+25 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (25): CookieConsent(), getClientSnapshot(), getServerSnapshot(), isCookieConsentChoice(), readStoredConsent(), shapeOneOuterVariants, shapeTwoOuterVariants, StoredCookieConsent (+17 more)

### Community 7 - "Community 7"
Cohesion: 0.08
Nodes (25): clsx, firebase, framer-motion, next, next-intl, dependencies, clsx, firebase (+17 more)

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (10): generateMetadata(), generateMetadata(), generateMetadata(), generateMetadata(), generateMetadata(), getInitialLoadingHtml(), LegalDocument(), getLegalDocumentMetadata() (+2 more)

### Community 9 - "Community 9"
Cohesion: 0.09
Nodes (22): name, private, scripts, build, build:firebase, deploy:firebase, deploy:firebase:preview, deploy:firebase:skip-build (+14 more)

### Community 10 - "Community 10"
Cohesion: 0.13
Nodes (19): DaySchedule, FloatingSchedule(), GeneratedLesson, timeSlots, weekDates, weekKeys, createSeededRandom(), Hero() (+11 more)

### Community 11 - "Community 11"
Cohesion: 0.27
Nodes (8): isFile(), isInsideRoot(), mimeTypes, port, resolveFile(), rootDir, safeJoin(), server

### Community 12 - "Community 12"
Cohesion: 0.40
Nodes (3): TemplateProps, PageTransition(), PageTransitionProps

### Community 13 - "Community 13"
Cohesion: 0.40
Nodes (3): documents, legalDirectory, manifest

## Knowledge Gaps
- **171 isolated node(s):** `eslintConfig`, `withNextIntl`, `nextConfig`, `name`, `version` (+166 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 2` to `Community 1`, `Community 10`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Community 4` to `Community 9`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 7` to `Community 9`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `withNextIntl`, `nextConfig` to the rest of the system?**
  _171 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06586538461538462 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06976744186046512 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11033681765389082 - nodes in this community are weakly interconnected._