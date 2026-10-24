# Graph Report - planit-website  (2026-10-24)

## Corpus Check
- 171 files · ~146,693 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1137 nodes · 1856 edges · 98 communities (61 shown, 8 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 47 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a1dd5905`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- FloatingSchedule.tsx
- metadata
- LegalDocument.tsx
- package.json
- FeatureShowcase.tsx
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
- OpenGraphImage.tsx
- update-legal-manifest.mjs
- Graphify Setup
- react
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
- AnimatedScheduleCode.tsx
- LessonEditorDemo
- Дизайн та взаємодія PlanIt
- section-navigation.ts
- site-seo.mjs
- dependencies
- warmLegalLoadingDocuments
- LessonCard.tsx
- section-navigation.test.mjs
- ASCII-декорації Epic та адаптація для PlanIt
- next
- PlanIt Website
- Виправлення аудиту та пошукова видимість PlanIt
- [locale]/layout.tsx
- 4. Чи продає сайт програму
- app/auth/action/page.tsx
- 7. SEO
- 8. Дизайн, зручність і доступність
- Header.tsx
- LegalIcons.tsx
- [slug]/page.tsx
- Header
- Оновлення сайту однією командою
- (entry)/layout.tsx
- (entry)/page.tsx

## God Nodes (most connected - your core abstractions)
1. `Аудит PlanIt` - 45 edges
2. `react` - 38 edges
3. `scripts` - 32 edges
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
- `generateMetadata()` --calls--> `getLegalDocumentMetadata()`  [EXTRACTED]
  src/app/[locale]/wiki/cookies/page.tsx → src/components/legal/LegalDocumentRoute.tsx
- `generateMetadata()` --calls--> `getLegalDocumentMetadata()`  [EXTRACTED]
  src/app/[locale]/wiki/delete/page.tsx → src/components/legal/LegalDocumentRoute.tsx
- `generateMetadata()` --calls--> `getLegalDocumentMetadata()`  [EXTRACTED]
  src/app/[locale]/wiki/licenses/page.tsx → src/components/legal/LegalDocumentRoute.tsx

## Import Cycles
- None detected.

## Communities (98 total, 8 thin omitted)

### Community 0 - "FloatingSchedule.tsx"
Cohesion: 0.21
Nodes (15): createSchedule(), createSeededRandom(), DaySchedule, DaySelection, findAutomaticSelection(), FloatingSchedule(), GeneratedLesson, getDateFromKey() (+7 more)

### Community 1 - "metadata"
Cohesion: 0.07
Nodes (55): loadingPath, loadingSha256, metadata, path, sha256, title, version, loadingPath (+47 more)

### Community 2 - "LegalDocument.tsx"
Cohesion: 0.16
Nodes (22): version, getInitialLoadingHtml(), LegalDocument(), legalManifest, publicDirectory, resolvePublicAssetPath(), buildVersionedAssetUrl(), getLegalDocumentAssetDescriptor() (+14 more)

### Community 3 - "package.json"
Cohesion: 0.09
Nodes (22): name, private, version, eslint, eslint-config-next, firebase, firebase-tools, @next/env (+14 more)

### Community 4 - "FeatureShowcase.tsx"
Cohesion: 0.12
Nodes (22): next-intl, @phosphor-icons/react, AppearanceDemo(), initialAppearance, subjectIcons, ChoiceList(), DemoFrame(), DemoRenderProps (+14 more)

### Community 5 - "Аудит PlanIt: продаж, SEO, дизайн, зручність і достовірність"
Cohesion: 0.17
Nodes (12): 10. Рекомендована послідовність сторінки, 11. План робіт і критерії приймання, 12. Докази та межі перевірки, 1. Що перевірено, 2. Загальна оцінка, 3. Пріоритетні знахідки, 5. Які запитання залишаються без зручної відповіді, 6. Перевірка достовірності (+4 more)

### Community 6 - "Знахідки за пріоритетом"
Cohesion: 0.12
Nodes (17): P1 — Mobile header втрачав частину destinations, P1 — Аналітика могла ігнорувати останній вибір і scope документів, P2 — Cookie banner стискав текст і не дозволяв повернутися до вибору, P2 — Fixed legal sidebar перекривав footer, P2 — Header disclosure не мав повної клавіатурної поведінки, P2 — Hero обрізався на маленькому телефоні, P2 — Mobile editor мав нестійке sticky-позиціонування, P2 — Root dead end, різні origins та некоректні social assets (+9 more)

### Community 7 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 8 - "AppShowcase.tsx"
Cohesion: 0.13
Nodes (23): clsx, framer-motion, tailwind-merge, ScrollReveal(), ScrollRevealProps, cards, FeatureId, previewIntroDelay (+15 more)

### Community 9 - "PixelDisplay.tsx"
Cohesion: 0.09
Nodes (33): clamp(), createCanvasPixelRenderer(), createFigureSeed(), createShader(), createWebglPixelRenderer(), DISPLAY_COLORS, edgeCellNoise(), ENERGY_LOOKUP (+25 more)

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
Cohesion: 0.06
Nodes (32): scripts, build, build:firebase, check:export, check:live, check:seo, deploy:firebase, deploy:firebase:preview (+24 more)

### Community 14 - "LegalDocumentRoute.tsx"
Cohesion: 0.19
Nodes (8): generateMetadata(), generateMetadata(), generateMetadata(), generateMetadata(), generateMetadata(), getLegalDocumentMetadata(), LegalDocumentRoute(), LocaleParams

### Community 15 - "devDependencies"
Cohesion: 0.12
Nodes (17): devDependencies, eslint, eslint-config-next, firebase-tools, tailwindcss, @tailwindcss/postcss, @types/caseless, @types/jsonwebtoken (+9 more)

### Community 16 - "Аудит PlanIt"
Cohesion: 0.05
Nodes (44): ASCII-силуети за референсом Epic — 20.10.2026, ASCII у темпі гортання та правого меню — 20.10.2026, Аудит PlanIt, Більші редактори та симетричне піксельне тло — 18.10.2026, Видалення відхилених абстрактних стрічок — 23.10.2026, Видимий приліт після швидкого переходу — 20.10.2026, Внутрішні анімації в кольорах карток — 18.10.2026, Головна без рухомого рядка переваг — 20.10.2026 (+36 more)

### Community 17 - "firebase.ts"
Cohesion: 0.08
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
Nodes (24): @react-three/fiber, three, copy, getClientLocale(), getServerLocale(), GlobalNotFoundClient(), Locale, NotFoundContent() (+16 more)

### Community 22 - "site.ts"
Cohesion: 0.20
Nodes (11): FeatureShowcase(), AccentRule(), AppShowcase(), CallToAction(), FAQ(), faqItems, Hero(), Platforms() (+3 more)

### Community 23 - "OpenGraphImage.tsx"
Cohesion: 0.23
Nodes (9): dynamic, GET(), dynamic, GET(), alt, contentType, dynamic, OpenGraphImage() (+1 more)

### Community 24 - "update-legal-manifest.mjs"
Cohesion: 0.40
Nodes (3): documents, legalDirectory, manifest

### Community 25 - "Graphify Setup"
Cohesion: 0.29
Nodes (6): Build the Project Graph, Codex Integration, Graphify Setup, Install the CLI, Query the Graph, Team Notes

### Community 26 - "react"
Cohesion: 0.24
Nodes (6): react, TemplateProps, PageTransition(), PageTransitionProps, FeaturePreviewMotion(), Playback

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
Cohesion: 0.11
Nodes (30): allowedClasses, allowedTags, CachedLegalLoadingDocument, escapeHtml(), extractMetadataBlock(), fetchLegalManifest(), isRecord(), isSafeHref() (+22 more)

### Community 60 - "Q: Який шрифт використано для PLANIT у самому низу сторінки, у футері?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Який шрифт використано для PLANIT у самому низу сторінки, у футері?, Source Nodes

### Community 61 - "AnimatedScheduleCode.tsx"
Cohesion: 0.27
Nodes (9): AnimatedScheduleCode(), AnimationOptions, CodeGlyph, createScheduleCodeAnimation(), advance(), reveal(), INITIAL_SCHEDULE_CODE, RevealEvent (+1 more)

### Community 63 - "Дизайн та взаємодія PlanIt"
Cohesion: 0.15
Nodes (13): Responsive, клавіатура та рух, Виправлення повного аудиту — 23.10.2026, Дизайн та взаємодія PlanIt, Компоненти, стани та поверхні, Навігація, Оновлення айдентики 18.10.2026, Палітра та контраст, Пошук Google та коренева адреса — 24.10.2026 (+5 more)

### Community 64 - "section-navigation.ts"
Cohesion: 0.15
Nodes (25): FloatingSectionNavigation(), clamp(), getCurrentSection(), getSectionActivationStops(), getSectionNavLetter(), getSectionNavMotionWindows(), getSectionNavPoses(), getSectionNavUrl() (+17 more)

### Community 65 - "site-seo.mjs"
Cohesion: 0.08
Nodes (38): assertRouteContinuity(), collectSeo(), decode(), escapeXml(), filesUnder(), inspectHtml(), loadBuildEnvironment(), normalizePath() (+30 more)

### Community 66 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, clsx, firebase, framer-motion, next, @next/env, next-intl, @phosphor-icons/react (+6 more)

### Community 67 - "warmLegalLoadingDocuments"
Cohesion: 0.20
Nodes (18): ensureFreshLegalLoadingDocument(), fetchLegalDocument(), fetchLegalLoadingDocument(), getLegacyLegalLoadingCacheKeys(), getLegalAssetRequestCache(), getLegalLoadingAssetDescriptor(), getLegalLoadingCacheKey(), getLoadingStorageVersion() (+10 more)

### Community 68 - "LessonCard.tsx"
Cohesion: 0.22
Nodes (13): ElasticLayerOptions, LessonCard(), LessonCardProps, LessonData, positiveModulo(), resolveLessonAppearance(), SubjectTheme, subjectThemes (+5 more)

### Community 69 - "section-navigation.test.mjs"
Cohesion: 0.07
Nodes (11): typescript, { outputText }, { outputText }, { outputText }, { outputText }, { outputText }, base, glyphs (+3 more)

### Community 80 - "ASCII-декорації Epic та адаптація для PlanIt"
Cohesion: 0.20
Nodes (9): ASCII-декорації Epic та адаптація для PlanIt, Вартість і супровід, Власні форми PlanIt, Джерела й межі висновків, Композиція, теми та адаптивність, Підтверджена будова Epic, Сценарій руху в PlanIt, Чому попереднє рішення PlanIt перестало працювати (+1 more)

### Community 81 - "next"
Cohesion: 0.12
Nodes (7): nextConfig, withNextIntl, next, metadata, metadata, dynamic, dynamic

### Community 83 - "PlanIt Website"
Cohesion: 0.25
Nodes (8): Firebase Hosting, Local Development, Local Production Preview, PlanIt Website, Runtime Legal Documents, Sync and publish both languages, Update and publish, Website identity and verified releases

### Community 84 - "Виправлення аудиту та пошукова видимість PlanIt"
Cohesion: 0.33
Nodes (6): Plerdy, Google та подальша індексація, Виправлення аудиту та пошукова видимість PlanIt, Перевірки, Публікація та Search Console, Реалізовано, Статус початкових знахідок

### Community 85 - "[locale]/layout.tsx"
Cohesion: 0.20
Nodes (6): locales, LocalePreference(), ContentPageData, contentPages, ContentPageText, publishedPages

### Community 86 - "4. Чи продає сайт програму"
Cohesion: 0.40
Nodes (5): 4. Чи продає сайт програму, Виміряна відстань до важливих відповідей, Де слабшає переконання, Для кого він уже працює, Пропозиція змісту першого екрана

### Community 89 - "7. SEO"
Cohesion: 0.67
Nodes (3): 7. SEO, Що вже зроблено добре в поточній збірці, Що виправити

### Community 90 - "8. Дизайн, зручність і доступність"
Cohesion: 0.67
Nodes (3): 8. Дизайн, зручність і доступність, Зберегти, Покращити

### Community 91 - "Header.tsx"
Cohesion: 0.24
Nodes (7): Footer(), HeaderLinkProps, HeaderProps, AndroidRobotLogo(), AppleBrandLogo(), BrandIconProps, Wordmark()

### Community 92 - "LegalIcons.tsx"
Cohesion: 0.18
Nodes (10): LegalDocumentProps, LegalDocumentClientProps, ParsedLegalDocument, documentIcons, LegalCalendarIcon(), LegalDocumentIcon(), LegalSupportArrow(), LegalDocumentData (+2 more)

### Community 93 - "[slug]/page.tsx"
Cohesion: 0.36
Nodes (6): ContentPage(), dynamicParams, generateMetadata(), getPage(), createPageMetadata(), SITE_URL

### Community 94 - "Header"
Cohesion: 0.29
Nodes (3): Header(), changeLocale(), buildLocaleUrl()

### Community 95 - "Оновлення сайту однією командою"
Cohesion: 0.29
Nodes (5): Звичайне оновлення, Нова сторінка, Оновлення сайту однією командою, Перейменування та видалення адрес, Підтвердження Google та налаштування

## Knowledge Gaps
- **474 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+469 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 603 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `FloatingSchedule.tsx`, `package.json`, `FeatureShowcase.tsx`, `AppShowcase.tsx`, `PixelDisplay.tsx`, `AuthActionClient.tsx`, `Asciify.tsx`, `firebase.ts`, `createLiquid`, `FlameWrap.tsx`, `global-not-found-client.tsx`, `site.ts`, `LegalDocumentClient.tsx`, `AnimatedScheduleCode.tsx`, `section-navigation.ts`, `LessonCard.tsx`, `[locale]/layout.tsx`, `app/auth/action/page.tsx`, `Header.tsx`?**
  _High betweenness centrality (0.260) - this node is a cross-community bridge._
- **Why does `documents` connect `metadata` to `LegalDocument.tsx`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `next-intl` connect `FeatureShowcase.tsx` to `FloatingSchedule.tsx`, `section-navigation.ts`, `package.json`, `AppShowcase.tsx`, `LegalDocumentClient.tsx`, `AuthActionClient.tsx`, `firebase.ts`, `[locale]/layout.tsx`, `global-not-found-client.tsx`, `site.ts`, `Header.tsx`, `AnimatedScheduleCode.tsx`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _474 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `metadata` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `FeatureShowcase.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11587301587301588 - nodes in this community are weakly interconnected._