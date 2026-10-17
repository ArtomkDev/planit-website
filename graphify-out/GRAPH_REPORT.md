# Graph Report - planit-website  (2026-10-18)

## Corpus Check
- 130 files · ~95,345 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 893 nodes · 1457 edges · 77 communities (42 shown, 8 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 39 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `182ed67e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dependencies
- metadata
- LegalDocumentRoute.tsx
- package.json
- next-intl
- react
- framer-motion
- compilerOptions
- Знахідки за пріоритетом
- PixelDisplay.tsx
- AuthActionClient.tsx
- Asciify.tsx
- components.json
- scripts
- site.ts
- devDependencies
- FloatingSchedule.tsx
- firebase.ts
- createLiquid
- FlameWrap.tsx
- serve-static-export.mjs
- LessonCardAccent.tsx
- HomepagePixelClusters.tsx
- OpenGraphImage.tsx
- update-legal-manifest.mjs
- Graphify Setup
- [locale]/page.tsx
- apple-icon.tsx
- This is NOT the Next.js you know
- icon.tsx
- eslint.config.mjs
- postcss.config.mjs
- Q: ПОКРАЩИ Hero.tsx ЩОБ ВЕСЬ КОНТЕНТ ПІДХОДИВ ПІД НОВИЙ ФОН У ВИГЛЯДІ МАТРИЦІ ПІКСЕЛІВ, ДАТА БУЛА АКТУАЛЬНОЮ, А ЗВЕРХУ ПРАВОРУЧ БУВ ІНТЕРАКТИВНИЙ ДЗВІНОЧОК
- Q: ти видалив блок показу перерви а він має показуватися після поточної або наступної пари якщо зараз не пара як в програмі
- Q: з заннятя не влазить
- Q: як задеплоїти зміни нна хостиг?
- request.ts
- Q: Додати Canvas UI Asciify у footer PlanIt та Flame Wrap для головної Android-картки по центру між Web і iOS
- Q: почени баг: при завантаженні спочатку біла тема, а потім темна
- Q: Redesign Hero content and reproduce PlanIt schedule prototype with automatic relevant-day selection
- navigation.test.mjs
- sync-legal-documents.mjs
- LegalDocumentClient.tsx
- Q: Який шрифт використано для PLANIT у самому низу сторінки, у футері?
- Hero.tsx
- [locale]/layout.tsx
- typescript
- ScheduleSettingsDemo
- TasksDemo
- LessonEditorDemo

## God Nodes (most connected - your core abstractions)
1. `react` - 35 edges
2. `scripts` - 25 edges
3. `next-intl` - 24 edges
4. `framer-motion` - 22 edges
5. `@phosphor-icons/react` - 21 edges
6. `initializeAsciify()` - 21 edges
7. `createLiquid()` - 21 edges
8. `Знахідки за пріоритетом` - 17 edges
9. `AuthActionClient()` - 16 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `generateMetadata()` --calls--> `getLegalDocumentMetadata()`  [EXTRACTED]
  src/app/[locale]/wiki/cookies/page.tsx → src/components/legal/LegalDocumentRoute.tsx
- `generateMetadata()` --calls--> `getLegalDocumentMetadata()`  [EXTRACTED]
  src/app/[locale]/wiki/delete/page.tsx → src/components/legal/LegalDocumentRoute.tsx
- `generateMetadata()` --calls--> `getLegalDocumentMetadata()`  [EXTRACTED]
  src/app/[locale]/wiki/licenses/page.tsx → src/components/legal/LegalDocumentRoute.tsx
- `generateMetadata()` --calls--> `getLegalDocumentData()`  [EXTRACTED]
  src/app/[locale]/wiki/page.tsx → src/content/legal-documents.ts
- `generateMetadata()` --calls--> `getLegalDocumentMetadata()`  [EXTRACTED]
  src/app/[locale]/wiki/privacy/page.tsx → src/components/legal/LegalDocumentRoute.tsx

## Import Cycles
- None detected.

## Communities (77 total, 8 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, clsx, firebase, framer-motion, next, next-intl, @phosphor-icons/react, react (+5 more)

### Community 1 - "metadata"
Cohesion: 0.06
Nodes (56): loadingPath, loadingSha256, metadata, path, sha256, title, version, loadingPath (+48 more)

### Community 2 - "LegalDocumentRoute.tsx"
Cohesion: 0.19
Nodes (8): generateMetadata(), generateMetadata(), generateMetadata(), generateMetadata(), generateMetadata(), getLegalDocumentMetadata(), LegalDocumentRoute(), LocaleParams

### Community 3 - "package.json"
Cohesion: 0.08
Nodes (23): name, private, version, clsx, eslint, eslint-config-next, firebase, firebase-tools (+15 more)

### Community 4 - "next-intl"
Cohesion: 0.16
Nodes (20): next-intl, @phosphor-icons/react, AppearanceDemo(), initialAppearance, subjectIcons, ChoiceList(), DemoFrame(), DemoRenderProps (+12 more)

### Community 5 - "react"
Cohesion: 0.38
Nodes (4): react, TemplateProps, PageTransition(), PageTransitionProps

### Community 6 - "framer-motion"
Cohesion: 0.34
Nodes (9): framer-motion, ScrollReveal(), ScrollRevealProps, BentoCard(), BentoCardProps, ProximityBlock(), ProximityBlockProps, fadeInUp (+1 more)

### Community 7 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 8 - "Знахідки за пріоритетом"
Cohesion: 0.05
Nodes (41): P1 — Mobile header втрачав частину destinations, P1 — Аналітика могла ігнорувати останній вибір і scope документів, P2 — Cookie banner стискав текст і не дозволяв повернутися до вибору, P2 — Fixed legal sidebar перекривав footer, P2 — Header disclosure не мав повної клавіатурної поведінки, P2 — Hero обрізався на маленькому телефоні, P2 — Mobile editor мав нестійке sticky-позиціонування, P2 — Root dead end, різні origins та некоректні social assets (+33 more)

### Community 9 - "PixelDisplay.tsx"
Cohesion: 0.13
Nodes (22): clamp(), createCanvasPixelRenderer(), createFigureSeed(), createShader(), createWebglPixelRenderer(), DISPLAY_COLORS, edgeCellNoise(), ENERGY_LOOKUP (+14 more)

### Community 10 - "AuthActionClient.tsx"
Cohesion: 0.09
Nodes (23): AuthActionPageProps, AuthActionClient(), handlePasswordSubmit(), ErrorInfo, ErrorMessageKey, FIXED_SAFE_ORIGINS, FormErrorKey, getConfiguredAppUrl() (+15 more)

### Community 11 - "Asciify.tsx"
Cohesion: 0.07
Nodes (41): Asciify(), AsciifyCharset, AsciifyElements, AsciifyInstance, AsciifyOptions, AsciifyProps, CHARSETS, createAsciify() (+33 more)

### Community 12 - "components.json"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 13 - "scripts"
Cohesion: 0.08
Nodes (25): scripts, build, build:firebase, deploy:firebase, deploy:firebase:preview, deploy:firebase:skip-build, dev, firebase:login (+17 more)

### Community 14 - "site.ts"
Cohesion: 0.08
Nodes (15): nextConfig, withNextIntl, next, metadata, metadata, metadata, metadata, metadata (+7 more)

### Community 15 - "devDependencies"
Cohesion: 0.12
Nodes (17): devDependencies, eslint, eslint-config-next, firebase-tools, tailwindcss, @tailwindcss/postcss, @types/caseless, @types/jsonwebtoken (+9 more)

### Community 16 - "FloatingSchedule.tsx"
Cohesion: 0.11
Nodes (28): createSchedule(), createSeededRandom(), DaySchedule, DaySelection, findAutomaticSelection(), FloatingSchedule(), GeneratedLesson, getDateFromKey() (+20 more)

### Community 17 - "firebase.ts"
Cohesion: 0.09
Nodes (30): CookieConsent(), storageChanged(), readConsent(), subscribe(), analyticsOnlyConsent, ConsentChoice, createConsentGate(), deniedConsent (+22 more)

### Community 18 - "createLiquid"
Cohesion: 0.10
Nodes (31): createLiquid(), applySplat(), bindTexture(), blit(), compile(), createDoubleTarget(), createProgram(), createTarget() (+23 more)

### Community 19 - "FlameWrap.tsx"
Cohesion: 0.15
Nodes (16): createFlameWrap(), frame(), onMotionChange(), render(), start(), uploadContent(), DEFAULTS, ElementImageContext (+8 more)

### Community 20 - "serve-static-export.mjs"
Cohesion: 0.31
Nodes (9): isFile(), isInsideRoot(), mimeTypes, port, resolveFile(), rootDir, safeJoin(), sendFile() (+1 more)

### Community 21 - "LessonCardAccent.tsx"
Cohesion: 0.19
Nodes (12): BreakCard(), BreakCardProps, InfiniteRibbon(), InfiniteRibbonItem, InfiniteRibbonProps, AccentDepth, createSeededRandom(), LessonCardAccent() (+4 more)

### Community 22 - "HomepagePixelClusters.tsx"
Cohesion: 0.22
Nodes (12): CLUSTERS, ClusterSpec, createRandomizedPatternLayout(), DEFAULT_PATTERN_LAYOUT, getPixelSequencePhase(), HomepagePixelClusters(), isPatternLayout(), PIXEL_PATTERNS (+4 more)

### Community 23 - "OpenGraphImage.tsx"
Cohesion: 0.23
Nodes (9): dynamic, GET(), dynamic, GET(), alt, contentType, dynamic, OpenGraphImage() (+1 more)

### Community 24 - "update-legal-manifest.mjs"
Cohesion: 0.40
Nodes (3): documents, legalDirectory, manifest

### Community 25 - "Graphify Setup"
Cohesion: 0.29
Nodes (6): Build the Project Graph, Codex Integration, Graphify Setup, Install the CLI, Query the Graph, Team Notes

### Community 26 - "[locale]/page.tsx"
Cohesion: 0.20
Nodes (8): FeatureShowcase(), AppShowcase(), CallToAction(), shapeOneOuterVariants, shapeTwoOuterVariants, Hero(), Platforms(), APP_URL

### Community 27 - "apple-icon.tsx"
Cohesion: 0.40
Nodes (3): contentType, dynamic, size

### Community 28 - "This is NOT the Next.js you know"
Cohesion: 0.40
Nodes (4): Graphify, graphify, This is NOT the Next.js you know, UI, navigation, and interaction changes

### Community 29 - "icon.tsx"
Cohesion: 0.40
Nodes (3): contentType, dynamic, size

### Community 35 - "Q: ПОКРАЩИ Hero.tsx ЩОБ ВЕСЬ КОНТЕНТ ПІДХОДИВ ПІД НОВИЙ ФОН У ВИГЛЯДІ МАТРИЦІ ПІКСЕЛІВ, ДАТА БУЛА АКТУАЛЬНОЮ, А ЗВЕРХУ ПРАВОРУЧ БУВ ІНТЕРАКТИВНИЙ ДЗВІНОЧОК"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: ПОКРАЩИ Hero.tsx ЩОБ ВЕСЬ КОНТЕНТ ПІДХОДИВ ПІД НОВИЙ ФОН У ВИГЛЯДІ МАТРИЦІ ПІКСЕЛІВ, ДАТА БУЛА АКТУАЛЬНОЮ, А ЗВЕРХУ ПРАВОРУЧ БУВ ІНТЕРАКТИВНИЙ ДЗВІНОЧОК, Source Nodes

### Community 36 - "Q: ти видалив блок показу перерви а він має показуватися після поточної або наступної пари якщо зараз не пара як в програмі"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: ти видалив блок показу перерви а він має показуватися після поточної або наступної пари якщо зараз не пара як в програмі, Source Nodes

### Community 37 - "Q: з заннятя не влазить"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: з заннятя не влазить, Source Nodes

### Community 38 - "Q: як задеплоїти зміни нна хостиг?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: як задеплоїти зміни нна хостиг?, Source Nodes

### Community 42 - "Q: Додати Canvas UI Asciify у footer PlanIt та Flame Wrap для головної Android-картки по центру між Web і iOS"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Додати Canvas UI Asciify у footer PlanIt та Flame Wrap для головної Android-картки по центру між Web і iOS, Source Nodes

### Community 43 - "Q: почени баг: при завантаженні спочатку біла тема, а потім темна"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: почени баг: при завантаженні спочатку біла тема, а потім темна, Source Nodes

### Community 44 - "Q: Redesign Hero content and reproduce PlanIt schedule prototype with automatic relevant-day selection"
Cohesion: 0.50
Nodes (3): Answer, Q: Redesign Hero content and reproduce PlanIt schedule prototype with automatic relevant-day selection, Source Nodes

### Community 46 - "sync-legal-documents.mjs"
Cohesion: 0.25
Nodes (6): args, documents, outputDirectory, sourceDirectory, sourceRoot, websiteRoot

### Community 59 - "LegalDocumentClient.tsx"
Cohesion: 0.05
Nodes (79): generateMetadata(), getInitialLoadingHtml(), LegalDocument(), LegalDocumentProps, legalManifest, publicDirectory, resolvePublicAssetPath(), allowedClasses (+71 more)

### Community 60 - "Q: Який шрифт використано для PLANIT у самому низу сторінки, у футері?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Який шрифт використано для PLANIT у самому низу сторінки, у футері?, Source Nodes

### Community 61 - "Hero.tsx"
Cohesion: 0.36
Nodes (5): Footer(), AndroidRobotLogo(), AppleBrandLogo(), BrandIconProps, PLAY_MARKET_URL

### Community 62 - "[locale]/layout.tsx"
Cohesion: 0.06
Nodes (32): @react-three/fiber, three, copy, getClientLocale(), getServerLocale(), GlobalNotFoundClient(), Locale, NotFoundContent() (+24 more)

## Knowledge Gaps
- **361 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+356 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 473 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `package.json`, `next-intl`, `framer-motion`, `PixelDisplay.tsx`, `AuthActionClient.tsx`, `Asciify.tsx`, `site.ts`, `FloatingSchedule.tsx`, `firebase.ts`, `createLiquid`, `FlameWrap.tsx`, `LessonCardAccent.tsx`, `HomepagePixelClusters.tsx`, `[locale]/page.tsx`, `LegalDocumentClient.tsx`, `Hero.tsx`, `[locale]/layout.tsx`?**
  _High betweenness centrality (0.265) - this node is a cross-community bridge._
- **Why does `next-intl` connect `next-intl` to `package.json`, `framer-motion`, `AuthActionClient.tsx`, `FloatingSchedule.tsx`, `firebase.ts`, `LessonCardAccent.tsx`, `[locale]/page.tsx`, `LegalDocumentClient.tsx`, `Hero.tsx`, `[locale]/layout.tsx`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _361 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `metadata` be split into smaller, more focused modules?**
  _Cohesion score 0.06390977443609022 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `Знахідки за пріоритетом` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._