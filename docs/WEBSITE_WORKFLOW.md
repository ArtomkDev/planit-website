# Оновлення сайту однією командою

## Звичайне оновлення

Із кореня planit-website:

```powershell
npm.cmd run site:update
```

Команда послідовно:

1. Читає адресу сайту, Firebase target, акаунт і перелік підтверджень із site.config.json.
2. Перевіряє, що чинний HTML-файл Google існує й не змінений.
3. Синхронізує обидві мови юридичних документів із ../PlanIt та формує loading-файли у цьому сайті. Джерело лише читається; основний застосунок не перезаписується.
4. Виконує lint і unit tests, production build із TypeScript та генерацію legal manifest.
5. Знаходить усі сторінки у готовому HTML, перевіряє canonical, мову, взаємні hreflang, title, description, H1, social metadata та внутрішні посилання. Автоматично створює out/sitemap.xml і out/seo-manifest.json.
6. Перевіряє цілісність export, SHA-256 документів і підтверджень, запускає export tests.
7. Порівнює нові адреси з попередньою публікацією. Видалена адреса потребує постійного redirect на чинну сторінку.
8. Публікує весь out лише в налаштований Hosting target сайту.
9. Перевіряє живу ревізію, metadata кожної сторінки, перенаправлення, 404, документи, зображення та файл Google. Успіх оголошується лише після цієї перевірки.

Помилка будь-якої перевірки до upload зупиняє публікацію. Якщо upload уже відбувся, а мережева перевірка не пройшла, команда явно повідомить про це й поверне ненульовий exit code. Останній успішно перевірений release (production або preview) записується в .firebase/last-website-release.json з його URL; цей локальний файл не потрапляє до Git.

Для підготовки та перевірки без публікації:

```powershell
npm.cmd run site:check
```

Якщо працюєте лише з копією сайту, а юридичні джерела основного проєкту недоступні та документи не змінювалися:

```powershell
npm.cmd run site:check -- --no-sync-legal
```

Цей явний параметр використовує вже наявні документи сайту. Без нього відсутнє або неактуальне джерело зупиняє процес. Шлях до іншої копії джерела: --legal-source <шлях>. Після зміни джерел потрібна нова збірка.

## Нова сторінка

```powershell
npm.cmd run page:new -- study-tips
```

Команда додає чернетку в src/content/pages.json і не перезаписує існуючу сторінку. Заповніть її uk та en: title, description, heading, intro і sections. У кожній секції є heading та paragraphs — масив звичайних текстових абзаців. Поставте updatedAt на фактичну дату зміни змісту й published: true. Після цього:

```powershell
npm.cmd run site:update
```

Отримаєте /uk/study-tips та /en/study-tips. Шаблон сам формує H1, canonical, hreflang, Open Graph, Twitter та WebPage JSON-LD; сторінки потрапляють у sitemap і посилання футера. Чернетки published: false не створюють публічних URL. Неповний переклад, повторний slug, зарезервована адреса або конфлікт зі звичайним Next route зупиняють збірку.

Живий приклад у тому самому форматі — getting-started. Для звичайного тексту React/TSX редагувати не потрібно. Якщо потрібна власна інтерактивна сторінка, створіть Next route й використайте createPageMetadata із src/lib/seo.ts. Фінальний HTML автоматично пройде той самий SEO-контроль і потрапить у sitemap; потрібно надати обидві мови та посилання на сторінку в доречному місці.

## Перейменування та видалення адрес

Зміна заголовка не потребує зміни slug. Якщо адресу все ж переміщено, додайте до hosting.redirects у firebase.json по правилу для кожної мови:

```json
{ "source": "/uk/old-page", "destination": "/uk/new-page", "type": 301 }
```

Нова ціль має існувати. Тимчасовий redirect або цикл не замінює постійний redirect для видаленої індексованої адреси. Перевірка використовує SEO inventory живого сайту; для першого запуску після впровадження — його чинну sitemap.

## Підтвердження Google та налаштування

Власність Search Console зберігається завдяки public/google1bc7d5ee2596486b.html. Його hash зареєстрований у site.config.json. Зникнення або зміна файлу блокує реліз; після upload його перевіряє HTTP-запит. Повторно підтверджувати власність під час звичайного оновлення не потрібно. Адреса sitemap.xml залишається сталою, Google може сам повторно читати її. Команда не видає успішну публікацію за завершену індексацію й не обходить квоти Search Console.

site.config.json містить публічні налаштування, а не паролі: origin, locales, hosting.project/target/account, legalSource і verificationFiles. Origin використовується також у Next metadata. За наявності NEXT_PUBLIC_BASE_URL у .env* перевірки завантажують його тим самим @next/env, що й Next, та використовують однакове ефективне значення.

При підключенні власного домену спершу забезпечте його HTTPS і прив’язку до цього Hosting site, потім змініть origin, перевірте відсутність старого override в .env* і запустіть site:update. Підтвердження нового ресурсу Google/DNS виконується один раз окремо: звичайний build не може створювати права на ще не підключений домен.

За уточненим запитом користувача залишені два власні домени: https://planitflow.com для сайту та https://app.planitflow.com для застосунку. Цілі публікації називаються `website` (site `planit-hub`) і `app` (site `planit-demo`); старе ім'я цілі `legal` прибране. `www.planitflow.com` від’єднано від Hosting, його CNAME видалено. Тимчасовий preview `prelaunch-web` і застарілі preview-адреси в Authorized Domains прибрані.

Реєстратор і DNS — Dynadot. Збережіть A кореня → 199.36.158.100, TXT кореня → hosting-site=planit-hub, CNAME app → planit-demo.web.app, а також окремий TXT google-site-verification для Search Console. TXT Firebase потрібен для подальшого поновлення HTTPS-сертифіката; звичайне оновлення сайту не вимагає змін DNS чи повторного підтвердження Google. Сертифікат поновлює Firebase автоматично.

Firebase автоматично надає кожному Hosting-сайту адреси `web.app` і `firebaseapp.com`. Вони є службовими псевдонімами двох наявних сайтів; прибрати ці адреси або перейменувати основний site ID `planit-hub` Firebase не дозволяє. Користувач обрав зберегти Firebase із двома власними доменами. SEO metadata вказує на planitflow.com. Не додавайте безумовне перенаправлення всіх шляхів у спільний firebase.json: воно застосувалося б також до власного домену й створило цикл. `planit-hub.firebaseapp.com` також обслуговує чинний OAuth callback.

У застосунку `../PlanIt` публічний сайт задається в `src/config/website.cjs`: його використовують екран «Про застосунок», поширення посилання та генератор юридичних документів. Після зміни домену запускайте там `npm.cmd run legal:sync` і `npm.cmd run legal:check`; згенерований `legalDocuments.generated.js` вручну не редагуйте. Серверна конфігурація листів має окрему межу публікації: `functions/src/accountEmailConfig.js` задає action-handler origin, а `functions/.env.<project>` може перевизначати continue URL. Зміни Functions і клієнтського застосунку потребують окремих релізів; `site:update` публікує тільки сайт.

Firebase `authDomain`, `EXPO_PUBLIC_FIREBASE_AUTH_LINK_DOMAIN`, проєктні ідентифікатори, CNAME-призначення та приклади вхідних `/__/auth/` посилань не є публічним origin сайту. Їх не замінюйте механічно: вони забезпечують OAuth, нативні посилання та сумісність із уже надісланими листами. Архівні скриншоти й вимірювання зберігають фактичні адреси на дату перевірки; актуальні посилання в документації ведуть на planitflow.com.

Залежності встановлюються окремим npm ci під час першого налаштування. Для Firebase потрібен один початковий вхід у налаштований акаунт: npm run firebase:login. Автоматичний реліз використовує наявний вхід і --non-interactive; без авторизації зупиниться.

Додаткові режими:

```powershell
npm.cmd run site:update -- --channel preview
npm.cmd run site:update -- --skip-build
npm.cmd run check:live
```

Preview також перевіряється після публікації. Після upload workflow викликає verify-live з `--wait-for-release`: до двох хвилин чекає, поки Hosting почне віддавати новий `release.json`, і лише тоді звіряє сайт. Ручний `check:live` не чекає й одразу повідомляє про стару публікацію. --skip-build призначений для повторного upload тієї самої збірки: source/export stamp має збігатися, синхронізація документів не виконується. Старі deploy:firebase та legal:publish залишаються сумісними обгортками цього самого workflow.

Sitemap генерується після production build. Для його локального перегляду використовуйте npm start; next dev не виконує postbuild і не має цього згенерованого файлу.

## Перевірка пошукової доступності

Після публікації можна виконати `npm.cmd run audit:search -- --output audit-evidence/search-audit-next.json`. Команда перевіряє DNS, HTTP, sitemap, усі його сторінки, robots у HTML/headers, canonical, мови, assets, старий privacy-вхід та службові hostname; результат зберігається як JSON. Вона не надсилає URL на індексацію. Фактичну індексацію й запити на сканування перевіряти у Search Console ресурсу https://planitflow.com/. Опис стану та докази — у [пошуковому аудиті 25.10.2026](audits/SEARCH_AUDIT_2026-10-25.md).
