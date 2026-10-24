# Аудит PlanIt

Дата: 13.10.2026. Об’єкт: цей репозиторій та його локальний production static export. Результат — реалізовані виправлення, регресійні перевірки й конкретний посібник [DESIGN.md](DESIGN.md). Сайт не оголошується бездоганним: нижче розділені браузерні перевірки, HTTP/автоматичні перевірки, source review та недоступні сценарії.

## Оновлення однією командою та безпечне додавання сторінок — 24.10.2026

За запитом користувача реалізовано npm run site:update: налаштування в site.config.json, збереження Google ownership proof за hash, read-only sync legal sources, lint/unit/build із TypeScript, автоматичні sitemap та SEO inventory з фактичного HTML, перевірка export, контроль видалених адрес, upload лише website Hosting target і HTTP-перевірка живого випуску. Старі PowerShell deploy-команди делегують той самий workflow. site:check виконує підготовку без upload; page:new створює безпечну двомовну чернетку. Докладна [інструкція](docs/WEBSITE_WORKFLOW.md).

Перший приклад — getting-started. Контент редагується у src/content/pages.json; metadata, мовні версії, structured data, sitemap і footer links формуються автоматично. Загальний helper createPageMetadata використовується також юридичними сторінками й не дублює назву PlanIt у title. Дублікат /[locale]/wiki має 301 на /[locale]/wiki/terms; global header не змінювався.

**Перевірено фактичним запуском:** site:check завершився без upload; стандартний site:update зібрав і опублікував production 19f67539d019939e1a6ec80fd1d63818d1afe8602f59a75305fcd2aaa6b5a85f. Сайт містить 15 URL, дозволених до індексації, 35 static entries; Google HTML proof збережений і перевірений через HTTP. Окремо пройшов preview із --skip-build та строком 1h; його URL отриманий із JSON Firebase й також пройшов повну live-перевірку. Опублікований основний застосунок не змінювався.

**Автоматично:** lint без попереджень, 66/66 unit tests, TypeScript/build, 10/10 export tests, check:seo, check:export, production/preview check:live та git diff --check — PASS. Нові поведінкові перевірки ловлять неправильний успадкований canonical, відсутню мовну пару, дубль title, зламане внутрішнє посилання, зниклий/змінений Google proof, видалення старого URL без постійного redirect, цикли redirect і продовження workflow після помилки. CLI page:new перевірено в ізольованому тимчасовому каталозі: створення draft, повторний slug, конфлікт із custom route та path traversal; при помилці файл контенту не змінюється. PowerShell wrapper пройшов синтаксичну перевірку. Graphify оновлено AST-only: 1137 nodes, 1856 edges, 98 communities.

**Браузер на опублікованому сайті:** 28 комбінацій uk/en × світла/темна × 360/390/768/1023/1024/1440/1920px; document overflow, обрізання H1/H2/footer links і зайвого H1 не виявлено. Перехід із нового посилання футера працює, зміна мови зберігає query/hash і змінює canonical. [Матриця](audit-evidence/site-workflow-2026-10-24/responsive.json), [desktop](audit-evidence/site-workflow-2026-10-24/guide-desktop.png), [mobile](audit-evidence/site-workflow-2026-10-24/guide-mobile.png), [випуски](audit-evidence/site-workflow-2026-10-24/releases.json).

Межі: workflow зберігає наявне підтвердження Google та стабільний URL sitemap; він не надає нових прав Search Console, не обходить CAPTCHA/квоти й не гарантує індексації. Читання нового sitemap сервісом Google у цьому запиті повторно не запускалося. Реальні OS reduced motion, screen reader, touch і zoom 200% не перевірялися повторно; новий текстовий шаблон не додає власної анімації. Стан основного застосунку не редагувався.

## Повний аудит, виправлення та пошук Google — 24.10.2026

За запитом власника реалізовані виправлення сайту з повного аудиту: SEO origin, двомовна sitemap, WebSite/SoftwareApplication identity, indexable root, FAQ, перший екран, шлях початку, правдиві продуктові умови, контраст, consented conversion events і перевірена публікація. Основний застосунок не змінювався. Детальний статус A01–A17, тести, браузерні докази, межі та зовнішні перевірки — у [SITE_FIXES_2026-10-24.md](docs/audits/SITE_FIXES_2026-10-24.md). Початковий [аудит 20.10](docs/audits/SITE_AUDIT_2026-10-20.md) збережено як історичний доказ.

## Більші редактори та симетричне піксельне тло — 18.10.2026

За прямим запитом користувача зі скриншотом прибрано нижній підпис про локальність демо з усіх чотирьох блоків, його CSS і обидва переклади. У DESIGN.md замінено попередню вимогу зберігати цей підпис та зафіксовано джерело винятку. Максимальна ширина редактора збільшена з 420 до 460px; область вмісту — з 480 до 520px. На телефоні body використовує clamp(300px,56svh,480px) та звичайне прокручування.

Stage тепер має висоту лише редактора, без додаткового padding і caption. Єдиний inset-block піксельного тла дає однаковий виступ рамки зверху й знизу: 32px на desktop/tablet та 24px на телефоні. Фактичний DOM-вимір desktop: рамка 460 × 668px, верхній і нижній виступи рівно по 32px. Усі чотири редактори мають однакові розміри. Зміна стосується геометрії; renderer, розмір пікселів, палітра й інтерактивні стани залишаються чинними.

**Перевірки:** lint, 34/34 unit tests, production build із TypeScript (34 static entries), 7/7 export tests та git diff --check — PASS. Нових тестів, що дублюють CSS, не додано. Graphify оновлено AST-only: 942 nodes, 1536 edges, 84 communities.

**Браузер:** перевірено 28 комбінацій uk/en × світла/темна × 360/390/768/1023/1024/1440/1920px, по чотири редактори. Stage і рамка мають однакову висоту, top/bottom insets збігаються, caption відсутній; document/body horizontal overflow не виявлено. Додатково оглянуто 360 × 667, 390 × 844 і 768 × 480. Keyboard PageDown працює в усіх чотирьох областях; у налаштуваннях перевірено перерахунок часу, save/cancel/reset, у завданнях — відкриття й скасування редактора зі збереженням розмірів. На телефоні кнопка збереження доступна через звичайне прокручування. Console warn/error порожня. OS reduced motion, реальний zoom 200%, screen reader, native touch і повний маршрутний аудит повторно не виконувалися.

- [Темна тема](audit-evidence/larger-demo-dark.jpg)
- [Світла тема](audit-evidence/larger-demo-light.jpg)
- [Мобільний редактор](audit-evidence/larger-demo-mobile.jpg)
- [Розміри, симетрія та взаємодія](audit-evidence/larger-demo-verification.json)

## Нейтральні назви занять — 18.10.2026

За прямим запитом користувача загальна назва навчальної події — «заняття»: продукт орієнтований на студентів і також підходить школярам. Узгоджено відмінки й рід у вступі, заголовках можливостей, описах, підказках, демо налаштувань, рядку переваг, картці матеріалів, preview нагадування, футері та SEO-описі. Загальне поле місця тепер «Місце» / Location. Англійські Lesson duration та lesson reminders узгоджено з class/classes. Правило закріплено в DESIGN.md; конкретні типи занять залишаються варіантами вибору.

**Пошук:** перевірено всі 436 текстових значень у кожному з двох словників, а також source-компоненти, metadata, статичні HTML і документи. У видимих перекладах згадок «пара» / «урок» з відмінками та lesson/lessons немає. Технічні імена компонентів, translation keys і стабільні ID з lesson збережено. «Пари ключ–значення» у юридичному описі localStorage означають структуру даних, тому не потребують заміни.

**Перевірки:** lint, 34/34 unit tests, production build із TypeScript (34 static entries), 7/7 export tests та git diff --check — PASS. Нових тестів для редагування копії не додано. Graphify оновлено AST-only: 941 nodes, 1535 edges, 80 communities.

**Браузер:** 28 комбінацій uk/en × світла/темна × 360/390/768/1023/1024/1440/1920px. У rendered text, accessibility attributes і meta description застарілих загальних назв не знайдено; document overflow та горизонтального обрізання перевірених заголовків/описів немає. Оглянуто довший заголовок заняття на 390px та картки на desktop. Console warn/error порожня. Повний аудит маршрутів, OS reduced motion, реальний zoom 200%, screen reader та native touch повторно не виконувалися.

- [Нейтральні назви в картках](audit-evidence/neutral-terminology-desktop.jpg)
- [Заголовок і демо на телефоні](audit-evidence/neutral-terminology-mobile.jpg)
- [Тексти та responsive-перевірка](audit-evidence/neutral-terminology-verification.json)

## Оновлення й копіювання прикладу коду — 18.10.2026

Натискання на код запускає нову випадкову комбінацію з чинним нерівномірним проявленням символів. Окрема кнопка копіює завершений код і показує коротке «Скопійовано»; помилка має локалізований текст. Якщо натиснути під час перебору, спершу фіксується кінцева комбінація, щоб буфер збігався з показаним кодом. Швидкі повторні натискання скасовують попередній таймер. Автоповтор призупинений під час наведення чи фокуса на кнопках, а після взаємодії повертається з довгою випадковою затримкою.

Sharing-preview тепер доступний assistive technology; дві native кнопки мають назви й опис поточного коду українською та англійською. Перебір декоративний, повідомлення копіювання — role=status. Мінімальний target 44px, глобальний focus збережено. Іконки змішують локальний amber з основним текстом: контраст 4.74:1 у світлій та 10.93:1 у темній темі. Підпис «Приклад» збережено: реальні коди поширення створюються у PlanIt. Виняток із декоративних preview описано в DESIGN.md.

**Автоматичні перевірки:** lint без попереджень, typecheck, 34/34 unit tests, production build (34 static entries), 7/7 export tests та git diff --check — PASS. Чотири нові поведінкові тести перевіряють повторну генерацію під час перебору, паузу/відновлення, завершений код для копіювання та статичну генерацію при reduced motion. Graphify оновлено AST-only: 940 nodes, 1534 edges, 75 communities; після фінальних CSS-правок топологія не змінилася.

**Браузер:** native mouse-click, п’ять швидких повторних натискань, Enter/Space, Tab до копіювання, видимий focus і реальний буфер перевірені. На фінальній збірці код у буфері збігається з показаним після копіювання під час анімації. Перше негайне читання clipboard-адаптером повернуло порожній рядок; подальші читання підтвердили значення. При фокусі код залишався сталим 12.5 секунд. Перевірено 28 комбінацій: uk/en × світла/темна × 360/390/768/1023/1024/1440/1920px. Кнопки не приховані aria-hidden, розміри щонайменше 44px, document/control overflow не виявлено. Console warn/error порожня. Реальну відмову clipboard permission, OS reduced motion, screen reader, touch-пристрій та zoom 200% не перевіряли; reduced motion покритий controller-тестом і source/CSS review.

- [Готові кнопки та підтвердження](audit-evidence/everyday-code-actions.jpg)
- [Телефон](audit-evidence/everyday-code-actions-mobile.jpg)
- [Дії, буфер, responsive та контраст](audit-evidence/everyday-code-actions-verification.json)

## Внутрішні анімації в кольорах карток — 18.10.2026

За прямим запитом користувача декоративні анімації AppShowcase більше не використовують глобальний brand-strong. Єдиний локальний --preview-accent надходить із поля color відповідної картки, яке вже задає її hover-світло: sharing rgb(245,158,11), exports rgb(99,102,241), reminders rgb(6,182,212), materials rgb(16,185,129), widgets rgb(244,63,94), sync rgb(139,92,246). На нього переведено обводку форматів, перебір/проявлення коду, кольорові іконки preview та лінію віджета. Основний текст і завершений код нейтральні; global brand і правила повторного запуску/згасання не змінювалися.

**Перевірки:** lint, production build із TypeScript (34 сторінки), 30 unit tests, 7 export tests та git diff --check — PASS. Graphify оновлено AST-only: 939 nodes, 1531 edges, 81 communities.

**Браузер:** у темній і світлій темах перевірено всі шість --preview-accent та фактичні computed color/border внутрішніх деталей. Вони відповідають локальному кольору; під час анімації форматів підтверджено фіолетовий shadow разом із рухом. Значення глобального brand лишилися #3EF7D2 і #F45B8A. На 390px в обох темах document overflow не виявлено; console warn/error порожня. Це цільова перевірка кольорів на 1440/390px; повний responsive/route аудит та OS reduced motion заново не виконувалися.

- [Внутрішні деталі в кольорах карток](audit-evidence/everyday-card-colors.jpg)
- [Обидві теми та computed styles](audit-evidence/everyday-card-colors-verification.json)

## Надійний повторний запуск наведення — 18.10.2026

Виправлено регресію попереднього згасання: повторне active=true зберігало вже завершену CSS-анімацію, тому швидке повернення курсора не давало нового руху. Кожен pointerenter тепер збільшує cycle і перемонтовує лише декоративні елементи у display:contents. Вони отримують свіжі часові шкали, hover починається без intro-delay. Зовнішня поверхня preview та її --preview-motion-strength зберігаються, тому плавне згасання 480ms не втрачено. Зміни застосовуються до всіх п’яти hover-preview; автоматичний код не перезапускається від наведення.

**Перевірки:** lint, build із TypeScript (34 сторінки), 30 unit tests, 7 export tests та git diff --check — PASS. Graphify оновлено AST-only: 938 nodes, 1530 edges, 84 communities.

**Регресійний сценарій у production browser:** спочатку підтверджено завершений нерухомий стан документів. Потім п’ять разів виконано leave/re-enter з додатковими паузами 0, 70, 220, 650 і 0ms: цикли 2→3→4→5→6→7, кожного разу обчислені transform форматів знову змінювалися. Перевірка не обмежувалася назвами CSS-анімацій чи active-атрибутом. Окремо підтверджено реальний повторний рух нагадувань, матеріалів, віджета та синхронізації після їхнього завершення. Після виходу з останньої картки сила згасала 0.338165 → 0.0411867 → 0; cycle не змінювався, mode потім очищувався. У 14 адаптивних станах (360, 390, 768, 1023, 1024, 1440, 1920px; дві теми) переповнення не виявлено, console warn/error порожня. Інші браузери, OS reduced motion та zoom 200% окремо не перевірялися.

- [Оновлені картки](audit-evidence/everyday-hover-restart.jpg)
- [Повторні наведення, реальні transform і згасання](audit-evidence/everyday-hover-restart-verification.json)

## Плавне згасання після наведення — 18.10.2026

Виправлено різке обривання п’яти мікроанімацій при mouse leave. FeaturePreviewMotion тепер утримує поточний цикл та його delay, а CSS-властивість --preview-motion-strength керує амплітудою переміщень/обертання, opacity та прозорістю акцентної обводки. При відведенні курсора сила ефекту згасає за 480ms; keyframes прибираються через 520ms, коли всі візуальні значення вже нейтральні. Повторне наведення під час згасання зберігає цикл і розвертає зміну сили, без перемикання його затримок. Hidden/reduced-motion/unmount зупиняють роботу й очищають timeout, observer та pointer listeners. Автоматична посимвольна анімація коду та спільні hover/tilt BentoCard збережені.

**Перевірки:** lint, production build із TypeScript (34 сторінки), 30 unit tests, 7 export tests та git diff --check — PASS. Graphify оновлено AST-only: 937 nodes, 1529 edges, 76 communities.

**Браузер:** для форматів, дзвіночка, матеріалів, віджета та синхронізації записано серії після pointer leave. Сила плавно спадає до нуля, animation-name утримується під час згасання і потім прибирається. Наприклад, формати: 1 → 0.233713 → 0.0533197 → 0.00460902 → 0. Розраховані shadow alpha та translateY теж стають проміжними малими значеннями, а не скидаються одразу. Повторне наведення залишає mode=hover і delay=0s, повертаючи active та силу. У 14 станах (360, 390, 768, 1023, 1024, 1440, 1920px; дві теми) не виявлено document/text overflow; console warn/error порожня. Тексти не змінювалися. Інші браузери, OS reduced motion та zoom 200% окремо не перевірялися.

- [Огляд карток](audit-evidence/everyday-soft-exit.jpg)
- [Серії згасання та адаптивні виміри](audit-evidence/everyday-soft-exit-verification.json)

## Стримані анімації прикладів — 18.10.2026

Код у першій картці тепер складається з випадкових символів при появі у viewport та повторюється після нерівних пауз 6.5–11.5 секунд. Кожна позиція має власні затримки й 3–5 коротких переборів; готові символи м’яко проявляються акцентним кольором і повертаються до звичайного тексту. Шість фіксованих комірок зберігають ширину. SSR починається з PL7M2K, випадковість запускається лише після mount. У прихованій вкладці, поза viewport та при reduced motion таймер зупиняється; частковий код стає цілим. Cleanup і захист від відкладених observer callbacks прибирають повторні запуски після unmount.

П’ять інших preview мають одноразові мікроанімації при першій появі та наведенні: акцент форматів, дзвіночок, два матеріали, заняття віджета й стрілка/хмара синхронізації. Затримки між картками різні; рух 1–4px, без автоматичних циклів. Текст, функції та структура карток збережені. Усі ефекти лишаються декоративними, без нових focus targets чи live announcements. Reduced motion вимикає їх через media query.

**Перевірки:** lint, production build із TypeScript (34 сторінки), 30 unit tests та 7 export tests — PASS. Чотири нові поведінкові тести перевіряють незалежність таймінгів, завершення коду, нерівні довгі паузи, скасування роботи та повторний запуск без паралельних циклів. Graphify оновлено AST-only.

**Браузер:** у production preview підтверджені всі п’ять hover-анімацій із iteration-count 1; після відведення вказівника інші preview не мають активних animation-name. За 13 секунд видимий код змінився (959BXQ → 2WR6GQ), ширина залишилася 101.6875px. Після виходу за viewport наступні 13 секунд код не змінювався; повернення знову запускало проявлення. Для uk/en на 360, 390, 768, 1023, 1024, 1440 і 1920px в обох темах (28 станів) не виявлено document/text overflow або нових controls; console warn/error порожня. OS reduced motion, справжнє приховування вкладки, zoom 200% та інші браузери не емулювалися; ці lifecycle-гілки перевірено у source та модульному контролері.

- [Вигляд усіх карток](audit-evidence/everyday-motion-desktop.jpg)
- [Мобільний вигляд](audit-evidence/everyday-motion-mobile.jpg)
- [Runtime та responsive-виміри](audit-evidence/everyday-motion-verification.json)

## Повернення наведення та спрощення карток — 18.10.2026

У шести картках AppShowcase повернуто спільний ProximityBlock із блоків платформ: кольорова обводка іконки реагує на курсор, іконка піднімається на 4px і збільшується до 1.1. Нахил і світлова пляма спільного BentoCard збережені. Підняття та масштаб іконки використовують motion-safe; системний reduced motion окремо не перевірявся.

Нижні списки з галочками та їхні розділювачі видалено в усіх картках разом із невикористаними перекладами uk/en. Залишилися заголовок, короткий опис і preview; preview вирівнюються по низу карток у ряду. Поширення кодом/посиланням залишається першою карткою, а умову входу перенесено в її короткий опис. Кольори бренду незмінні: світла тема #F45B8A, темна #3EF7D2.

Перевірки: lint, build із TypeScript і 34 статичними сторінками, 26 unit tests, 7 export tests та git diff --check — PASS. Graphify оновлено AST-only: 917 nodes, 1499 edges, 78 communities.

Production preview: перевірено uk/en на 360, 390, 768, 1023, 1024, 1440 і 1920px в обох темах. У кожному стані шість карток, нижніх списків немає, горизонтального document overflow та переповнення тексту карток не виявлено. Порожній overflow у вимірах української версії на 1920px належить навмисно обрізаному декоративному шару поза картками. Наведення перевірено в runtime: обводка видима, її градієнт змінює координати разом із курсором; іконка має scale 1.1 та translateY -4px, картка нахиляється. Console warn/error порожня. Повторного повного маршрутного аудиту, zoom 200%, OS reduced motion та інших браузерів цей прохід не охоплює.

- [Картки з наведенням](audit-evidence/everyday-hover-restored.jpg)
- [Мобільна версія](audit-evidence/everyday-hover-mobile.jpg)
- [Виміри та перевірка наведення](audit-evidence/everyday-hover-verification.json)

## Узгодження всіх додаткових можливостей 18.10.2026

За новим відгуком користувача прибрано окрему широку картку, в якій експорт файлів витісняв код. AppShowcase тепер має шість рівнозначних карток: код/посилання, файли, нагадування, матеріали, Android-віджет і синхронізація. Код — у першому заголовку, описі й наочному прикладі; файли — поруч у такій самій структурі. Кожна картка має однакову ієрархію, локальний статичний preview та два уточнення. Сітка 1/2/3 колонки; окремих span немає. Спільний BentoCard та його API не змінювалися, додаткових інтерактивних controls чи анімацій немає.

Копію узгоджено UK/EN і повторно звірено з основним PlanIt: `reminderSettings.js` та lesson editor підтверджують нагадування розкладу/предмета й власний інтервал; бібліотека файлів — повторне використання; `ScheduleWidget.jsx`/`widgetCore.js` — Android і гортання днів; `SyncConflictScreen.jsx` — локальна, хмарна або обидві версії. Поширення/експорт спираються на джерела попереднього запису. Статичні ілюстрації приховані від assistive technology; істотні факти залишаються у заголовках, описах і списках. Код PL7M2K підписаний як приклад.

- **А:** lint, TypeScript під час production build, 26 unit-тестів і 7 export-тестів пройшли. Парність нових локалізацій перевірена; нових залежностей немає.
- **Б:** production export на `http://localhost:4181`: у DOM шість H3, по два пункти в кожній картці, жодного посилання/кнопки/focus target у пояснювальному розділі. [36 вимірів](audit-evidence/everyday-cards-responsive.json) охоплюють UK/EN, дві теми й ширини 360, 390, 768, 1023, 1024, 1279, 1280, 1440, 1920px: document і перевірені p/ul/h3 не переповнюються, сітка має очікувані 1/2/3 колонки. Це геометричні виміри, не візуальний огляд кожної комбінації.
- Переглянуто обидва ряди desktop у темній темі та mobile-картку коду. Знімки: [код, файли та нагадування](audit-evidence/everyday-cards-dark.jpg), [матеріали, віджет і синхронізація](audit-evidence/everyday-cards-details.jpg), [телефон](audit-evidence/everyday-cards-mobile.jpg). Формальні перевірки reduced-motion/OS zoom 200%, інші браузерні рушії й реальні push/export/widget/sync дії головного застосунку в цій зміні не виконувалися.

## Оновлення поширення розкладу 18.10.2026

За запитом користувача перевірено головний проєкт `D:\GitHub\ArtomkDev\PlanIt` (пакет 0.1.81): `ShareScheduleModal.jsx`, `scheduleExportService.js`, обидва варіанти `schedulePdfService`, `scheduleExport.js`, `shareService.js` і українські labels. Підтверджено PDF, DOCX, XLSX, CSV та текст; збереження копії у PlanIt — через окреме посилання/код після входу на 1, 3, 7 або 30 днів. У PDF/Word є вибір тижнів, таблиця/список, графік тижнів та оформлення, мова обирається окремо. Новий текст не обіцяє імпорту DOCX/CSV у PlanIt і не називає формат Word «DOX».

Розширено картку поширення обома мовами: призначення п’яти форматів, вибір даних/тижнів, опції документа, пояснення посилання/коду. Картка стала першою й займає дві desktop-колонки; загальна кількість карток лишилася п’ять. Формати — статичний семантичний список без button-role. Спільний BentoCard та його API, кольори і навігація не змінювалися.

- **А:** lint, TypeScript у production build, 26 unit-тестів та 7 export-тестів пройшли. Парність ключів локалізацій перевірена наявним тестом. Нових залежностей немає; головний застосунок лише прочитано.
- **Б:** локальний production export на `http://localhost:4181`: оглянуто українську desktop-картку та mobile у темній темі. [Збережені DOM-виміри](audit-evidence/schedule-sharing-responsive.json) для 360, 390, 768, 1023, 1024, 1440, 1920px в обох локалях і темах підтвердили п’ять форматів без document/list-item overflow (28 комбінацій). Після вимірів фінальний перехід перервався через timeout браузерного інструмента; перегляд відновлено в новій тимчасовій вкладці. Повторні перевірки OS zoom, reduced motion та інших рушіїв не виконувалися.
- [Фінальний desktop-вигляд](audit-evidence/schedule-sharing-desktop.jpg). Це опис можливості застосунку; генерування справжніх PDF/DOCX та їхню сумісність у цій задачі заново не тестували.

## Уточнення палітри 18.10.2026

Користувач уточнив точні фірмові кольори: світла тема — `#F45B8A`, темна — `#3EF7D2`. Попередні `#dc4446` і `#64e5a0` були помилковим тлумаченням слів «червоний» і «зелений». Виправлено загальний `--brand`, повернуто узгоджені `--brand-strong` і `--brand-soft`. Крапка header/footer та акцентні риски успадковують точні кольори через спільний token. Нижчі записи й знімки design-refresh документують попередню ітерацію палітри. Перевірка цього уточнення: наявні unit-тести, включно з контрастом допоміжних токенів; production build. Повторна браузерна перевірка layout не виконувалась: зміна обмежена палітрою.

## Оновлення 18.10.2026 — крапка, акцентні риски та коротша головна

За прямим запитом користувача зі скриншотом загальний акцент тепер червоний у світлій темі (`#dc4446`) і зелений у темній (`#64e5a0`). Спільний `Wordmark` залишає текст PlanIt нейтральним та фарбує крапку в header/footer. `AccentRule` додає статичні декоративні риски перед основними розділами. Header має ті самі disclosure-групи без зовнішньої овальної рамки; shortcut «Можливості» не повертався.

Скорочено українські й англійські тексти hero, чотирьох демо, додаткових можливостей, платформ, CTA та footer. Повторні списки біля демо й дві додаткові картки оформлення/завдань прибрані; ці функції залишаються в робочих демо. AppShowcase має п’ять карток, кожна про окрему додаткову можливість. Усі чотири пояснення про локальність змін залишаються видимими. Фінальний CTA спрощено до нейтральної панелі, риски та однієї дії. Піксельний renderer і редактори не змінювалися.

- **А:** lint, typecheck, 26 unit-тестів, production build і 7 export-тестів пройшли. Наявний тест контрасту перевіряє новий `brand-strong` у двох темах, тест локалізацій — однакові ключі UK/EN. Нових залежностей немає.
- **Б:** фінальний production export на `http://localhost:4181`. DOM-виміри для 360, 390, 768, 1023, 1024, 1440, 1920px, обох локалей та тем не виявили горизонтального document overflow; це 28 комбінацій, а не візуальний огляд кожної. Обидві крапки мають очікуваний computed color. Оглянуто desktop hero в обох темах, mobile hero та короткий блок можливостей; англійські платформи зберігають disabled iOS і правильні посилання.
- **Б:** меню відкривається; Escape закриває desktop/mobile disclosure і повертає фокус. Перемикання UK→EN зберегло `#features`. У демо тривалість 60 хв одразу перерахувала наступні пари, save оголосив «Збережено», reset повернув 90 хв. Footer-якорі прокручують ціль нижче header (~88px). IAB повідомляв подвоєний fragment при послідовних переходах як із Next Link, так і зі звичайним `a`; атрибути href правильні. Причину інструмента/браузера не встановлено, перевірку точного URL у звичайному браузері не заявлено; вихідний Link збережено.
- Докази: [28 вимірів](audit-evidence/design-refresh-responsive.json), [світла тема](audit-evidence/design-refresh-light.jpg), [темна тема](audit-evidence/design-refresh-dark.jpg), [світлий телефон](audit-evidence/design-refresh-mobile-light.jpg), [темний телефон](audit-evidence/design-refresh-mobile-dark.jpg), [можливості на телефоні](audit-evidence/design-refresh-mobile-features.jpg). Знімки фіксують окремі моменти анімації. Runtime reduced-motion, OS zoom 200%, фізичні пристрої та інші браузерні рушії для цього оновлення не перевірялися. Зміни shared-палітри для auth/legal перевірені в коді та наявним тестом контрасту; всі account-flow стани заново не проходилися.

## Оновлення 18.10.2026 — органічний рух піксельного hero

За прямим запитом і подальшим візуальним уточненням користувача фігури `PixelDisplay` hero мають незалежні noise-потоки, різні темпи та асинхронні поділи. Локальні зустрічі пар можуть завершуватися злиттям, затримкою поруч або розходженням. Контури викривляються, нерівні lobes і перемички створюють безформні текучі маси. Вільне поле реагує на утримання/відпускання основної кнопки миші. На телефоні розміри масштабуються відносно aspect ratio. Feature-поля зберігають попередні траєкторії й ліміт lobes. Палітра, hero-копія, layout та CTA не змінювалися.

- **А:** `tests/hero-choreography.test.mjs` перевіряє рух до 400 секунд, 5/7 фігур, aspect ratio 0.3–4, скінченні координати й межі поля, неперервність позиції/форми/орієнтації, незалежність поділів та локальних зустрічей. Окремий 900-секундний прогін двох тіл підтверджує повне злиття й подальше розходження. Загалом 26 unit-тестів пройшли.
- **А:** lint, typecheck, production build і 7 export-тестів пройшли. Graphify оновлено через AST-only wrapper.
- **Б:** локальний production export на `http://localhost:4175`, headless Chrome. Переглянуто темну desktop-анімацію, світлий mobile-вигляд після корекції масштабу та реакцію на утримання/відпускання миші. DOM-виміри для 360, 390, 768, 1023, 1024, 1440, 1920, 3440px в обох темах не виявили document overflow; це не означає перегляд кожної фази на кожній ширині. Перевірено наявність feature-canvas при прокручуванні та створення 2D renderer із примусово недоступним WebGL.
- **Б + instrumentation:** лічильник hero `drawArrays` і checksum alpha-текстури змінюються при русі, не змінюються після виходу з viewport та після ввімкнення реального browser media setting `reduced-motion: reduce`, поновлюються після повернення. Окремо перевірено `visibilitychange` із підміною `document.hidden`; це симуляція прихованого документа, не перевірка вкладки у фоні реальної ОС. Новий `useSyncExternalStore` у `PixelDisplay` реагує на зміну media query без reload. Cleanup listeners/observers та обмежені буфери перевірено в коді.
- **Б, фінальні органічні форми:** повторно оглянуто desktop 1920×1080, ultrawide 3440×1271 і mobile 390×844, темну/світлу палітри. `pageerror` відсутні; фінальний короткий console-прохід не виявив error. Лічильник `drawArrays` повторно підтвердив pause/resume для reduced motion та viewport. Вимір обгортки RAF із hero-draw на 3440px: медіана 11.9ms, p95 14.8ms на 51 кадрі; це короткий JS/command-submission sample headless Chrome на цій машині, без виміру GPU чи батареї.
- Докази фінальної форми: [lifecycle](audit-evidence/hero-organic-lifecycle.json), [короткий вимір](audit-evidence/hero-organic-performance.json), [desktop](audit-evidence/hero-organic-dark.png), [пізніший рух](audit-evidence/hero-organic-flow.png), [3440px](audit-evidence/hero-organic-ultrawide.png), [телефон](audit-evidence/hero-organic-mobile-light.png). Попередні [viewport-виміри](audit-evidence/hero-responsive.json) та [visibility/lifecycle](audit-evidence/hero-lifecycle.json) стосуються тієї самої оболонки до зміни траєкторій. PNG фіксують окремі моменти, а не весь рух. Повний CPU/GPU/battery profiling, фізичні телефони, Safari/Firefox та ручна OS zoom-перевірка для цієї зміни не виконувалися.

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
## Початкові кольори оформлення — 18.10.2026

За наданим користувачем зразком `AppearanceDemo` починається з градієнта `#990000` → `#ff0099` та кута `45°`. Спільний initial state використовується для draft, saved та reset; наявна логіка save/cancel збережена. Перевірено TypeScript, ESLint компонента та `git diff --check`; Graphify оновлено AST-only. Браузерну перевірку та повну responsive-матрицю для цієї зміни не виконували.

Уточнення: перший LessonEditorDemo тепер починається з хімії. Production build (34/34) успішний; відкритий localhost:4173 був статичним preview старої збірки. Після нового build і reload у браузері підтверджено хімію в першому блоці та #990000 / #ff0099 / 45° у другому. Знімок: audit-evidence/appearance-default-red-pink.png. Повну responsive-матрицю повторно не перевіряли.

18.10.2026: за прямим запитом прибрано видимий підпис «Картка предмета» в обох демо та невикористані стилі підпису. Доступна назва групи збережена. Production build 34/34 успішний; після reload у браузері підтверджено 0 видимих підписів і 2 названі preview-групи. Знімок: audit-evidence/preview-without-caption.png. Повну responsive-матрицю не повторювали.

## Компактне демо завдань — 18.10.2026

Прибрано повторний заголовок у body. Картки мають окремі колонки виконання / текст / олівець, без додаткового рядка редагування; відступи зменшені, доступні назви редагування містять предмет і текст. Довгі слова й нові рядки підтримані, декоративний pattern обмежений карткою. Форма має локальні компактні відступи та повноширинний select; інші редактори не змінені.

Перевірки: 34/34 unit tests, ESLint TasksDemo, production build із TypeScript — PASS. У браузері перевірено додавання, порожній disabled save, зміну предмета, редагування й збереження, cancel без збереження, виконання/повернення, reset і фільтр іспитів. Довгий нерозривний текст перевірено на 360, 390, 768, 1023, 1024, 1440, 1920px в обох темах: горизонтального overflow body/тексту немає; checkbox/edit targets 44×44px. Форма на 360px без горизонтального overflow. Console warn/error порожні. OS reduced motion, screen reader і реальний zoom 200% повторно не перевіряли.

Докази: audit-evidence/compact-tasks-verification.json, audit-evidence/compact-tasks-desktop.png, audit-evidence/compact-tasks-mobile.png. Локальний статичний preview перезібрано; Graphify оновлено AST-only.

## Стикування демо та піксельної сітки — 18.10.2026

FeatureStage передає anchorRef у PixelDisplay; квадратний крок підганяється під ціле число клітинок між боками демо, початок решітки вирівнюється до цієї рамки. Зовнішні краї містять лише цілі клітинки та однаковий вертикальний залишок. Вимірювання не залежить від entrance transform; ResizeObserver слухає canvas і anchor та очищується при unmount. Canvas2D використовує той самий дробовий крок, що й WebGL. Hero не отримує anchor-підгонки. На телефоні inset-block збільшений до 32px за радіус рамки, боковий простір — 12px для цілої клітинки.

36/36 tests, ESLint змінених TS/TSX, production build із TypeScript і git diff --check — PASS. Два нові тести перевіряють межі обох боків при дробових ширинах, цілі зовнішні клітинки й симетрію рядів. У браузері виміряні всі чотири демо на 360, 390, 768, 1023, 1024, 1440, 1920px: 28 layout-випадків без переповнення; підстановка фактичних розмірів у розрахунок підтверджує обидва боки на межах клітинок. Оглянуто desktop у темній і світлій темах, mobile та відкриття/закриття форми завдання. Console warn/error порожні. Примусовий Canvas2D fallback, різні фізичні DPR, OS reduced motion й реальний zoom 200% у браузері повторно не перевіряли.

Докази: audit-evidence/aligned-pixel-grid-geometry.json, audit-evidence/aligned-pixel-grid-desktop.png, audit-evidence/aligned-pixel-grid-light.png, audit-evidence/aligned-pixel-grid-mobile.png. Статичний preview перезібрано, Graphify оновлено AST-only.

## Окремі піксельні символи на адаптивних екранах — 18.10.2026

За запитом користувача 12 випадкових символів замінені шістьма сталими силуетами 9×9; квадрат 9px, крок 11px. Прозорість змінюється для цілого символу, без поелементного мерехтіння та частково зниклих форм. Прибрані клієнтська випадкова генерація, requestAnimationFrame і sessionStorage; компонент тепер статичний. До 2240px окремі символи приховані. На широких екранах горизонтальні позиції резервують простір поза основним контентом, сіткою демо та декоративними картками. Hero PixelDisplay і сітка демо збережені.

ESLint змінених TS/TSX, production build із TypeScript, 36/36 tests та git diff --check — PASS. Додаткова перевірка даних підтвердила шість повних матриць 9×9 без координат поза боксом. У браузері на 360, 390, 768, 1023, 1024, 1440, 1920, 2239px видимих символів 0; на 2240 і 2560px — 6. Бокси символів не перетинають текст, headings, links/buttons/form inputs, canvas та accent cards; жоден не обрізаний viewport. У дочірніх квадратів немає власної animation. Оглянуто mobile та широкі екрани у двох темах, console warn/error порожні. CSS reduced motion перевірено за кодом, OS preference та реальний zoom 200% повторно не перевіряли.

Докази: audit-evidence/responsive-pixel-symbols-verification.json, audit-evidence/responsive-pixel-symbols-mobile.png, audit-evidence/responsive-pixel-symbols-wide.png, audit-evidence/responsive-pixel-symbols-wide-light.png. Статичний preview оновлений, Graphify оновлено AST-only.

## Індивідуальні анімації піксельних символів — 18.10.2026

За прямим уточненням користувача повернено анімації з окремою семантикою для кожного силуету: промальовування/стискання дужок і курсор, дві радіальні хвилі зірки, обхід дат календаря, 12 поз хвилинної стрілки, заповнення закладки цілими рядами й імпульс із кроком наконечника стрілки. Основний контур не зникає; зсуви кратні 11px, рухомі шари не виходять із 99×99px. Періоди 11–24s, різні фази та паузи. Збережені breakpoint 2240px і вільні бокові поля.

IntersectionObserver окремо активує видимі символи, visibilitychange та media listener призупиняють CSS-анімації у прихованій вкладці, при вузькому viewport або reduced motion; cleanup прибирає observer і listeners. CSS reduced motion прибирає динамічні шари та залишає одну позу годинника. Немає JS-циклу кадрів.

Перевірки: TypeScript, ESLint змінених TS/TSX, production build, 38/38 tests і git diff --check — PASS. Два нові тести перевіряють усі рухомі клітинки в межах зарезервованого боксу й дванадцять різних цілочисельних поз годинника без накладання на обід. У браузері всі шість сценаріїв мають різні keyframes і running при появі; поза viewport підтверджено paused. Контури мають opacity від 0.22, рухомі квадрати не виходять за межі боксу. Зафіксовані різні пози хвилинної стрілки; маска закладки буває порожньою та заповненою. На 390/1920px символи приховані та неактивні, на 2560px — шість у дозволених полях. Console warn/error порожні. Приховану вкладку та OS reduced-motion перевірено за кодом, без окремого браузерного перемикання preference; реальний zoom 200% повторно не перевіряли.

Докази: audit-evidence/symbol-specific-motion-verification.json, audit-evidence/symbol-specific-motion-clock.png, audit-evidence/symbol-specific-motion-arrow.png. Preview перезібрано, Graphify оновлено AST-only.

## Пожвавлення символів — 18.10.2026

За новим відгуком скорочено періоди до 8–14.4s, підвищено базову opacity до 0.34 (зірка — від 0.3), піки — до 1. Додані повторні проходи світла й руху протягом циклу, коротші порожні фази закладки. Годинник перемикає позу кожні 1.2s; затримка кожної з 12 поз тепер обчислюється з symbolPeriods.clock, тож скорочення періоду не накладає стрілки. Зміщення, габарити та адаптивні/visibility/reduced-motion обмеження збережені.

ESLint, production build із TypeScript, 38/38 tests і git diff --check — PASS. Браузер зі свіжої збірки підтвердив нові періоди всіх шести символів, базову яскравість та рівно одну видиму позу годинника при періоді 14.4s. Console містить один запис про закритий asynchronous message channel; React/animation stack у ньому відсутній. Повну responsive-матрицю та OS reduced motion повторно не перевіряли, оскільки геометрія й guard-логіка не змінені.

Докази: audit-evidence/livelier-pixel-code.png, audit-evidence/livelier-pixel-motion-verification.json. Preview перезібрано, Graphify оновлено AST-only.

## Новий силует стрілки — 18.10.2026

За візуальним відгуком тонкий контур замінено заповненою симетричною стрілкою з 32 квадратиків: короткий стрижень завтовшки три клітинки, масивний наконечник. Наконечник визначається за колонками x>=4 і рухається цілком. Світло проходить від хвоста до вістря, базова opacity стрижня 0.48, наконечника 0.6, піки 1. Матриця 9×9, габарит 99×99px, період 9s, бокові поля й адаптивність збережені.

ESLint, production build із TypeScript, 38/38 tests і git diff --check — PASS. У браузері підтверджені 32 клітинки, три ряди стрижня, єдина transform-матриця всіх клітинок наконечника, мінімальна яскравість і відсутність виходу за бокс. Новий силует оглянуто на темному тлі. Повну матрицю ширин/тем і OS reduced motion повторно не перевіряли.

Докази: audit-evidence/redesigned-pixel-arrow.png, audit-evidence/redesigned-pixel-arrow-verification.json. Preview оновлений, Graphify оновлено AST-only.

## Узгоджене вирівнювання заголовків — 18.10.2026

За запитом користувача заголовки й підписи головної вирівняні ліворуч на всіх ширинах. Platforms прибрано items-center/text-center/mx-auto у вступі та встановлено 48px до карток. Hero зберігає лівий край також на телефоні/планшеті, опис і дії прив’язані до нього. CTA має ліве вирівнювання всередині власної панелі; риска, заголовок, опис і кнопка більше не центруються окремо. AppShowcase та Features явно закріплюють ліве вирівнювання. Мобільний бічний padding Features — 24px, як у решти секцій; чергування демо й картки збережені.

ESLint змінених TSX, production build із TypeScript, 38/38 tests і git diff --check — PASS. Браузер: 360, 390, 768, 1023, 1024, 1440, 1920px українською та англійською. У всіх 14 випадках main H1/H2 мають text-align:left без переповнення; Features/Everyday/Platforms починаються на однаковій координаті X. У scroll-body демо горизонтального overflow немає після зміни мобільного padding. Оглянуто Platforms на desktop і телефоні, темну та світлу теми. OS reduced motion, screen reader, реальний zoom 200% та повну keyboard-навігацію повторно не перевіряли; взаємодії не змінювалися.

Докази: audit-evidence/section-heading-alignment-verification.json, audit-evidence/section-headings-platforms-desktop.png, audit-evidence/section-headings-platforms-mobile.png, audit-evidence/section-headings-mobile-light.png. Локальний static preview оновлений, Graphify оновлено AST-only.

## Навігація з літаючих літер — 18.10.2026

За наданим Artcraft-референсом додано п’ять назв розділів у нижньому правому полі, без шкали, рисок і фонової панелі. Scroll послідовно переносить назви вгору: кожна літера має власну позицію та кут на дузі, у середині польоту проміжки збільшуються. Рух оборотний; усі назви завершують траєкторію до кінця сторінки навіть при високому viewport і короткому CTA. Видимість — від 1920×640px; до цієї ширини/висоти компонент display:none. Праве зовнішнє поле звільнено від окремих піксельних символів, їхні анімації збережені зліва.

Компонент у locale-layout поза transform сторінки, рендериться лише на головній. Доступні цілі назви, один aria-current, 44px рядки, keyboard focus збирає слова горизонтально та має 2px outline. Активація переносить фокус на H1/H2 розділу. Reduced motion залишає статичний нижній стос. Scroll/resize використовують один запланований кадр, без постійного циклу; виміри кешуються, observers і listeners прибираються.

Виявлені під час перевірки проблеми історії виправлені через офіційно підтриману Native History API integration Next.js. Прямі hash-переходи залишали запис без стану App Router, а Next Link 16.2.9 додавав початковий hash route cache до нового hash. Застосовано pushState із заміною hash через URL, збереженням query та locale, scrollIntoView і native поведінкою modified clicks. node_modules не змінювали. Остаточний браузерний цикл усіх п’яти посилань підтвердив правильні одиночні hash, один поточний розділ і фокус на відповідному H1/H2. Перехід у privacy та повернення Back відновлює головну й навігацію без reload.

Production build із TypeScript, ESLint змінених TS/TSX, 43/43 tests і git diff --check — PASS. П’ять нових тестів перевіряють порядок/відстані назв, геометрію літер, читабельні кінцеві позиції й focus/reduced пози, завершення на реальному page bottom, визначення активного розділу та заміну старого hash без втрати query/locale. Браузер: 390, 768, 1440, 1919, 1920, 2240, 2560, 3440px при висоті 900px, також 3440×639px. Горизонтального overflow чи перетинів навігації з видимими основними заголовками, кнопками й полями не знайдено. Початковий стан перевірений на 3440×1215px у позначеному користувачем правому нижньому полі; оглянуто політ, активні розділи, нижню межу сторінки, українські/англійські назви та світлу палітру. Console має записи стороннього extension M_ID і закритого asynchronous message channel; стеку нового компонента в них немає. OS reduced motion, screen reader і реальний zoom 200% не перемикали; reduced поведінку перевірено за кодом і математичними тестами.

При огляді висоти 1080px додатково розширено праву fade-зону InfiniteRibbon: її текст не проходить під навігацією, коли нижній стос перетинає рухомий рядок. Для статичного reduced рядка зарезервовано правий padding, над hero-пікселями читабельність підтримує легка тінь без фонової панелі.

Зовнішні праві декоративні картки Features і Platforms приховані при 1920–2559px та висоті від 640px, щоб не займати поле навігатора. Від 2560px картки збережені в окремій частині зовнішнього поля.

Докази: audit-evidence/floating-section-nav-verification.json, audit-evidence/floating-section-nav-initial.png, audit-evidence/floating-section-nav-final.png, audit-evidence/floating-section-nav-flight.png, audit-evidence/floating-section-nav-light.png. Static preview перезібраний, Graphify оновлено AST-only.

## Незалежний політ кожної літери — 18.10.2026

За повторним візуальним відгуком прибрано спільний кут слова й розтягування рядка. Кожна літера має власну затримку, проходить повний вертикальний шлях від нижнього рядка до верхнього, власну дугу й індивідуальний поворот зі змінним знаком та амплітудою. Праві символи відриваються першими; назва одночасно може мати символи, що чекають унизу, летять у середині та вже зібралися вгорі. Зміщення anchor компенсується в позиції кожного символу, тому рух групи не керує фактичним Y літер. Інтервал стартів слів збільшено до 62% тривалості, щоб незалежні потоки не перетиналися. Кінцеві читабельні назви, focus/reduced поведінка, кліки та історія збережені.

Production build із TypeScript, ESLint змінених TS/TSX, 45/45 tests та git diff --check — PASS. Два нові регресійні тести перевіряють одночасні waiting/flying/arrived фази, різні знаки повороту, послідовність і плавність руху, а також щонайменше 44px між потоками різних слів на висотах 640–2160px. Наявні тести адаптовані до повної вертикальної відстані польоту; кінцеві позиції, межі правого поля й статичні focus/reduced пози залишаються перевіреними. Браузер зі свіжого export підтвердив різні вертикальні позиції та повороти окремих символів замість похилого слова; оглянуто «Можливості» та «Платформи». Повну матрицю ширин/тем і OS reduced-motion повторно не перемикали; media guards та стилі не змінені.

Докази: audit-evidence/individual-navigation-letters.png, audit-evidence/individual-navigation-letters-verification.json. Static preview перезібраний, Graphify оновлено AST-only.

## Цілий активний пункт навігації — 19.10.2026

Підсвічування й завершення польоту тепер використовують спільні межі фактичних секцій: top мінус 32% висоти viewport, із завершенням до кінця доступного scroll. Кожна назва має окреме вікно між попереднім завершенням і власною активацією. Активний пункт завжди горизонтальний; назви мають верхні центри 112/156/200/244/288px. Прибрано старі однакові тривалості, через які поточна назва залишалася частково розсипаною.

Регресії перевіряють весь активний інтервал, короткі й нерівномірні секції, якірні переходи та висоти 640–2160px. Браузер підтвердив горизонтальні активні назви; фінальна повторна перевірка входить у наступний запис.

## Окремі букви на обох згинах меню — 19.10.2026

За уточненим референсом нижній відрив, вертикальний рух і верхнє розгортання тепер мають окремі фази. Кожен символ по черзі змінює свій кут у межах −90°…0°. Відстані розкриваються на згинах до 2.6 від початкових, а горизонтальні та вертикальні частини зберігають звичайні проміжки. Вертикальна частина стоїть на правій осі без нахиленого стовпчика. Верхня частина розгортається з прив’язкою до голови стрічки, без попереднього спільного бокового зсуву. Це замінює як надмірне розсіювання на всю висоту, так і надто щільний проміжний варіант.

Швидкість сторінки відділена від ефекту меню: клік прокручує її за 320–520ms, а меню має власне коротке інерційне завершення. Довгі переходи на 1.1–5s прибрані. Повторний клік стартує з поточної позиції; wheel, touch, клавіші, pointerdown, history та зміна viewport скасовують програмний scroll. Натискання на пункт також призупиняє його геометрію до відпускання, щоб рух не заважав кліку. Reduced motion лишається миттєвим, без інерції.

51/51 tests, production build із TypeScript, ESLint змінених TS/TSX/MJS, 7/7 export tests та git diff --check — PASS. Математичні перевірки охоплюють помітні проміжки на обох згинах, окремі кути без переворотів, пряму вертикаль, неперетинання потоків, кінцеві позиції, швидкість сторінки, точне завершення та скасування циклу. У Chrome 3440×1215px оглянуто обидва згини під час звичайного прокручування. Послідовні кліки «Можливості», «Щодня», «Платформи», «Почати» підтвердили правильні hash, фокус на заголовках, spread 0px і rotate(0deg) усіх активних букв; повернення PlanIt до вихідної нижньої позиції також перевірено. Console після reload містить повторні M_ID зі стороннього chrome-extension, без стеку компонента меню. Повну попередню матрицю ширин/тем, OS reduced motion та реальний zoom 200% повторно не перемикали; guards і палітра не змінені, геометрія та reduced-пози перевірені тестами й кодом.

Докази: audit-evidence/elastic-navigation-lower-bend.png, audit-evidence/elastic-navigation-upper-bend.png, audit-evidence/elastic-navigation-verification.json. Static preview перезібраний, Graphify оновлено AST-only.

## Перебудова навігації за живим Artcraft — 19.10.2026

Після нового відгуку переглянуто https://getartcraft.com/ у браузері, окремі кадри верхнього переходу та геометрію його гліфів. Попередню інтегровану стрічку замінено незалежними переходами кожної букви між нижнім рядком, вертикальною назвою й власною позицією верхнього заголовка. В обох переходах останні букви стартують першими; local stagger 0.16, cubic easing, квадратична дуга з відхиленням 28px усередину сторінки. Верхні літери по черзі приземляються у свої кінцеві координати. Прибрано штучне розтягування проміжків і повторення нижньої дуги зверху.

Компактний текст має 16px, вертикальний — 20px, поточний заголовок — до 30px із обмеженням ширини бічного поля. Коли наступний заголовок збирається, попередній зменшується й переходить у компактний стос. Межі активації враховують 12% viewport або власний верхній рядок; активне слово вже повністю горизонтальне. Швидкі переходи сторінки 320–520ms збережені. Лінії, шкала, zoom rail та auto-scroll Artcraft не додаються: реалізована анімація назв у межах запиту.

Для плавності прибрано окреме інерційне наздоганяння scroll. У render-кадрі читається лише scrollY, розміри документа/viewport/літер кешуються поза ним. Кожна буква обчислюється за сталий час без проміжної сітки точок чи інтегрування слова. Transform/opacity та межі клікабельної області записуються лише при зміні; idle-цикл відсутній. Гліфи мають сталі GPU-шари з базовим шрифтом 34px. Anchor тепер охоплює фактичні видимі букви, включно з польотом, із мінімальною ціллю 44px. Клавіатурний фокус показує рівний стос, reduced motion лишає статичну нижню навігацію. Fade рухомого рядка розширено до нейтральних 320px і переходу до 416px під більший заголовок.

Production build із TypeScript, ESLint змінених TS/TSX/MJS, 52/52 tests, 7/7 export tests та git diff --check — PASS. Регресії перевіряють окремі нижній/верхній переходи, правильний порядок приземлення, вертикальне читання, неперервні стики фаз, кінцеві рядки, швидкість/переривання кліку. Додано повне семплювання всіх п’яти слів на висотах 640–2160px і ширинах слова 120–340px: літери не виходять за вертикальні межі viewport та різні назви не перетинаються. Локальний Node-замір 20 000 геометричних кадрів по 50 гліфів дав близько 0.003ms на кадр; це замір обчислення координат, не браузерний FPS.

У браузері оглянуто нові нижній відрив, вертикальну фазу та верхнє приземлення. Повторні кліки підтвердили коректні hash й рівні активні назви (spread 0px), включно з поверненням PlanIt. Виміри штучних viewport не зараховано як повну ручну responsive-матрицю: тестова вкладка переходила в hidden, і компонент коректно зупиняв render, тож геометрія лишалася до наступного visibilitychange. Тимчасові viewport overrides скинуті; responsive-геометрія перевірена наведеними тестами, чинні media guards збережені. OS reduced motion, реальний zoom 200%, повну матрицю тем та screen reader повторно не перемикали.

Докази: audit-evidence/artcraft-reference-upper-flight.png, audit-evidence/artcraft-navigation-lower-departure.png, audit-evidence/artcraft-navigation-upper-arrival.png, audit-evidence/artcraft-navigation-verification.json. Static preview перезібраний, Graphify оновлено AST-only.

## Головна без рухомого рядка переваг — 20.10.2026

За візуальним відгуком користувача прибрано InfiniteRibbon між Hero та Features: п'ять написів повторювали можливості, які вже представлені в інтерактивних демо й AppShowcase, і не мали окремої дії. Видалено компонент, його імпорт і зайву обгортку сторінки, спеціальні fade/reduced-motion стилі та ключі AppShowcase.ribbon обома мовами. Hero безпосередньо переходить у Features; чинні секційні відступи й стабільні ID збережені. DESIGN.md оновлено, старі записи аудиту вище описують історичний стан.

Перевірка: повний ESLint, окремий TypeScript, production build, 52/52 unit tests, 7/7 export tests і git diff --check — PASS. Нових тестів для простого видалення декоративного блоку не додано. Після build локальний static preview запущено на localhost:4173 та оновлено в браузері.

Браузерні виміри на 360, 390, 768, 1023, 1024, 1440 і 1920px у темній українській та світлій англійській версіях (14 випадків) підтвердили gap 0px між межами Hero/Features, відсутність горизонтального overflow та всі п'ять основних section ID. Це виміри з тимчасовими viewport overrides, не повний ручний responsive-аудит. Візуально оглянуто світлий мобільний Hero та темний перехід Hero → Features на природному viewport 3440×1215px. Клік «Можливості» відкриває #features, активує відповідний пункт і переводить фокус на features-title; повернення PlanIt до #top працює. Viewport overrides скинуті, українська мова й темна тема відновлені. У console був старий запис про закритий asynchronous message channel до початку перевірки; нових помилок застосунку не зафіксовано. Реальний zoom 200%, OS reduced motion, screen reader і повний цикл keyboard/form-станів повторно не перевіряли; ці взаємодії не змінювалися.

Докази: audit-evidence/homepage-without-ribbon.png (центральний фрагмент природного viewport), audit-evidence/homepage-without-ribbon-responsive.json. Graphify оновлено AST-only: 998 nodes, 1618 edges; видалений компонент більше не використовується в коді.

## ASCII-силуети за референсом Epic — 20.10.2026

За прямим запитом користувача досліджено живий launcher.epicgames.com, DOM, публічні production JS/CSS та конфігурацію графіки. Докладний аналіз шарів, складання, хвилі, relay, параметрів і власної адаптації — docs/EPIC_ASCII_STUDY.md. Замість колишніх дрібних квадратних символів реалізовано шість власних великих векторних силуетів із 0/1: календар, палітра, завдання, годинник, поширення й пристрої. Старі HomepagePixelClusters, модель, CSS-цикли та два неактуальні тести видалені. Hero/feature PixelDisplay, декоративні картки й праве меню збережені.

HomepageAsciiArt використовує один sticky canvas висотою viewport та шириною до 1920px, atlas символів, кешовану layout-геометрію, до 20 намальованих кадрів/с і обмеження bitmap. Під текстом інтенсивність зменшується з плавним краєм; перед полем правого меню є 272px резерв і 48px fade. Вхід складає цифри з різних напрямків; після нього хвиля змінює окремі комірки. П’ять оборотних relay залежать від фактичного scroll. Окрема перевірка власності шарів запобігає передчасній появі цільової форми та повторній появі вже розібраної вихідної. На телефоні й при reduced motion — статичні форми; прихована вкладка або відсутність видимих форм/переходів зупиняють RAF. Cleanup переглянутий у коді.

Перевірки: повний ESLint, повторний ESLint нової графіки після фінальних змін, production build із TypeScript, 55/55 unit tests, 7/7 export tests — PASS. П’ять нових тестів перевіряють детерміновані різні силуети та межі інтенсивності, неперервне складання й точне приземлення, збереження інтенсивності при різній кількості символів, оборотний scroll на висотах 640–2160px і недублювання готових форм на стиках relay.

Production-браузер: 360, 390, 768, 1023, 1024, 1440, 1920, 2240px у темній українській та світлій англійській версіях (16 випадків). Після завершення ResizeObserver перевірені відповідність bitmap фактичній ширині canvas, відсутність горизонтального overflow та старих значків, aria-hidden і pointer-events:none. На 360/390px підтверджений статичний режим, від 768px — анімований. Це виміри через тимчасові viewport overrides, а не повна ручна accessibility-матриця. Візуально оглянуто природний desktop 3440×1215px в обох темах, календар, палітру й годинник, проміжний relay та зворотне прокручування; мобільний текст і редактор — на 390px. Після переходу до Privacy canvas відсутня, після Back відновлюється рівно одна canvas. Перемикання мови та теми оновлює графіку. Повний реальний zoom 200%, OS reduced motion, screen reader і browser FPS-профілювання не виконувалися; reduced/lifecycle поведінку не видаємо за окрему OS-перевірку.

У console залишаються сторонні chrome-extension помилки M_ID та закритого asynchronous message channel зі старими часовими позначками, без стеків нової графіки; нових помилок застосунку не знайдено. У dev-журналі є hydration warning про доданий розширенням атрибут bis_skin_checked; новий renderer не додає випадкових даних до SSR-розмітки. Локальний preview перезібраний, українська темна тема та природний viewport відновлені; допоміжні вкладки й dev-server закриті. Graphify оновлено AST-only (1044 nodes, 1697 edges), git diff --check — PASS. Докази: audit-evidence/epic-ascii-reference.png, audit-evidence/planit-ascii-dark.png, audit-evidence/planit-ascii-light.png, audit-evidence/planit-ascii-mobile.png, audit-evidence/planit-ascii-responsive.json.

## Стабільна прив’язка ASCII при прокручуванні — 20.10.2026

За скриншотами й відгуком користувача виправлено ривки готових форм. Попередній спільний sticky-canvas компенсував scrollY у координатах bitmap лише під час малювання, обмеженого інтервалом 50ms. Нативний scroll рухав HTML частіше, тому фігура наздоганяла секцію сходинками. Це недолік попереднього renderer; попередні перевірки кінцевої геометрії не перевіряли прив’язку між кадрами прокручування.

Готові форми тепер мають локальні absolute-canvas у координатах документа. Їхні DOM-позиції змінюються тільки після зміни layout; браузер рухає шари разом зі статтями без програмної компенсації scrollY. Окремий локальний шар перетворення охоплює дві сусідні фігури, а не viewport. Під час scroll його bitmap оновлюється в кожному доступному RAF, без idle-обмеження 20fps. Зміна цифр у спокої зберігає ліміт 20fps. Невидимі bitmap звільняються; бюджети — 1.6 млн пікселів на видиму форму й приблизно 2.6 млн на перетворення. DESIGN.md та дослідження Epic оновлені відповідно до нової реалізації.

ESLint, production build із TypeScript, 57/57 unit tests і 7/7 export tests — PASS. Дві нові регресії перевіряють проєкцію координат із дробовим scroll і зміною напрямку, охоплення траєкторій локальним буфером та відсутність пропущених scroll-оновлень при симульованих 60/120/144Hz; idle-малювання залишається обмеженим. Це тест політики кадрів, не вимір FPS монітора.

Браузер зі свіжого production export: сім послідовних положень scroll 3622–3673px у двох напрямках біля годинника. Зміщення локального шару відносно feature-schedule та documentTop залишалися незмінними; максимальний drift 0px. Окремо п’ять положень 3884–3908px перевірили зворотний relay: його documentTop також сталий, phase=relay, виділений bitmap близько 2.6 млн пікселів. Оглянуто звичайне прокручування. На 390/768/1920px підтверджені absolute-позиції всіх шарів, відсутність overflow, статичний телефонний режим і звільнення невидимих буферів; природний viewport 3440×1215px відновлено. Повну попередню матрицю тем, OS reduced motion, screen reader і реальний zoom 200% повторно не перемикали; палітра й доступні controls не змінені.

Докази: audit-evidence/ascii-scroll-lock-fixed.png, audit-evidence/ascii-scroll-lock-verification.json. Локальний preview оновлено. Graphify оновлено AST-only (1052 nodes, 1713 edges), git diff --check — PASS.

## Завершені ASCII-перельоти та багатший набір знаків — 20.10.2026

За уточненням користувача повторно звірено живий Epic Launcher і часовий механізм його публічної збірки. Попередня адаптація помилково дозволяла зупинити частинки посеред переходу, прив’язуючи їхні координати до scroll. Тепер scroll лише обирає бажану форму; незалежний часовий політ завершується за 2400ms. Якщо напрямок змінюється, активний політ спочатку приземляється, потім починається один перехід до останньої обраної форми. Великі стрибки не програють усі пропущені секції; тривалість прямого переходу обмежена 3120ms. Гістерезис 32–70px захищає поріг від дрібних розворотів. Початкове видиме складання завершується перед відльотом; при відновленні fragment-позиції браузером вибір початкової форми очікує стабілізації scroll.

Набір розширено з двох цифр до 13 знаків `.:+-=/*<>[]01`. Щільність обирає спокійнішу пунктуацію для ореолу та цифри/математичні знаки для контуру. Кожна комірка має сталий знак; під час руху він тимчасово перебирається з індивідуальним темпом і фіксується до завершення посадки. Кінці перельоту збігаються з seed, позицією, кольором та інтенсивністю відповідної форми. Збережено локальні absolute-canvas без компенсації scrollY, текстові маски, палітри, праве поле навігації й бюджети bitmap. Складання та політ малюються в кожному RAF навіть після зупинки колеса; фонові хвилі залишаються до 20 оновлень/с. Reduced motion/compact одразу завершують перехід у статичний стан; прихована вкладка призупиняє видимий час. DESIGN.md та docs/EPIC_ASCII_STUDY.md виправлені, попередні записи вище залишаються історичними.

Перевірки: ESLint, фінальний production build із TypeScript, 60/60 unit tests і 7/7 export tests — PASS. Десять тестів ASCII перевіряють геометрію, складання, збереження інтенсивності, пороговий гістерезис, часову посадку без нових scroll events, чергу розвороту, великі стрибки, статичний режим, усі знаки та політику кадрів на симульованих 60/120/144Hz. Це не вимір FPS браузера.

Production-браузер: при незмінному scroll=2939 зворотний політ пройшов від progress=0.163 до 1; при незмінному scroll=2297 прямий політ пройшов від 0 до 1. В обох випадках кінцева phase=wave, виділений relay-шар прихований. При розвороті scroll 2107→2297 поточний політ до appearance продовжився від 0 до 0.465 без зміни destination; після посадки повернувся до tasks і завершився. Візуально оглянуто готові палітру й годинник та розширені знаки у темній і світлій темах. На природному 3440×1215 та тимчасовому 390×844 — без горизонтального overflow; на 390px motion=static, phase=still, relay bitmap звільнений, усі шари absolute. Viewport override скинуто, темну тему відновлено. Журнал помилок контрольної вкладки порожній. OS reduced motion, screen reader, реальний zoom 200% та FPS-профілювання повторно не виконувалися.

Докази: audit-evidence/ascii-complete-flight-dark.png, audit-evidence/ascii-complete-flight-light.png, audit-evidence/ascii-complete-flight-mobile.png, audit-evidence/ascii-complete-flight-verification.json. Локальний static preview оновлено. Graphify оновлено AST-only: 1059 nodes, 1728 edges, 82 communities.

## ASCII у темпі гортання та правого меню — 20.10.2026

За новим відгуком користувача виправлено запізнення за звичайною прокруткою та багатосекундну появу декорації після кліку Hero → Platforms. Попередні фіксовані 2400–3120ms і очікування старого переходу не відповідали швидкій навігації сторінки. Тепер окремий звичайний політ має бюджет 260–900ms, стартує раніше та враховує швидкість scroll і відстань до зони читання. При прискоренні решта часу скорочується зі збереженням поточного progress; позиція частинок у момент зміни темпу неперервна. Зупинка прокрутки не подовжує політ. Зміна цілі завершує попередню посадку за решту до 160ms, потім веде до останньої цілі. Початкове складання скорочене приблизно до 1.1s і не затримує відліт форми, яка вже залишає зону читання.

FloatingSectionNavigation повідомляє кінцевий section ID і тривалість маршруту через типізований `planit:section-travel`: start/finish/cancel. ASCII обирає фінальну форму відразу, планує посадку за 24ms до кінця прокрутки, а finish синхронно малює її після остаточного scrollTo у тому самому кадрі. Це прибирає також проміжок в один RAF після прибуття. Повторного складання на цілі немає. Cancel прибирає ціль меню; ручне гортання, новий клік, resize, hidden, клавіатура та reduced motion зберігають чинне скасування маршруту. Listener нового event прибирається при unmount. Геометрія, native absolute-шари, glyph atlas, палітри, aria-hidden та pointer-events:none збережені. DESIGN.md і docs/EPIC_ASCII_STUDY.md оновлено; попередні параметри аудиту вище історичні.

Перевірки: повний ESLint та повторний focused ESLint зміненого коду після фінального виправлення, production build із TypeScript, 63/63 unit tests, 7/7 export tests — PASS. 13 тестів ASCII включають симуляцію звичайної прокрутки зі швидкостями 300/650/1100px/s у двох напрямках на висотах 640/900/1215/2160px (24 сценарії), посадку до зони читання, меню Hero → Platforms на 60/120/144Hz, неперервність прискорення й відсутність уповільнення після зупинки. Перевірки геометрії, символів, статичного режиму та native scroll-прив’язки збережені. Це тести часової політики, не browser FPS-профілювання.

Production-браузер 3440×1271px: повторено маршрут верх → Platforms, повернення PlanIt та повторний клік Platforms. Одразу після фокуса заголовка Platforms: scroll=5696, figure/destination=platforms, progress=1, phase=wave, canvas видима, relay прихований. У фінальному callback форма вже намальована, без очікування додаткового RAF. Послідовне звичайне гортання вниз і назад оглянуто; готові calendar/appearance/tasks відповідають поточним положенням, а після зупинки фігура не залишається у проміжній хмарі. Журнал помилок контрольної вкладки порожній. Колір, responsive-геометрія й доступні controls не перероблялися; повну матрицю тем, OS reduced motion, zoom 200% та screen reader цього разу не повторювали.

Докази: audit-evidence/ascii-navigation-arrival.png, audit-evidence/ascii-adaptive-timing-verification.json. Static preview перезібраний. Graphify оновлено AST-only: 1067 nodes, 1750 edges, 86 communities. git diff --check — PASS.

## Видимий приліт після швидкого переходу — 20.10.2026

Користувач уточнив, що попереднє прискорення та примусова готова форма на момент прибуття меню прибрали головний задум — видиме складання частинок. Це виправлено зміною сценарію, а не подальшим скороченням часу. Сусідній переліт зберігає 1.2–1.7s помітного руху. Праве меню, стрибок через кілька форм або далеко за межі старого джерела одразу обирають останню ціль і запускають локальний приліт біля неї. Попередні пропущені форми не ставляться у чергу, шлях через всю сторінку не затримує появу.

Окремий AsciiArrival очікує входу принаймні 18% фігури або 120px у viewport. Початкові 90ms дають перші видимі частинки без порожньої паузи. Складання триває до 1500ms із незалежними затримками, cubic ease-out, невеликим вигином траєкторії й слабким шлейфом. Finish навігації зберігає поточну незавершену фазу та малює її, а не замінює на готовий силует. Власний час доводить рух до кінця після зупинки scroll. Подальший швидкий стрибок під час складання замінює ціль і починає локальну появу там; старий переліт не накопичує затримку. Початкова перша форма також очікує видимості. Normal reverse зберігає координати при прискоренні старої посадки до решти 450ms. Native absolute-прив’язка, glyph atlas, текстові маски, reduced motion та статичний телефонний режим збережені. DESIGN.md та docs/EPIC_ASCII_STUDY.md оновлені; попередня вимога «готова форма в кадрі прибуття» вище є відхиленим історичним варіантом.

Перевірки: повний ESLint, production build із TypeScript, 65/65 unit tests, 7/7 export tests — PASS. 15 тестів ASCII тепер перевіряють, що локальний приліт не програється поза viewport; після прибуття меню він ще містить видимі рухомі частинки; вони лишаються в русі на 150/500/950/1150ms і точно приземляються до кінця. Стрибок до нової цілі не створює черги; reduced motion завершує arrival одразу. Симуляції звичайної прокрутки в обох напрямках на висотах 640/900/1215/2160px і швидкостях 300/650/1100px/s перевіряють читабельний проміжок польоту замість попередньої умови «обов’язково готове до читання». Тести геометрії, знаків, фінальних позицій, збереження інтенсивності та 60/120/144Hz paint policy збережені.

Браузер production export: три повторні переходи PlanIt → Platforms після фокуса заголовка дали phase=forming, reveal=0.060/0.321/0.388 при scroll=5696 та видимому canvas. Це три окремі спроби, а не часовий ряд одного польоту. Після третьої спроби без подальшої прокрутки phase=wave, reveal=1.000 при тому самому scroll. Отже, прибуття більше не завершує фігуру завчасно, а зупинка сторінки не заморожує її. Статичний скриншот показує кінцевий вигляд; він не є доказом FPS чи відеозаписом руху. Native viewport screenshot у цьому browser connector повертав застарілий compositor-кадр іншого положення сторінки, тому такі спроби вилучені з доказів; використаний свіжий document-clip кінцевого стану. На 390×844: motion=static, phase=still, reveal=1, relay bitmap=0 та без горизонтального overflow. Override скинуто; журнал помилок вкладки порожній. Реальний zoom 200%, OS reduced motion, screen reader та FPS-профілювання повторно не виконувалися.

Остаточне уточнення: finish меню також перевіряє реальну видимість перед запуском локального таймера. Повернення PlanIt не програє першу фігуру наперед на короткому viewport. Та сама canReveal перевірка використовується при першій появі, звичайному RAF і завершенні навігації. Повторні focused ESLint, production build та export tests після цього уточнення — PASS; свіжа збірка після переходу Platforms знову показала forming/reveal=0.060 та видимий canvas.

Докази: audit-evidence/ascii-visible-arrival-settled.png, audit-evidence/ascii-visible-arrival-verification.json. Local static preview оновлено; вкладку референсу закрито. Graphify оновлено AST-only: 1074 nodes, 1768 edges, 84 communities. git diff --check — PASS.

## Переосмислення декоративних фігур — 23.10.2026

Джерело: користувач відхилив естетику великих ASCII-силуетів і попросив переосмислити ефект. Заміна — FlowSculpture: шість компактних параметричних поверхонь із тонкими нитками, точками й рідкими типографічними знаками. Глибина задає освітлення, а власне місце в композиції прибирає декор з-під тексту. Перші дві форми поєднані з live preview; наступні дві розміщені над copy; Everyday/Platforms мають окреме праве поле. Прибрано дві розмиті фонові картки біля переходу до Platforms, які конкурували з новою формою.

Старі HomepageAsciiArt, ascii-figures, CSS, тести старої моделі та невикористані navigation travel events видалені. Навігаційний scroll-контролер, швидкість переходів, фокус та доступні назви збережені. Кожна нова форма має незалежне складання 1450ms, початок при 18% видимості та вихідний гістерезис до повного зникнення. RAF завершується разом зі складанням; зупинка scroll не зупиняє час. Далекий перехід не створює чергу. Reduced motion дає статичну форму; hidden document призупиняє час. На мобільних декор прихований без spacer; preview зберігає звичайний потік.

Перевірено:
- npm run lint, focused ESLint після останніх JSX-правок — PASS.
- npm test — 52/52; два нові тести перевіряють межі/детермінізм усіх шести поверхонь та неперервність/точне завершення кожної траєкторії. Застарілі 15 тестів видалено разом зі старою моделлю.
- npm run build — PASS, TypeScript, 34 статичні сторінки; npm run test:export — 7/7.
- Браузер: темна й світла тема; ширини 360, 390, 768, 1024, 1440, 1920 та природні 3440px. Горизонтального overflow немає. На 1024px зазор між title і canvas Everyday/Platforms — 40px, на ширших — понад 200px. На 390px усі canvas мають нульову геометрію, live preview має природну висоту 102.5px.
- Клік PlanIt → Платформи: після прибуття заголовок має фокус, локальна форма входить у forming і завершує складання; без додаткового scroll. Перевірені перший блок, завдання, платформи. Production export відкритий на localhost:4173.
- Знімок після складання: audit-evidence/flow-sculpture-lesson-dark.png. Це статичний доказ композиції, не відеодоказ темпу.
- Console history містить dev-only hydration mismatch через сторонні bis_skin_checked атрибути й повідомлення extension listener на localhost:3000; помилок із URL production preview у перевіреному журналі немає. Розширення не вимикалися, попередження не приховувалися.
- git diff --check — PASS; graphify:update — 1044 nodes / 1674 edges / 80 communities, AST-only.

Межі: реальний OS reduced-motion, screen reader, zoom 200% і frame-time profiling цього разу не виконувалися. Reduced-motion branch та cleanup перевірені по коду; політика статичного завершення покрита математичною моделлю. DESIGN.md оновлений; EPIC_ASCII_STUDY.md позначений історичним дослідженням.

## Видалення відхилених абстрактних стрічок — 23.10.2026

Користувач прямо відхилив FlowSculpture як беззмістовний і непривабливий декор. Усі шість інстансів, renderer, модель, CSS і тести цього ефекту видалені. Початкові ширина, висота й потік live preview відновлені; прибрані обмеження ширини заголовків, створені під стрічки. Нової декоративної заміни не додано. Поточний стан описаний у DESIGN.md; попередній запис про FlowSculpture — історія відхиленого експерименту.

Перевірка: focused ESLint — PASS; npm test — 50/50; build — PASS із TypeScript і 34 статичними сторінками; export — 7/7. У браузері production preview після reload немає data-flow-sculpture, overflow = 0; знімок audit-evidence/without-flow-sculptures.png. Graphify AST update — 1028 nodes / 1639 edges / 89 communities. Посилань на видалений ефект у src/tests немає. Інші анімації та функції продукту не змінювалися.
