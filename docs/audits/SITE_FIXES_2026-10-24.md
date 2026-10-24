# Виправлення аудиту та пошукова видимість PlanIt

Дата: 24.10.2026. Межі: тільки planit-website. Основний застосунок не змінювався. Початкові знахідки й докази залишаються в [аудиті 20.10](SITE_AUDIT_2026-10-20.md).

## Реалізовано

- Один HTTPS origin planit-hub.web.app для canonical, hreflang, robots, sitemap, social images та structured data. Власного домену, за уточненням власника, поки немає. Невалідні налаштування origin зупиняють збірку.
- Корінь більше не має noindex. Є WebSite JSON-LD з назвою PlanIt та короткий fallback із мовними посиланнями. Redirect у head зберігає попередній вибір мови, query й hash до першого малювання. Локалізовані головні мають ту саму identity, власні canonical і взаємні hreflang; корінь є x-default.
- Sitemap містить 13 URL. Юридичні lastmod походять із реальної дати документа; дата збірки не видається за зміну змісту. Сторінки дій акаунта залишаються noindex.
- Назва PlanIt й призначення навчального планера є у видимому першому екрані, titles/descriptions і structured data. SoftwareApplication пов’язаний із чинною Google Play сторінкою; рейтингів, відгуків або неіснуючого iOS-релізу не додано.
- Новий перший екран пояснює навчальну ситуацію, чинну безоплатність, заплановану рекламу на всіх платформах і шлях «Продовжити як гість». Підписка описана як майбутня, без ціни чи дати. iOS — у розробці без обіцянки строку.
- Три короткі кроки старту, порядок демо заняття → завдання → налаштування → оформлення та однозначна дія «Відкрити повну вебверсію». Демо не обіцяють перенесення введеного в застосунок.
- Десять відповідей FAQ у початковому HTML: ціна, акаунт, старт за кодом, offline, iOS, нагадування/віджет, копія розкладу, файли/імпорт, демо та видалення даних. Є автор і підтримка.
- Контраст світлого заголовка та автоматичний колір тексту preview; значущий вміст не прихований opacity/blur до JavaScript. Reduced motion врахований у виправлених рухах. Фірмовий PixelDisplay збережений.
- Прогрів читача документів перенесений на юридичні маршрути. Виправлено кешування змінюваних MDX/manifest/HTML і MIME PNG для social assets.
- Події CTA, демо та FAQ дозволені лише після згоди на аналітику. Значення форм, коди, URL і персональні дані не передаються; згода перевіряється повторно після асинхронного підключення SDK.
- Build формує перевірений stamp і release.json. Перед публікацією звіряються source/export, legal hashes, локалізації й metadata. Змінений або застарілий export не можна опублікувати через SkipBuild. Є вибір уже авторизованого Firebase-акаунта без зміни глобального default.

## Перевірки

Lint, TypeScript у production build, 56/56 unit tests, 10/10 export tests, build 34 static entries, check:export та check:live проти локального production preview — PASS. Нові перевірки охоплюють невідповідність source/export, підміну документа, відсутній stamp, consent race, дозволені параметри подій та узгоджені crawler/brand signals.

Браузер: 28 комбінацій uk/en × світла/темна × 360/390/768/1023/1024/1440/1920px після останніх змін тексту. Горизонтального переповнення, обрізання основних заголовків та зайвого H1 не виявлено. Enter/Space у FAQ та взаємодія з чотирма демо перевірені в ході виправлень. На фінальній збірці підтверджено темний текст на світлій помаранчевій картці, query/hash при зміні мови й український вміст privacy без помилки reader. Зміна DOM value color-input через автоматизований fill не змінювала React draft, тому її не зараховано як тест нативного color picker.

Докази: [матриця ширин](../../audit-evidence/site-fixes-2026-10-24/responsive.json), [FAQ](../../audit-evidence/site-fixes-2026-10-24/faq-desktop.png), [опублікований перший екран](../../audit-evidence/site-fixes-2026-10-24/published-hero.png), [телефон](../../audit-evidence/site-fixes-2026-10-24/hero-mobile.png). Escape закриває мобільне меню й повертає фокус на його кнопку. Graphify оновлено AST-only: 1077 nodes, 1743 edges, 92 communities. Реальний OS reduced motion, screen reader, native touch, zoom 200%, польові Core Web Vitals та надсилання analytics до production SDK не перевірялися.

## Статус початкових знахідок

| Знахідки | Результат |
| --- | --- |
| A01–A04, A13–A14 | Виправлені origin, metadata, локалізовані assets, hashes, MIME і sitemap. Фактична публікація f74462cd3681 пройшла HTTP-перевірку. |
| A05–A10 | Додані правдиві умови, конкретна користь, гостьовий шлях, платформи, старт і чіткий CTA. Екран входу основного застосунку не змінювався. |
| A11–A12 | Важливі умови підняті до першої дії, зменшено desktop-відступи, додано FAQ й контрастний світлий заголовок. Сторінка все ще довга через чотири інтерактивні демо. |
| A15 | Реалізовано consented події сайту. Конверсія у створений розклад в окремому застосунку залишається поза цим репозиторієм. |
| A16 | Прибрано прогрів legal на головній і приховування значущого вмісту. Польові CWV не виміряні; проблему швидкодії не оголошено повністю закритою. |
| A17 | Є прозоре представлення автора й підтримка. Непідтверджених відгуків не додано. |

## Plerdy, Google та подальша індексація

Використано [безкоштовний URL checker Plerdy](https://www.plerdy.com/blog/seo-content-checker/) для публічного сайту. Вбудований звіт не показав даних; відкритий окремо звіт кореня показав посилання на стару sitemap на planit-app.com. Після публікації Plerdy показує правильну sitemap на planit-hub.web.app — [скриншот](../../audit-evidence/site-fixes-2026-10-24/plerdy-after-publication.png). Таблиця metadata й лічильники заголовків у цьому звіті залишилися неповними: Plerdy показує 0 H1 навіть коли HTTP-відповідь містить один. Тому повної числової оцінки Plerdy немає; звіт не видається за доказ покращення позицій. Plerdy scripts/session recording на сайт не встановлювалися.

Підхід відповідає [вимогам Google до індексації](https://developers.google.com/search/docs/essentials/technical), [WebSite/site name](https://developers.google.com/search/docs/appearance/site-names) та [Search Console](https://developers.google.com/search/docs/monitor-debug/search-console-start). Sitemap і structured data допомагають виявленню й розумінню, але не гарантують індексації або позиції за конкурентною назвою PlanIt. Результат потрібно оцінювати за фактичними impressions/clicks/queries у Search Console після обробки Google.

Для майбутнього домену: спершу підключити HTTPS до цього Hosting target, підтвердити доступність, змінити NEXT_PUBLIC_BASE_URL, зібрати й перевірити весь сайт. Старі адреси мають постійно перенаправлятися на відповідні нові маршрути; після перенесення оновити Search Console і Google Play website link. Переписувати canonical на ще неіснуючий домен не можна.

## Публікація та Search Console

Сайт опубліковано лише в Hosting target legal → planit-hub. Build ID f74462cd3681542fa8e3e7cc368ab6898987b8f169a266b91d34734117409bed; legal manifest a0e03d6383d2fd26. check:live підтвердив опубліковану ревізію, identity, robots/sitemap, обидві мови, hashes усіх документів і loading assets, canonical та MIME/signature PNG. Окрема [HTTP-перевірка](../../audit-evidence/site-fixes-2026-10-24/published-http.json) підтвердила 200 для головних/robots/sitemap і справжній 404/noindex для неіснуючої адреси. Встановлення заголовка User-Agent: Googlebot у цій перевірці не видається за обхід із мережі Google.

Користувач погодив підтвердження власності й подання sitemap через акаунт проєкту artomk.dev@gmail.com. Search Console підтвердив право власності методом HTML-файлу — [доказ](../../audit-evidence/site-fixes-2026-10-24/search-console-verified.png). Файл public/google1bc7d5ee2596486b.html потрібно зберігати; cleanUrls-перенаправлення в межах цього ж домену не завадило підтвердженню. Дані ефективності нового ресурсу ще обробляються.

Sitemap подано — [підтвердження](../../audit-evidence/site-fixes-2026-10-24/search-console-sitemap-submitted.png). Початковий і повторний звіти показали «Не вдалось отримати», тому статус успішної обробки sitemap не оголошується досягнутим. Для діагностики виконано саме Google Live Test: [sitemap](../../audit-evidence/site-fixes-2026-10-24/google-live-sitemap.png) і [українська головна](../../audit-evidence/site-fixes-2026-10-24/google-live-home.png) доступні Google. Для sitemap підтверджено crawl allowed = Yes, fetch = Successful, indexing allowed = Yes. Браузерний XML-парсер не виявив parsererror і прочитав 13 URL. [Ручних санкцій](../../audit-evidence/site-fixes-2026-10-24/google-no-manual-actions.png) та [проблем безпеки](../../audit-evidence/site-fixes-2026-10-24/google-no-security-issues.png) не виявлено. Після успішного live test sitemap повторно подано один раз; подальші повторні натискання не виконувалися. [Довідка Google](https://support.google.com/webmasters/answer/7451001?hl=en) пояснює можливі тимчасові fetch errors та автоматичні повторні спроби протягом кількох днів.

Окремий ручний запит індексації /uk не прийнятий: спочатку Search Console повідомив про неможливість підключення до reCAPTCHA, після оновлення сторінки — про вичерпання денної квоти й необхідність спробувати завтра, 25.10.2026. [Доказ квоти](../../audit-evidence/site-fixes-2026-10-24/google-indexing-quota.png). CAPTCHA не обходилася, інший акаунт для обходу квоти не використовувався. Вкладку залишено для продовження власником. Потрібно повторити ручний запит після відновлення квоти та перевірити обробку sitemap; це не потребує нової збірки сайту. Поява в результатах і позиція за PlanIt на момент завершення ще не підтверджені.

Машиночитний підсумок зовнішніх перевірок: [search-console-status.json](../../audit-evidence/site-fixes-2026-10-24/search-console-status.json).
