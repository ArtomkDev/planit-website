# Graph Report - planit-website  (2026-10-18)

## Corpus Check
- 132 files · ~98,326 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 907 nodes · 1480 edges · 83 communities (49 shown, 7 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 42 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9949858b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- site.ts
- metadata
- LegalDocumentRoute.tsx
- package.json
- next-intl
- dependencies
- LessonCardAccent.tsx
- compilerOptions
- Знахідки за пріоритетом
- PixelDisplay.tsx
- AuthActionClient.tsx
- Asciify.tsx
- components.json
- scripts
- next
- devDependencies
- FloatingSchedule.tsx
- firebase.ts
- createLiquid
- FlameWrap.tsx
- serve-static-export.mjs
- typescript
- HomepagePixelClusters.tsx
- OpenGraphImage.tsx
- update-legal-manifest.mjs
- Graphify Setup
- framer-motion
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
- [locale]/page.tsx
- global-not-found-client.tsx
- ThemeProvider.tsx
- InteractiveGridPattern.tsx
- [locale]/layout.tsx
- Header
- react
- SITE_URL
- app/auth/action/page.tsx
- (entry)/layout.tsx
- ThemeToggle.tsx
- LessonEditorDemo

## God Nodes (most connected - your core abstractions)
1. `react` - 35 edges
2. `scripts` - 25 edges
3. `next-intl` - 24 edges
4. `@phosphor-icons/react` - 21 edges
5. `framer-motion` - 21 edges
6. `initializeAsciify()` - 21 edges
7. `createLiquid()` - 21 edges
8. `PixelDisplay()` - 17 edges
9. `Знахідки за пріоритетом` - 17 edges
10. `AuthActionClient()` - 16 edges

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

## Communities (83 total, 7 thin omitted)

### Community 0 - "site.ts"
Cohesion: 0.29
Nodes (8): HeaderLinkProps, HeaderProps, AndroidRobotLogo(), AppleBrandLogo(), BrandIconProps, APP_URL, PLAY_MARKET_URL, SUPPORT_URL

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
Cohesion: 0.12
Nodes (22): next-intl, @phosphor-icons/react, AppearanceDemo(), initialAppearance, subjectIcons, ChoiceList(), DemoFrame(), DemoRenderProps (+14 more)

### Community 5 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, clsx, firebase, framer-motion, next, next-intl, @phosphor-icons/react, react (+5 more)

### Community 6 - "LessonCardAccent.tsx"
Cohesion: 0.19
Nodes (12): BreakCard(), BreakCardProps, InfiniteRibbon(), InfiniteRibbonItem, InfiniteRibbonProps, AccentDepth, createSeededRandom(), LessonCardAccent() (+4 more)

### Community 7 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 8 - "Знахідки за пріоритетом"
Cohesion: 0.04
Nodes (42): P1 — Mobile header втрачав частину destinations, P1 — Аналітика могла ігнорувати останній вибір і scope документів, P2 — Cookie banner стискав текст і не дозволяв повернутися до вибору, P2 — Fixed legal sidebar перекривав footer, P2 — Header disclosure не мав повної клавіатурної поведінки, P2 — Hero обрізався на маленькому телефоні, P2 — Mobile editor мав нестійке sticky-позиціонування, P2 — Root dead end, різні origins та некоректні social assets (+34 more)

### Community 9 - "PixelDisplay.tsx"
Cohesion: 0.10
Nodes (32): clamp(), createCanvasPixelRenderer(), createFigureSeed(), createShader(), createWebglPixelRenderer(), DISPLAY_COLORS, edgeCellNoise(), ENERGY_LOOKUP (+24 more)

### Community 10 - "AuthActionClient.tsx"
Cohesion: 0.08
Nodes (24): AuthActionPageProps, AuthActionClient(), handlePasswordSubmit(), ErrorInfo, ErrorMessageKey, FIXED_SAFE_ORIGINS, FormErrorKey, getConfiguredAppUrl() (+16 more)

### Community 11 - "Asciify.tsx"
Cohesion: 0.07
Nodes (41): Asciify(), AsciifyCharset, AsciifyElements, AsciifyInstance, AsciifyOptions, AsciifyProps, CHARSETS, createAsciify() (+33 more)

### Community 12 - "components.json"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 13 - "scripts"
Cohesion: 0.08
Nodes (25): scripts, build, build:firebase, deploy:firebase, deploy:firebase:preview, deploy:firebase:skip-build, dev, firebase:login (+17 more)

### Community 14 - "next"
Cohesion: 0.20
Nodes (5): nextConfig, withNextIntl, next, dynamic, dynamic

### Community 15 - "devDependencies"
Cohesion: 0.12
Nodes (17): devDependencies, eslint, eslint-config-next, firebase-tools, tailwindcss, @tailwindcss/postcss, @types/caseless, @types/jsonwebtoken (+9 more)

### Community 16 - "FloatingSchedule.tsx"
Cohesion: 0.11
Nodes (28): createSchedule(), createSeededRandom(), DaySchedule, DaySelection, findAutomaticSelection(), FloatingSchedule(), GeneratedLesson, getDateFromKey() (+20 more)

### Community 17 - "firebase.ts"
Cohesion: 0.10
Nodes (29): CookieConsent(), storageChanged(), readConsent(), subscribe(), analyticsOnlyConsent, ConsentChoice, createConsentGate(), deniedConsent (+21 more)

### Community 18 - "createLiquid"
Cohesion: 0.10
Nodes (31): createLiquid(), applySplat(), bindTexture(), blit(), compile(), createDoubleTarget(), createProgram(), createTarget() (+23 more)

### Community 19 - "FlameWrap.tsx"
Cohesion: 0.15
Nodes (16): createFlameWrap(), frame(), onMotionChange(), render(), start(), uploadContent(), DEFAULTS, ElementImageContext (+8 more)

### Community 20 - "serve-static-export.mjs"
Cohesion: 0.31
Nodes (9): isFile(), isInsideRoot(), mimeTypes, port, resolveFile(), rootDir, safeJoin(), sendFile() (+1 more)

### Community 21 - "typescript"
Cohesion: 0.20
Nodes (3): typescript, { outputText }, { outputText }

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

### Community 26 - "framer-motion"
Cohesion: 0.29
Nodes (9): framer-motion, ScrollReveal(), ScrollRevealProps, BentoCard(), BentoCardProps, ProximityBlock(), ProximityBlockProps, fadeInUp (+1 more)

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
Nodes (81): generateMetadata(), dynamic, getInitialLoadingHtml(), LegalDocument(), LegalDocumentProps, legalManifest, publicDirectory, resolvePublicAssetPath() (+73 more)

### Community 60 - "Q: Який шрифт використано для PLANIT у самому низу сторінки, у футері?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Який шрифт використано для PLANIT у самому низу сторінки, у футері?, Source Nodes

### Community 61 - "[locale]/page.tsx"
Cohesion: 0.22
Nodes (7): FeatureShowcase(), AppShowcase(), CallToAction(), shapeOneOuterVariants, shapeTwoOuterVariants, Hero(), Platforms()

### Community 62 - "global-not-found-client.tsx"
Cohesion: 0.21
Nodes (8): copy, getClientLocale(), getServerLocale(), GlobalNotFoundClient(), Locale, NotFoundContent(), subscribeToLocale(), metadata

### Community 63 - "ThemeProvider.tsx"
Cohesion: 0.33
Nodes (7): getSystemTheme(), getTheme(), setTheme(), subscribe(), Theme, ThemeContext, ThemeProvider()

### Community 64 - "InteractiveGridPattern.tsx"
Cohesion: 0.29
Nodes (6): @react-three/fiber, three, useTheme(), GridSurfaceProps, InteractiveGridPattern(), InteractiveGridPatternProps

### Community 65 - "[locale]/layout.tsx"
Cohesion: 0.29
Nodes (3): locales, LocalePreference(), Footer()

### Community 66 - "Header"
Cohesion: 0.29
Nodes (3): Header(), changeLocale(), buildLocaleUrl()

### Community 67 - "react"
Cohesion: 0.38
Nodes (4): react, TemplateProps, PageTransition(), PageTransitionProps

### Community 68 - "SITE_URL"
Cohesion: 0.29
Nodes (3): metadata, metadata, SITE_URL

### Community 81 - "ThemeToggle.tsx"
Cohesion: 0.70
Nodes (4): getClientSnapshot(), getServerSnapshot(), subscribe(), ThemeToggle()

## Knowledge Gaps
- **364 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+359 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 476 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `site.ts`, `package.json`, `next-intl`, `LessonCardAccent.tsx`, `PixelDisplay.tsx`, `AuthActionClient.tsx`, `Asciify.tsx`, `FloatingSchedule.tsx`, `firebase.ts`, `createLiquid`, `FlameWrap.tsx`, `HomepagePixelClusters.tsx`, `framer-motion`, `LegalDocumentClient.tsx`, `[locale]/page.tsx`, `global-not-found-client.tsx`, `ThemeProvider.tsx`, `InteractiveGridPattern.tsx`, `[locale]/layout.tsx`, `app/auth/action/page.tsx`, `ThemeToggle.tsx`?**
  _High betweenness centrality (0.276) - this node is a cross-community bridge._
- **Why does `next-intl` connect `next-intl` to `site.ts`, `[locale]/layout.tsx`, `package.json`, `LessonCardAccent.tsx`, `AuthActionClient.tsx`, `FloatingSchedule.tsx`, `firebase.ts`, `ThemeToggle.tsx`, `framer-motion`, `LegalDocumentClient.tsx`, `[locale]/page.tsx`, `global-not-found-client.tsx`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _364 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `metadata` be split into smaller, more focused modules?**
  _Cohesion score 0.06390977443609022 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `next-intl` be split into smaller, more focused modules?**
  _Cohesion score 0.12100840336134454 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._