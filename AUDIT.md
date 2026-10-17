# Аудит PlanIt

Дата: 13.10.2026. Об’єкт: цей репозиторій та його локальний production static export. Результат — реалізовані виправлення, регресійні перевірки й конкретний посібник [DESIGN.md](DESIGN.md). Сайт не оголошується бездоганним: нижче розділені браузерні перевірки, HTTP/автоматичні перевірки, source review та недоступні сценарії.

## Контекст і метод

- Першим джерелом архітектури був наявний Graphify: `graphify:query` із картою routes/layouts/navigation/features/design system, потім focused query/explain для header, документів та auth. За деталями відкрито відповідні джерела. Wiki index у graphify-out не був доступний.
- Прочитано встановлені Next.js 16.2.9 guides для layouts/pages, navigation, client/server, static export, metadata, route groups, image metadata та route handlers. Стек залишився Next/React/next-intl/Framer Motion/Firebase/Tailwind; залежностей не додано.
- До початку були незакомічені зміни README, package.json, privacy.mdx, homepage, Header/Footer/Hero/LessonCard, перекладів, Graphify та нові features/PixelDisplay. Їх збережено; UI-файли змінено поверх наявного стану. Privacy Policy та README не переписувалися. Жодного reset, commit чи deployment не виконано.
- Переглянуто вихідний і відрендерений сайт; фінальна перевірка — Codex In-app Browser та `npm start -- 4175`, який обслуговує `out/`. Це один браузерний рушій, не перевірка всіх браузерів.
- Знімки та DOM-виміри збережені в [audit-evidence](audit-evidence/). Перед/після не завжди мають однакові розміри viewport; знімки показують конкретний дефект, а JSON фіксує requested viewport і геометрію. Ширина bitmap/clientWidth може бути на 15px меншою через scrollbar.

## Інвентар покриття

Позначення: **Б** — відкрито й оглянуто в браузері; **А** — автоматична/HTTP перевірка; **К** — source review. Перевірки route-family поширюються на перелічені адреси, але не означають проходження кожного можливого стану на кожній ширині.

| Routes / assets | Покриття | Перевірено |
| --- | --- | --- |
| `/` | Б, А, К | Оновлення 18.10.2026: автоматичний перехід UK/EN до hydration, збережений вибір, query/hash; metadata та HTTP 200. Без JS — meta refresh на `/uk` (перевірка export, без браузерної перевірки JS-off) |
| `/uk`, `/en` | Б, А, К | Hero, ribbon, усі чотири features, showcase, platforms, CTA, header/footer, теми, cookie preferences |
| `/uk/wiki`, `/en/wiki` | Б, А, К | Початковий Terms reader, sidebar, підтримка, canonical |
| `/{uk,en}/wiki/privacy` | Б, А, К | Повний текст: 16 секцій, локалізована оболонка, anchors, asset/hash |
| `/{uk,en}/wiki/cookies` | Б, А, К | Повний текст: 10 секцій, website/app storage розділені, anchors, analytics scope |
| `/{uk,en}/wiki/terms` | Б, А, К | Повний текст: 19 секцій, anchors, asset/hash |
| `/{uk,en}/wiki/licenses` | Б, А, К | Повний текст: 5 секцій; loading, навмисний 404 asset, локалізована помилка та успішний retry |
| `/{uk,en}/wiki/delete` | Б, А, К | Повний текст: 8 секцій; це інструкція, не форма видалення акаунта |
| `/{uk,en}/{privacy,terms,delete,cookies,licenses}` | Б, А, К | Усі 10 configured aliases: HTTP 301 на wiki-адреси, query збережений. Cookies/licenses обслуговуються hosting redirect, не окремим Next page |
| `/auth/action`, `/{uk,en}/auth/action` | Б, А, К | Dispatcher, відсутні params, невідомий mode, недійсний тестовий код, локалізована помилка; locale/query/continueUrl. Успішні account actions — заблоковано відсутністю реальних кодів |
| `/uk/not-a-page`, `/en/not-a-page`, `/de`, інша невідома адреса | Б, А, К | Реальний HTTP 404, UK/EN copy, тема, повернення додому, зміна мови |
| `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest` | А, К | Доступність, source/config; website origin, список public pages, виключення auth з індексації |
| `/icon`, `/apple-icon`, `/opengraph-image`, `/twitter-image`, favicon | А, К | Експортовані assets; extensionless PNG HTTP MIME та signature, абсолютні social URLs. Це перевірка файлів/HTTP, не crawler-preview Facebook/X |
| `/_next/static/*`, `/content/legal/*`, внутрішні href/img/script URLs | А, К | Наявність усіх знайдених локальних navigation/assets у export; SHA256 п’яти документів і п’яти skeleton assets |

Повні тексти документів перевірено окремо після початкових SSR fallback: [document-verification.json](audit-evidence/document-verification.json). [route-verification.json](audit-evidence/route-verification.json) містить також початкові fallback titles при швидких переходах; вони не є результатом перевірки фінального тексту.

| Компоненти / технічний модуль | Покриття та межі |
| --- | --- |
| Locale layout/template, entry/auth layouts, global 404 | К + Б: landmarks, theme/provider boundary, metadata, initial render |
| Header/Footer/ThemeToggle/LocalePreference | К + Б: desktop/mobile groups, destinations, active state, Escape/focus/outside dismissal, перемикання мови й теми, footer anchors |
| FeatureShowcase, DemoPrimitives, LessonEditorDemo | К + Б: назва/тип, custom-time validation, preview, save/cancel/reset, status |
| AppearanceDemo, LessonCard, LessonCardAccent | К + Б + А: color/gradient/icon, keyboard angle, усі активні місця використання спільної картки; математична перевірка контрасту палітри |
| TasksDemo | К + Б: порожня форма, створення, редагування, completion counter, фільтр, довгий текст/перенесення |
| ScheduleSettingsDemo, FloatingSchedule, BreakCard | К + Б: перерахунок часу, invalid duration/save disabled, switch/save/reset, empty Sunday, compact preview, існуючий break state; motion reviewed у коді |
| Hero, InfiniteRibbon, AppShowcase, BentoCard, Platforms, CallToAction, BrandIcons | К + Б: hierarchy, copy/CTA, wrapping, inactive iOS status, декоративні елементи та href |
| PixelDisplay, HomepagePixelClusters | К + Б для активних instance; listener/RAF/observer cleanup у коді. Formal CPU/GPU profiling не виконано |
| InteractiveGridPattern; canvasui/Asciify, Liquid, FlameWrap | К: використання, lifecycle та motion. Не змонтовані поточною головною; runtime/GPU перевірку не заявлено |
| PageTransition, ScrollReveal, framer-variants, ThemeProvider | К + Б для звичайного motion: lifecycle, повторні переходи, theme listeners. OS reduced-motion runtime недоступний |
| LegalDocument/Client/Route, LoadingPreloader/PreloadLinks/Icons, content/legal-documents | К + Б: metadata, loading/error/retry, hash, race guard, existing tag/class/URL sanitizer. Окремий penetration test sanitizer не виконано |
| AuthActionRedirect/Client та CSS | К + Б для error/dispatch: allowlisted continuation, mode/code validation, Firebase error mapping. Password criteria/visibility/submission/success — К, потрібен валідний reset code |
| firebase, analytics-consent, cookie-preferences, site, i18n | К + А + Б для доступних UI states: consent race/expiry, locale URL, translations, theme persistence, constants |
| next.config, firebase.json, manifest/build/static server/deploy/Graphify scripts | К + А для build/preview; реальний Firebase deployment та cloud security rules не перевірялися |

## Рішення щодо навігації

**Глобальний header:** «Можливості» вилучено з desktop і mobile. Залишено три однакові disclosure-групи «Продукт», «Документи», «Підтримка»: кнопка розкриває групу, посилання переходить за адресою. Mobile використовує той самий список destinations. Корисний footer-link `#features` залишено; IDs features та чотирьох статей збережено.

**Features:** обрано звичайне прокручування. Це чотири послідовні самодостатні статті з власними preview/editor, а не каталог незалежних сторінок. Рядок секційних shortcuts у вступі створював ще один рівень навігації поруч зі справжніми controls демо. Він вилучений; side rail не доданий, бо дублював би коротку послідовність і займав би місце біля двох колонок. Controls «Колір/Градієнт», час, тижні та нагадування збережено як кнопки режимів усередині editor. Бічне розташування доречне для довгих документів: їхній sidebar тепер sticky тільки всередині контейнера reader.

Ці два рішення — виправлення інформаційної архітектури за запитом, а не твердження, що будь-який in-page link чи side rail сам собою є багом.

## Знахідки за пріоритетом

P1 — суттєва функціональна/приватнісна проблема; P2 — відтворюваний layout, accessibility або navigation defect; P3 — менша повторювана неузгодженість. Усі пункти цього розділу **виправлено**; недоступні перевірки перелічено окремо.

### P1 — Аналітика могла ігнорувати останній вибір і scope документів

**Джерела:** `src/lib/firebase.ts`, `analytics-consent.ts`, `CookieConsent.tsx`, `public/content/legal/cookies.mdx`.

**Відтворення/причина:** acceptance запускав asynchronous bootstrap; queued grant не перевіряв подальший rejection. Consent flags самі не вимикали collection. Спільний layout міг завантажувати Analytics на документах після збереженої згоди, хоча cookie-політика описує документи без аналітичного скрипту. Grant також охоплював advertising-поля, попри analytics-only опис.

**Вплив і виправлення:** gate перевіряє актуальний вибір до SDK init та queued grant; rejection вимикає `setAnalyticsCollectionEnabled`. Advertising-поля завжди denied. `isAnalyticsPage` дозволяє Analytics лише на `/uk` та `/en` після згоди; на docs/auth collection вимикається. Політика описує окремий website key, scope та footer control без зміни обіцянок щодо зовнішнього app.

**Перевірка:** тести revoke-race, advertising denied і allowed paths; браузер acceptance → direct document load: Google Analytics/Tag Manager script URLs відсутні, банер сам не відкривається; footer preferences працює. Транспорт усіх можливих GA events та cloud retention не інспектувалися. **Статус: виправлено.**

### P1 — Mobile header втрачав частину destinations

**Джерело:** `src/components/layout/Header.tsx`.

**Відтворення/причина:** desktop і mobile мали окремі неповні структури. Перехід на вузький екран прибирав доступ до частини документів/підтримки з header.

**Виправлення:** спільна конфігурація трьох груп та всіх destinations; mobile panel має обмежену висоту і scroll. «Можливості» вилучено в обох варіантах.

**Перевірка:** mobile 390/768, breakpoint 1023/1024, усі 8 destinations; export-test перевіряє еквівалентні links. **Статус: виправлено.**

### P2 — Header disclosure не мав повної клавіатурної поведінки

**Джерело:** `Header.tsx`.

**Проблема:** hover-залежність/розмиття фокуса не давали стабільного keyboard access та повернення після закриття. Непослідовні labels/active markers ускладнювали розуміння.

**Виправлення:** click-toggle, `aria-expanded/controls`, current-page state, Escape з поверненням фокуса, закриття поза header/при виході фокуса/зміні breakpoint, cleanup listeners, skip link. Панель немодальна.

**Перевірка:** всі desktop groups, Tab із видимим outline, Escape/focus return, outside click та mobile dismissal у браузері; stacking оглянуто на кількох ширинах. **Статус: виправлено.**

### P2 — Hero обрізався на маленькому телефоні

**Джерела:** `Hero.tsx`, `globals.css`, `PixelDisplay.tsx`.

**Відтворення:** viewport 360; intrinsic grid column залишалася приблизно 400px, хоча document overflow був прихований. Це обрізало copy/CTA, тому лише перевірка scrollWidth не виявляла проблему.

**Виправлення:** `minmax(0,1fr)`, `min-w-0`, bounded badge та responsive heading; декоративний pixel layer не перехоплює pointer. За уточненням користувача 13.10.2026 повернуто початкову видимість анімації: додані під час аудиту два `opacity-15` множилися до 2.25% й робили її майже непомітною. Обидва додаткові opacity прибрано; оригінальний renderer і рух збережено.

**Перевірка:** візуальний огляд 360/390 та DOM виміри всіх шести ширин; [after-home-360](audit-evidence/after-home-360.jpg). **Статус: виправлено.**

**Перевірка відновлення анімації:** production build і lint пройшли повторно; Graphify оновлено. На 3440×1271 та 390×844 canvas відповідає ширині сторінки, додаткового opacity й horizontal overflow немає. У двох кадрах після стабілізації теми змінилися 389429 із 420000 пікселів області фону поза UI — рух підтверджено. Console warn/error порожні. [Кадр A](audit-evidence/restored-hero-animation-frame-a.png), [відновлений головний екран](audit-evidence/restored-hero-animation.png). Попередні after-home знімки відображають стан початкового аудиту, до цього уточнення користувача.

### P2 — Fixed legal sidebar перекривав footer

**Джерела:** `LegalDocument.module.css`, `LegalDocument.tsx`.

**Відтворення:** desktop document прокрутити до кінця; sidebar залишався fixed `top: 96px`, коли footer вже починався близько 207px. [До](audit-evidence/before-legal-sidebar-footer.jpg).

**Виправлення:** sticky від 1024px, обмежений reader-container; на телефоні/планшеті звичайний потік.

**Перевірка:** усі шість ширин та кінець документа; sidebar виходить з viewport перед footer. [Після](audit-evidence/after-legal-sidebar-footer.jpg). **Статус: виправлено.**

### P2 — Stale legal manifest і cached 404 ламали читання/retry

**Джерела:** `LegalDocumentClient.tsx`, `package.json`, `scripts/update-legal-manifest.mjs`, `public/content/legal/manifest.json`, `scripts/serve-static-export.mjs`.

**Відтворення:** змінений документ не відповідав старому SHA256; ручний direct build міг не оновити manifest. Тимчасово відсутній licenses asset давав 404; після його повернення retry повторно використовував cached response. Асинхронні відповіді також потребували guard після cleanup.

**Виправлення:** prebuild автоматично генерує manifest; Firebase build використовує той самий npm build. Retry перечитує manifest та asset із `no-store`; normal fetch поважає HTTP cache. Race guard у effect; preview 404 має no-store. Loading/error/retry copy локалізовано.

**Перевірка:** licenses asset тимчасово перейменовано лише всередині `out/`, показано помилку, файл повернено й retry завантажив 5 секцій. Усі тимчасові файли відновлено. Тести перевіряють 10 hashes; усі 10 reader routes завантажені. [Помилка](audit-evidence/legal-load-error.jpg). **Статус: виправлено.**

### P2 — Білий текст губився на світлих картках і CTA

**Джерела:** `LessonCard.tsx`, `card-contrast.ts`, `AppearanceDemo.tsx`, `TasksDemo.tsx`, `Platforms.tsx`, `AuthAction.module.css`, `globals.css`, `features.module.css`.

**Відтворення:** appearance gradient `#4facfe → #00f2fe` із білими labels, м’ятна primary/auth кнопка з білим текстом, слабкі secondary/feedback colors. [Картка до](audit-evidence/before-appearance-contrast.jpg).

**Виправлення:** shared LessonCard вибирає foreground по всьому градієнту або мінімальний black scrim; labels непрозорі. Active time chip зберігає окрему контрастну theme surface, без перезапису світлим chip background. Tasks мають scrim для чинної палітри. Web CTA — dark text на pink; auth — brand-strong/site-bg. Secondary/success/error/дрібний акцентний текст використовують контрастні tokens; editor blue — `#2563eb`.

**Перевірка:** тести на 101 точці bright/dark/mixed gradients, HSL та обох темах; активні shared consumers оглянуто в preview/editor, floating schedule та accent cards. У браузері active time chip: світлий текст на майже чорному у light, темний на білому у dark. Це не формальна сертифікація всіх пікселів WCAG. **Статус: виправлено.**

### P2 — Cookie banner стискав текст і не дозволяв повернутися до вибору

**Джерела:** `CookieConsent.tsx`, `Footer.tsx`, `cookie-preferences.ts`.

**Відтворення:** опис і три shrink-fixed дії ділили один ряд, залишаючи вузьку колонку тексту та надмірну висоту. Після dismissal не було persistent control; legacy preference без дати не мала терміну оновлення. [До](audit-evidence/before-cookie-desktop.jpg).

**Виправлення:** опис на повній ширині, actions нижче, mobile column, bounded height/scroll, accept/reject однакової ієрархії; footer preferences із focus/return focus. Dated choice діє до 365 днів, legacy/malformed/future/expired поновлюються; недоступне storage не ламає вибір у поточній сесії.

**Перевірка:** reject, accept, reopen, persistence після переходу/reload, focus та 390/768/880 layout; при 880×900 висота близько 216px. [Після](audit-evidence/after-cookie-880.jpg). Unit tests expiry/invalid records. **Статус: виправлено.**

### P2 — Mobile editor мав нестійке sticky-позиціонування

**Джерела:** `features/features.module.css`, `DemoPrimitives.tsx`.

**Проблема:** composite sticky preview/editor, viewport arithmetic та spacer ускладнювали прокручування й доступ до controls на короткому екрані; довгі strings могли розширити рядки.

**Виправлення:** preview/editor у звичайному mobile flow, bounded editor body `clamp(280px,50svh,420px)`, desktop 480px; labelled focusable scroll region, wrapping fields/task text. Усі чотири функціональні демо збережено.

**Перевірка:** усі чотири editor на 360/390/768/1024/1440/1920 без внутрішнього horizontal overflow; create/save/cancel/reset/validation сценарії за інвентарем. [Phone lesson](audit-evidence/after-lesson-390.jpg), [tablet tasks](audit-evidence/after-tasks-768.jpg). **Статус: виправлено.**

### P2 — Недостатні targets, focus та offsets повторювалися між компонентами

**Джерела:** globals, Header/Footer/ThemeToggle, FloatingSchedule, features CSS, locale layout.

**Проблема:** дрібні icon buttons/switches, відсутність єдиного visible focus та подвійне врахування sticky offset; decorative icons затісняли compact calendar.

**Виправлення:** основні controls від 44px, switch має 44px hit area навколо компактної track; глобальний focus-visible, main skip target, semantic names/pressed states; один механізм anchor offset, calendar decoration прихована на phone. Фінальний phone screenshot також виявив обрізання місяця/року: date label тепер переноситься замість `truncate`.

**Перевірка:** Tab/Enter/Space на доступних controls, footer `#features` близько 88px нижче viewport top при header 64px, feature anchor 86px, legal anchor 112px; відсутні missing anchors. Compact weekday width <44px — документований виняток у DESIGN.md, height 44px. **Статус: виправлено.**

### P2 — Зміна мови губила query/hash account actions

**Джерела:** `Header.tsx`, `site.ts`.

**Відтворення:** locale switch на section deep link чи auth link реконструював лише pathname. Це втрачало позицію або потрібний action context.

**Виправлення:** `buildLocaleUrl` зберігає query/hash/action code, оновлює `lang` та nested continueUrl language; malformed continuation залишено валідатору auth. Повний перехід застосовує правильний locale static document.

**Перевірка:** UK/EN section query/hash, browser back/forward, auth locale change із недійсним тестовим кодом; unit tests malformed URL та nested continuation. **Статус: виправлено.**

### P2 — Root dead end, різні origins та некоректні social assets

**Джерела:** `(entry)/page.tsx,layout.tsx`, `site.ts`, locale/auth/legal metadata, sitemap/robots, social GET handlers, preview/Firebase config.

**Проблема:** `/` не мав змістовного entry; частина canonical використовувала app origin. Автоматичні image metadata могли містити localhost, а extensionless PNG preview віддавав з некоректним MIME. Під час перевірки встановленої Next версії route-group image convention також давала suffixed URL, тому потрібні stable endpoints.

**Виправлення:** початковий статичний locale chooser замінено автоматичним переходом за запитом користувача від 18.10.2026 (див. нижче); website `SITE_URL` окремо від `APP_URL`; абсолютні canonical/social metadata. Спільний image renderer і force-static GET `/opengraph-image` та `/twitter-image`; PNG MIME в preview і hosting config. Preview використовує redirects із firebase.json, включно з cookies/licenses, та зберігає query.

**Перевірка:** production build без metadata warnings, всі локальні href/src assets існують, root/metadata HTTP 200, PNG signature/MIME, всі 10 redirect 301 і real 404. Реальний hosting-response після deployment не перевірявся. **Статус: виправлено.**

### Оновлення 18.10.2026 — Автоматичний вибір мови на `/`

**Запит:** прибрати проміжну сторінку зі скриншота й автоматично відкривати сайт потрібною мовою.

**Зміна:** `(entry)/page.tsx` більше не рендерить selector. Самодостатній inline script із `src/lib/locale-redirect.ts` виконується в head entry layout: валідний `planit:locale` → cookie `NEXT_LOCALE` → перша підтримувана мова браузера → українська. Використовує чинний `LocalePreference`, зберігає query/hash та замінює entry у history. Явні локалізовані URL не перенаправляються. За вимкненого JS статичний `noscript` meta refresh відкриває `/uk`.

**Перевірка:** lint, typecheck, 22 unit-тести, production build та 7 export/HTTP-тестів пройшли. Тести виконують фактичний inline script із `out/index.html`, перевіряють regional language tags, порядок мов, cookie/storage fallback, заблоковані сховища, default, query/hash, відсутність selector та script у `/uk` і `/en`. Chrome на `localhost:4173`: reload `/` → `/uk`; header switch → `/en`; повторний вхід `/?source=locale-check#features` → `/en?source=locale-check#features`; повернення UK і повторний `/` → `/uk`. У console зафіксовано лише помилку стороннього Chrome extension, без помилок застосунку. JS-off, інші браузери та production hosting окремо не перевірялися; візуальна матриця розмірів/тем не повторювалася, оскільки проміжний UI видалений. **Статус: виправлено локально.**

### P3 — Motion і theme синхронізація створювали зайву роботу

**Джерела:** ThemeProvider, PageTransition/ScrollReveal, ribbon, Hero, BentoCard, Footer, BreakCard, FloatingSchedule, CallToAction та globals.

**Проблема:** окремі decorative loops/tilt/entrances не враховували reduced motion; theme MutationObserver міг боротися з власним DOM update, storage errors не мали надійного fallback.

**Виправлення:** спільний MotionConfig/user, useReducedMotion у активних компонентах, static wrapping ribbon при reduction, CSS зупиняє smooth scroll/loops; useSyncExternalStore та очищені media/storage/custom listeners, валідоване theme storage.

**Перевірка:** themes, route changes та console у звичайному режимі; code review reduced branches/cleanup. OS reduced-motion runtime і вимірювання CPU/GPU залишаються неперевіреними. **Статус: виправлено в коді; runtime reduced motion потребує окремої перевірки.**

### P3 — Неузгоджена copy, support URL та декоративна семантика

**Джерела:** Platforms/Header/Footer, legal components, uk/en translations, InfiniteRibbon/Hero.

**Проблема:** iOS текст описував конфігурацію замість зрозумілого статусу; support адресу було не узгоджено з офіційними документами; legal shell англійською у UK UI; repeated decorative ribbon міг дублювати оголошення.

**Виправлення:** чесний disabled iOS «У розробці» з browser alternative; спільний `SUPPORT_URL`; локалізовані legal labels/errors/loading та `lang=en`/notice для офіційного тексту; clones/decorations aria-hidden.

**Перевірка:** обидві локалі, парність translation keys, destinations, platform wrapping, legal full bodies. Публічні product claims зовнішнього app/native builds не підтверджені незалежним продукт-тестом. **Статус: виправлено.**

### P3 — Graphify update script запускав неправильний режим

**Джерело:** `package.json`, `scripts/graphify.ps1`.

**Відтворення:** `npm.cmd run graphify:update` передавав `. --update`; встановлений CLI запускав full semantic extraction і завершувався помилкою про відсутній API key для 42 документів/зображень. Це суперечило обіцяному AST-only workflow AGENTS.md.

**Виправлення:** script передає підтримуваний `update .`. **Перевірка:** фінальна npm-команда завершилася exit 0 без LLM: 837 nodes, 1340 edges, 67 communities; оновлено graph.json, graph.html та GRAPH_REPORT.md. Semantic re-extraction документів і LLM community naming не виконувалися й не заявляються. **Статус: виправлено.**

## Фактичні результати перевірки

| Команда | Фінальний результат |
| --- | --- |
| `npm.cmd run lint` | PASS, exit 0 |
| `npm.cmd run typecheck` | PASS, exit 0 |
| `npm.cmd test` | PASS, 11/11: consent expiry/race/scope, locale context, contrast, hashes, translation parity |
| `npm.cmd run build` | PASS, Next 16.2.9, згенеровано 34/34 static entries; legal manifest `d2fbf1eeae412824` |
| `npm.cmd run test:export` | PASS, 5/5: nav/anchors, canonical, internal assets, social metadata, preview HTTP/redirect/404 |
| `npm.cmd run graphify:update` | PASS, exit 0, AST-only: 837 nodes, 1340 edges, 67 communities |
| `git diff --check` | PASS, exit 0; фінальний diff переглянуто, unrelated dirty changes збережено |

Раніше тестових scripts не було. Нові Node tests використовують наявний TypeScript для pure modules, без нового test framework. Тести перевіряють поведінкові інваріанти та реальний static export; browser сценарії залишаються окремими ручними перевірками.

**Responsive:** головна та всі чотири editor — 360, 390, 768, 1024, 1440, 1920px; reader — ті самі ширини; додатково 880 cookie та 1023/1024 header. Немає виявленого horizontal document/editor overflow у записаних вимірах. Обидві теми оглянуто в репрезентативних desktop/mobile станах, але не кожну комбінацію route × width × theme.

- [Home measurements](audit-evidence/browser-verification.json)
- [Features measurements](audit-evidence/features-responsive-verification.json)
- [Legal measurements](audit-evidence/legal-responsive-verification.json)
- [Desktop home](audit-evidence/after-home-1440.jpg), [wide home](audit-evidence/after-home-1920.jpg), [tablet home](audit-evidence/after-home-768.jpg)
- [Header/features до](audit-evidence/before-header-and-demos.jpg) → [після](audit-evidence/after-features-desktop.jpg)
- [Desktop dropdown](audit-evidence/after-desktop-menu.jpg), [1024 features](audit-evidence/after-features-1024.jpg), [390 legal](audit-evidence/after-legal-390.jpg)

**Interactions:** desktop disclosures, mobile menu, keyboard/Escape/focus, locale links/back/forward, anchor landing, cookie accept/reject/reopen/persistence, lesson validation/save/cancel/reset, appearance color/icon/keyboard angle, tasks empty/create/edit/complete/filter, schedule recalc/invalid duration/switch/save/reset, floating empty/reset, legal retry, auth dispatch/errors. Фінальні console warn/error logs у production tab порожні; це спостережені сценарії, а не гарантія відсутності помилок за всіх conditions.

## Неперевірені та заблоковані області

| Статус | Область | Конкретна причина / що потрібно |
| --- | --- | --- |
| Заблоковано | Успішні resetPassword/verifyEmail/recoverEmail, password form у runtime | Немає валідних одноразових Firebase codes/тестового account workflow. Невалідний код та parameter errors перевірено; справжній password/email/account не змінювався. Для завершення потрібен окремий тестовий акаунт і дійсний код |
| Неперевірено | Реальний zoom 200% | Shortcut інструмента не підтвердив зміну масштабу. Responsive widths не підміняють zoom-тест. Потрібен manual browser zoom із перевіркою reflow/focus |
| Неперевірено | OS reduced motion у runtime | Доступний browser API не має media-preference emulation. Код/CSS reviewed; потрібен системний режим Reduce motion та ручний прохід |
| Неперевірено | Safari/Firefox, native phone, screen reader, touch device | Доступний один In-app Browser. Keyboard та DOM names reviewed, але реальну AT/touch перевірку не заявлено |
| Неперевірено | Formal performance/CLS/CPU/GPU та inactive canvas runtime | Немає профілювання/benchmark у цьому проході; inactive components не монтуються на поточних routes. Перевірено constraints/lifecycle у source |
| Поза доступним покриттям | Зовнішній web/native app, Google Play install, cloud Firebase authorization/rules, production hosting | Цей репозиторій — static marketing/legal/auth frontend; server API/security rules та app source тут відсутні. Destinations/config reviewed, застосунки не встановлювалися, cloud settings не змінювалися |
| Закрито 14.10.2026 | Український переклад юридичних документів | Користувач надав переклади в головному проєкті PlanIt. Сайт імпортує їх без створення власного перекладу; результати інтеграції наведені нижче |

Підтверджених невиправлених дефектів у перевірених сценаріях після фінального проходу не залишено. Цей висновок обмежений інвентарем вище. Майбутні UI-зміни мають виконувати checklist DESIGN.md та оновлювати звіт, якщо покриття чи поведінка зміняться.

## Правки за візуальним відгуком — 14.10.2026

- `LessonPreview` у демо заняття та оформлення явно використовує білий текст та іконки. `LessonCard` поважає наявне поле `textColor`; явний колір зберігає градієнт без scrim. Виняток до автоматичного контрасту на світлих палітрах за прямим запитом користувача описано в DESIGN.md.
- Видалено «Зміни видно одразу», декоративну крапку під обома preview, відповідні стилі та ключі перекладів uk/en. Назва «Картка предмета» залишається нейтральною.
- Google Play у футері зберігає текст, URL і focus, але більше не містить миготливого кружка. Іконка недоступного iOS CTA також статична.
- «Онлайн» вебверсії використовує окремий рожевий `brand-pink-strong` в обох темах. Контраст на рожевій поверхні статусу: 5.18:1 у світлій темі та 5.01:1 у темній.

**Автоматичні перевірки:** lint, typecheck, 11/11 unit tests, build (34/34 static entries), 5/5 export tests та `git diff --check` — PASS. Graphify оновлено AST-only без LLM: 837 nodes, 1340 edges, 67 communities. Семантичне переіндексування документів не виконувалося.

**Браузер:** у production preview `/uk` перевірено DOM та computed styles на 360, 390, 768, 1023, 1024, 1440 і 1920px у світлій та темній темах. В обох демо всі п’ять labels білі, видаленого підпису немає, нижнє посилання Google Play має лише текст; document overflow не виявлено. Перемикання на один колір, save/cancel/reset та disabled iOS перевірені в runtime. Console warn/error за цими сценаріями порожні. Це цільова перевірка змінених елементів; повний маршрутний аудит, zoom 200%, системний reduced motion та інші браузери повторно не перевірялися.

- [DOM-виміри в обох темах](audit-evidence/feedback-verification.json)
- [Картка з білим текстом](audit-evidence/feedback-card-dark-1440.jpg)
- [Платформи у темній темі](audit-evidence/feedback-platforms-dark-1440.jpg)
- [Google Play без кружка](audit-evidence/feedback-footer-dark-1440.jpg)

## Локалізовані документи PlanIt — 14.10.2026

Джерело за прямим запитом користувача: `D:\GitHub\ArtomkDev\PlanIt\content\legal` та підкаталог `uk`. Обидва репозиторії спочатку перевірено через Graphify, потім підтверджено власників, генератори, публікацію та споживачів у source. Файли головного проєкту не змінювалися; незакомічені зміни в обох проєктах збережено.

Сайт імпортує п’ять англійських оригіналів та п’ять наданих українських перекладів, використовує наявну перевірку перекладів і генератор loading MDX головного проєкту. Manifest має локалізовані paths, metadata та SHA256; його version залежить від обох мов. Старий `documents` з англійськими paths збережено для сумісності. `/uk/wiki/*` читає `/content/legal/uk/*.mdx`, `/en/wiki/*` — англійські файли. Заголовки, дати, SEO, language attributes, loading prefetch та ключі кешу відповідають локалі. Повідомлення про англійський текст в українському UI видалено.

Перевірка телефону виявила overflow звичайних URL у перекладі privacy; `overflow-wrap: anywhere` прибирає його без зміни юридичного тексту. Sanitizer та перевірка хешів збережені. `legal:publish` синхронізує, збирає й публікує наявний Hosting target `legal` (`planit-hub`); помилка синхронізації чи збірки зупиняє deploy. Поєднання локалізованої публікації з `-SkipBuild` відхиляється, щоб не завантажити застарілий export.

**Перевірки:** lint, typecheck, 12/12 unit tests, build (34/34 static entries), 6/6 export tests, main-project `legal:check` та `git diff --check` — PASS. Manifest: `9ad97f1ed1971459`. Усі 20 MDX assets доступні через preview HTTP та збігаються з файлами; хеші перекладів відповідають англійським джерелам. Повну команду `legal:publish` виконано з `-SkipDeploy`: синхронізація та build успішні, Firebase не викликався. Окремий негативний сценарій з відсутнім source завершується exit 1 до build/deploy. Реальна серверна публікація залишена користувачу, який просив команду.

Graphify оновлено AST-only: 879 nodes, 1443 edges, 80 communities. Семантичне переіндексування юридичних текстів і LLM-перейменування communities не виконувалося.

**Браузер:** повний runtime body, H1 та `lang` перевірені для всіх десяти адрес; перемикання EN → UK через header оновлює документ. Український privacy перевірено на 360, 390, 768, 1023, 1024, 1440, 1920px в обох темах: document та article overflow відсутній після виправлення. Console warn/error порожні. Це перевірка локального production export; screen reader, реальний zoom 200%, OS reduced motion та production HTTP повторно не перевірялися.

- [Runtime-документи та адаптивність](audit-evidence/localized-legal-verification.json)
- [Український читач](audit-evidence/localized-legal-uk-1440.jpg)
- Команда публікації та локальна підготовка: [README.md](README.md#sync-and-publish-both-languages)

## Єдині листи акаунта — 17.10.2026

Додано `verifyAndChangeEmail` до наявної сторінки дій акаунта. Підтвердження
реєстрації, зміна адреси та її відновлення перевіряють тип коду Firebase до
`applyActionCode`; змінений у URL `mode` не може застосувати іншу операцію.
Нова адреса відображається в локалізованому повідомленні успіху, яке має
`role="status"`; довгі адреси переносяться. Наявні зміни сайту збережено.

Автоматичні перевірки: lint, typecheck, 17/17 unit tests, production build
(34 static entries) і 6/6 export tests — PASS. Тести успішних, недійсних та
прострочених кодів використовують підміну Firebase, без зміни реальних акаунтів.
В основному репозиторії також пройшли 17 перевірок клієнта/політики паролів і
25 перевірок Functions, шаблонів та конфігурації системних листів.

У браузері локального production export перевірено новий loading-state,
помилку недійсного коду українською й англійською та перемикання мови зі
збереженням `mode`, `oobCode` і `lang`. Оглянуто desktop-відображення. Успіх
на реальному акаунті, повну матрицю viewport/zoom/reduced motion та production
не перевіряли. Публікація сайту/Functions і застосування шаблонів Firebase
не виконувалися; порядок та команди є у `../PlanIt/functions/README.md`.
