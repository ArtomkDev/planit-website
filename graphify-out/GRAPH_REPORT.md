# Graph Report - planit-website  (2026-11-04)

## Corpus Check
- 172 files · ~179,243 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1167 nodes · 1895 edges · 94 communities (59 shown, 6 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 47 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ca5a0374`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- FloatingSchedule.tsx
- metadata
- [locale]/layout.tsx
- package.json
- next-intl
- Аудит PlanIt: продаж, SEO, дизайн, зручність і достовірність
- Знахідки за пріоритетом
- compilerOptions
- AppShowcase.tsx
- PixelDisplay.tsx
- AuthActionClient.tsx
- Asciify.tsx
- components.json
- scripts
- LegalDocumentRoute.tsx
- devDependencies
- Аудит PlanIt
- firebase.ts
- createLiquid
- FlameWrap.tsx
- serve-static-export.mjs
- global-not-found-client.tsx
- site.ts
- [locale]/opengraph-image/route.ts
- update-legal-manifest.mjs
- Graphify Setup
- template.tsx
- Platforms.tsx
- This is NOT the Next.js you know
- LegalDocument.tsx
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
- AnimatedScheduleCode.tsx
- LessonCard.tsx
- Дизайн та взаємодія PlanIt
- section-navigation.ts
- site-seo.mjs
- FeatureShowcase.tsx
- [slug]/page.tsx
- warmLegalLoadingDocuments
- section-navigation.test.mjs
- ASCII-декорації Epic та адаптація для PlanIt
- next
- LegalIcons.tsx
- app/auth/action/page.tsx
- card-contrast.ts
- LessonCardAccent.tsx
- Пошукова видимість planitflow.com — аудит 25.10.2026
- PlanIt Website
- Виправлення аудиту та пошукова видимість PlanIt
- Оновлення сайту однією командою
- Підключення planitflow.com — 25.10.2026
- dependencies

## God Nodes (most connected - your core abstractions)
1. `Аудит PlanIt` - 55 edges
2. `react` - 38 edges
3. `scripts` - 33 edges
4. `next-intl` - 25 edges
5. `@phosphor-icons/react` - 21 edges
6. `initializeAsciify()` - 21 edges
7. `createLiquid()` - 21 edges
8. `framer-motion` - 20 edges
9. `PixelDisplay()` - 18 edges
10. `Знахідки за пріоритетом` - 17 edges

## Surprising Connections (you probably didn't know these)
- `fixture()` --calls--> `sha256()`  [EXTRACTED]
  tests/site-release.test.mjs → scripts/lib/site-seo.mjs
- `collectSeo()` --calls--> `validateContentPages()`  [EXTRACTED]
  scripts/lib/site-seo.mjs → src/lib/content-page-schema.mjs
- `request()` --calls--> `sha256()`  [EXTRACTED]
  scripts/audit-search.mjs → scripts/lib/site-seo.mjs
- `GET()` --calls--> `OpenGraphImage()`  [EXTRACTED]
  src/app/[locale]/opengraph-image/route.ts → src/components/metadata/OpenGraphImage.ts
- `generateMetadata()` --calls--> `getLegalDocumentMetadata()`  [EXTRACTED]
  src/app/[locale]/wiki/cookies/page.tsx → src/components/legal/LegalDocumentRoute.tsx

## Import Cycles
- None detected.

## Communities (94 total, 6 thin omitted)

### Community 0 - "FloatingSchedule.tsx"
Cohesion: 0.17
Nodes (17): BreakCard(), BreakCardProps, createSchedule(), createSeededRandom(), DaySchedule, DaySelection, findAutomaticSelection(), FloatingSchedule() (+9 more)

### Community 1 - "metadata"
Cohesion: 0.07
Nodes (55): loadingPath, loadingSha256, metadata, path, sha256, title, version, loadingPath (+47 more)

### Community 2 - "[locale]/layout.tsx"
Cohesion: 0.16
Nodes (8): locales, LocalePreference(), Footer(), Wordmark(), ContentPageData, contentPages, ContentPageText, publishedPages

### Community 3 - "package.json"
Cohesion: 0.09
Nodes (21): name, private, version, eslint, eslint-config-next, firebase, firebase-tools, react-dom (+13 more)

### Community 4 - "next-intl"
Cohesion: 0.20
Nodes (18): next-intl, @phosphor-icons/react, initialAppearance, subjectIcons, ChoiceList(), DemoFrame(), DemoRenderProps, DemoTabs() (+10 more)

### Community 5 - "Аудит PlanIt: продаж, SEO, дизайн, зручність і достовірність"
Cohesion: 0.09
Nodes (23): 10. Рекомендована послідовність сторінки, 11. План робіт і критерії приймання, 12. Докази та межі перевірки, 1. Що перевірено, 2. Загальна оцінка, 3. Пріоритетні знахідки, 4. Чи продає сайт програму, 5. Які запитання залишаються без зручної відповіді (+15 more)

### Community 6 - "Знахідки за пріоритетом"
Cohesion: 0.12
Nodes (17): P1 — Mobile header втрачав частину destinations, P1 — Аналітика могла ігнорувати останній вибір і scope документів, P2 — Cookie banner стискав текст і не дозволяв повернутися до вибору, P2 — Fixed legal sidebar перекривав footer, P2 — Header disclosure не мав повної клавіатурної поведінки, P2 — Hero обрізався на маленькому телефоні, P2 — Mobile editor мав нестійке sticky-позиціонування, P2 — Root dead end, різні origins та некоректні social assets (+9 more)

### Community 7 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 8 - "AppShowcase.tsx"
Cohesion: 0.13
Nodes (18): framer-motion, ScrollReveal(), ScrollRevealProps, AccentRule(), cards, FeatureId, previewIntroDelay, BentoCard() (+10 more)

### Community 9 - "PixelDisplay.tsx"
Cohesion: 0.09
Nodes (33): clamp(), createCanvasPixelRenderer(), createFigureSeed(), createShader(), createWebglPixelRenderer(), DISPLAY_COLORS, edgeCellNoise(), ENERGY_LOOKUP (+25 more)

### Community 10 - "AuthActionClient.tsx"
Cohesion: 0.08
Nodes (23): AuthActionPageProps, AuthActionClient(), handlePasswordSubmit(), ErrorInfo, ErrorMessageKey, FIXED_SAFE_ORIGINS, FormErrorKey, getFirebaseErrorInfo() (+15 more)

### Community 11 - "Asciify.tsx"
Cohesion: 0.07
Nodes (41): Asciify(), AsciifyCharset, AsciifyElements, AsciifyInstance, AsciifyOptions, AsciifyProps, CHARSETS, createAsciify() (+33 more)

### Community 12 - "components.json"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 13 - "scripts"
Cohesion: 0.06
Nodes (33): scripts, audit:search, build, build:firebase, check:export, check:live, check:seo, deploy:firebase (+25 more)

### Community 14 - "LegalDocumentRoute.tsx"
Cohesion: 0.19
Nodes (8): generateMetadata(), generateMetadata(), generateMetadata(), generateMetadata(), generateMetadata(), getLegalDocumentMetadata(), LegalDocumentRoute(), LocaleParams

### Community 15 - "devDependencies"
Cohesion: 0.12
Nodes (17): devDependencies, eslint, eslint-config-next, firebase-tools, tailwindcss, @tailwindcss/postcss, @types/caseless, @types/jsonwebtoken (+9 more)

### Community 16 - "Аудит PlanIt"
Cohesion: 0.04
Nodes (54): ASCII-силуети за референсом Epic — 20.10.2026, ASCII у темпі гортання та правого меню — 20.10.2026, Авторські права й атрибуція Android у футері — 04.11.2026, Аудит PlanIt, Більші редактори та симетричне піксельне тло — 18.10.2026, Видалення відхилених абстрактних стрічок — 23.10.2026, Видимий приліт після швидкого переходу — 20.10.2026, Внутрішні анімації в кольорах карток — 18.10.2026 (+46 more)

### Community 17 - "firebase.ts"
Cohesion: 0.09
Nodes (40): MarketingAnalytics(), hasConsent(), interact(), record(), toggle(), CookieConsent(), storageChanged(), readConsent() (+32 more)

### Community 18 - "createLiquid"
Cohesion: 0.10
Nodes (31): createLiquid(), applySplat(), bindTexture(), blit(), compile(), createDoubleTarget(), createProgram(), createTarget() (+23 more)

### Community 19 - "FlameWrap.tsx"
Cohesion: 0.15
Nodes (16): createFlameWrap(), frame(), onMotionChange(), render(), start(), uploadContent(), DEFAULTS, ElementImageContext (+8 more)

### Community 20 - "serve-static-export.mjs"
Cohesion: 0.31
Nodes (9): isFile(), isInsideRoot(), mimeTypes, port, resolveFile(), rootDir, safeJoin(), sendFile() (+1 more)

### Community 21 - "global-not-found-client.tsx"
Cohesion: 0.09
Nodes (25): @react-three/fiber, three, copy, getClientLocale(), getServerLocale(), GlobalNotFoundClient(), Locale, NotFoundContent() (+17 more)

### Community 22 - "site.ts"
Cohesion: 0.17
Nodes (7): Header(), changeLocale(), HeaderLinkProps, HeaderProps, APP_URL, buildLocaleUrl(), SUPPORT_URL

### Community 23 - "[locale]/opengraph-image/route.ts"
Cohesion: 0.29
Nodes (6): dynamic, dynamicParams, GET(), dynamic, GET(), OpenGraphImage()

### Community 24 - "update-legal-manifest.mjs"
Cohesion: 0.40
Nodes (3): documents, legalDirectory, manifest

### Community 25 - "Graphify Setup"
Cohesion: 0.29
Nodes (6): Build the Project Graph, Codex Integration, Graphify Setup, Install the CLI, Query the Graph, Team Notes

### Community 26 - "template.tsx"
Cohesion: 0.38
Nodes (4): react, TemplateProps, PageTransition(), PageTransitionProps

### Community 27 - "Platforms.tsx"
Cohesion: 0.23
Nodes (9): FeatureShowcase(), AppShowcase(), AndroidRobotLogo(), AppleBrandLogo(), BrandIconProps, FAQ(), Hero(), Platforms() (+1 more)

### Community 28 - "This is NOT the Next.js you know"
Cohesion: 0.40
Nodes (4): Graphify, graphify, This is NOT the Next.js you know, UI, navigation, and interaction changes

### Community 29 - "LegalDocument.tsx"
Cohesion: 0.16
Nodes (22): version, getInitialLoadingHtml(), LegalDocument(), legalManifest, publicDirectory, resolvePublicAssetPath(), buildVersionedAssetUrl(), getLegalDocumentAssetDescriptor() (+14 more)

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
Cohesion: 0.11
Nodes (30): allowedClasses, allowedTags, CachedLegalLoadingDocument, escapeHtml(), extractMetadataBlock(), fetchLegalManifest(), isRecord(), isSafeHref() (+22 more)

### Community 60 - "Q: Який шрифт використано для PLANIT у самому низу сторінки, у футері?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Який шрифт використано для PLANIT у самому низу сторінки, у футері?, Source Nodes

### Community 61 - "AnimatedScheduleCode.tsx"
Cohesion: 0.27
Nodes (9): AnimatedScheduleCode(), AnimationOptions, CodeGlyph, createScheduleCodeAnimation(), advance(), reveal(), INITIAL_SCHEDULE_CODE, RevealEvent (+1 more)

### Community 62 - "LessonCard.tsx"
Cohesion: 0.17
Nodes (15): ElasticLayerOptions, LessonCard(), LessonCardProps, LessonData, positiveModulo(), resolveLessonAppearance(), SubjectTheme, subjectThemes (+7 more)

### Community 63 - "Дизайн та взаємодія PlanIt"
Cohesion: 0.14
Nodes (14): Responsive, клавіатура та рух, Виправлення повного аудиту — 23.10.2026, Дизайн та взаємодія PlanIt, Компоненти, стани та поверхні, Навігація, Оновлення айдентики 18.10.2026, Палітра та контраст, Пошук Google та коренева адреса — 24.10.2026 (+6 more)

### Community 64 - "section-navigation.ts"
Cohesion: 0.15
Nodes (25): FloatingSectionNavigation(), clamp(), getCurrentSection(), getSectionActivationStops(), getSectionNavLetter(), getSectionNavMotionWindows(), getSectionNavPoses(), getSectionNavUrl() (+17 more)

### Community 65 - "site-seo.mjs"
Cohesion: 0.06
Nodes (47): @next/env, args, failures, observations, output, request(), responses, root (+39 more)

### Community 66 - "FeatureShowcase.tsx"
Cohesion: 0.12
Nodes (5): AppearanceDemo(), features, LessonEditorDemo(), ScheduleSettingsDemo(), TasksDemo()

### Community 67 - "[slug]/page.tsx"
Cohesion: 0.22
Nodes (8): metadata, ContentPage(), dynamicParams, generateMetadata(), getPage(), WebsiteIdentity(), createPageMetadata(), SITE_URL

### Community 68 - "warmLegalLoadingDocuments"
Cohesion: 0.20
Nodes (18): ensureFreshLegalLoadingDocument(), fetchLegalDocument(), fetchLegalLoadingDocument(), getLegacyLegalLoadingCacheKeys(), getLegalAssetRequestCache(), getLegalLoadingAssetDescriptor(), getLegalLoadingCacheKey(), getLoadingStorageVersion() (+10 more)

### Community 69 - "section-navigation.test.mjs"
Cohesion: 0.07
Nodes (11): typescript, { outputText }, { outputText }, { outputText }, { outputText }, { outputText }, base, glyphs (+3 more)

### Community 80 - "ASCII-декорації Epic та адаптація для PlanIt"
Cohesion: 0.20
Nodes (9): ASCII-декорації Epic та адаптація для PlanIt, Вартість і супровід, Власні форми PlanIt, Джерела й межі висновків, Композиція, теми та адаптивність, Підтверджена будова Epic, Сценарій руху в PlanIt, Чому попереднє рішення PlanIt перестало працювати (+1 more)

### Community 81 - "next"
Cohesion: 0.12
Nodes (8): nextConfig, withNextIntl, next, metadata, metadata, dynamic, dynamic, localeRedirectScript

### Community 83 - "LegalIcons.tsx"
Cohesion: 0.18
Nodes (10): LegalDocumentProps, LegalDocumentClientProps, ParsedLegalDocument, documentIcons, LegalCalendarIcon(), LegalDocumentIcon(), LegalSupportArrow(), LegalDocumentData (+2 more)

### Community 85 - "card-contrast.ts"
Cohesion: 0.80
Nodes (4): channels(), contrastRatio(), getReadableCardStyle(), luminance()

### Community 87 - "Пошукова видимість planitflow.com — аудит 25.10.2026"
Cohesion: 0.22
Nodes (9): Зовнішні посилання та дублікати, Перевірки публікації, Повторення перевірки, Пошукова видимість planitflow.com — аудит 25.10.2026, Технічна перевірка живого сайту, Фактичні дані Google, Що виправлено і вже опубліковано, Що насправді відбувається (+1 more)

### Community 88 - "PlanIt Website"
Cohesion: 0.25
Nodes (8): Firebase Hosting, Local Development, Local Production Preview, PlanIt Website, Runtime Legal Documents, Sync and publish both languages, Update and publish, Website identity and verified releases

### Community 90 - "Виправлення аудиту та пошукова видимість PlanIt"
Cohesion: 0.33
Nodes (6): Plerdy, Google та подальша індексація, Виправлення аудиту та пошукова видимість PlanIt, Перевірки, Публікація та Search Console, Реалізовано, Статус початкових знахідок

### Community 91 - "Оновлення сайту однією командою"
Cohesion: 0.33
Nodes (6): Звичайне оновлення, Нова сторінка, Оновлення сайту однією командою, Перевірка пошукової доступності, Перейменування та видалення адрес, Підтвердження Google та налаштування

### Community 92 - "Підключення planitflow.com — 25.10.2026"
Cohesion: 0.40
Nodes (4): Search Console, Домен і DNS, Підключення planitflow.com — 25.10.2026, Сайт і перевірки

### Community 97 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, clsx, firebase, framer-motion, next, @next/env, next-intl, @phosphor-icons/react (+6 more)

## Knowledge Gaps
- **496 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+491 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 630 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `template.tsx` to `FloatingSchedule.tsx`, `[locale]/layout.tsx`, `package.json`, `next-intl`, `AppShowcase.tsx`, `PixelDisplay.tsx`, `AuthActionClient.tsx`, `Asciify.tsx`, `firebase.ts`, `createLiquid`, `FlameWrap.tsx`, `global-not-found-client.tsx`, `site.ts`, `Platforms.tsx`, `LegalDocumentClient.tsx`, `AnimatedScheduleCode.tsx`, `LessonCard.tsx`, `section-navigation.ts`, `FeatureShowcase.tsx`, `app/auth/action/page.tsx`?**
  _High betweenness centrality (0.271) - this node is a cross-community bridge._
- **Why does `documents` connect `metadata` to `LegalDocument.tsx`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `@next/env` connect `site-seo.mjs` to `package.json`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _496 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `metadata` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `Аудит PlanIt: продаж, SEO, дизайн, зручність і достовірність` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._