# Підключення planitflow.com — 25.10.2026

Сайт опубліковано й перевірено на https://planitflow.com. Release: `df1df6ba7353ae35830dbb6adcb63d1cbf060cfe300494a643e2d8affa911592`, перевірено о 10:19 UTC. Публікувався тільки `hosting:legal`, що відповідає Hosting site `planit-hub`; основний застосунок `planit-demo.web.app` не змінювався.

## Домен і DNS

Dynadot показує Active, строк реєстрації до 25.10.2027, Auto Renew і Full Privacy. Поточна ціна продовження в кабінеті — $10.88; це спостереження на дату налаштування, а не гарантія незмінної майбутньої ціни. Додаткових продуктів не підключали.

| Ім’я | Тип | Значення |
| --- | --- | --- |
| Корінь | A | `199.36.158.100` |
| Корінь | TXT | `hosting-site=planit-hub` |
| Корінь | TXT | `google-site-verification=iXgmhK0mexgidOffocR6uAovvNA9vElvo04Vo52uKS4` |
| www | CNAME | `planit-hub.web.app` |

TTL — 5 хвилин. Стару паркувальну A-адресу прибрано. Обидва домени мають статус Connected у Firebase; `www.planitflow.com` налаштовано як перенаправлення до `planitflow.com`. HTTPS перевірено зі звичайною перевіркою сертифіката. HTTP перенаправляється на HTTPS; www зберігає шлях і query.

- [Збережені DNS-записи](../../audit-evidence/domain-setup-2026-10-25/dynadot-dns.png).
- [Connected у Firebase](../../audit-evidence/domain-setup-2026-10-25/firebase-connected.png).
- [HTTP, DNS і release](../../audit-evidence/domain-setup-2026-10-25/http-and-dns.json).

## Сайт і перевірки

`site.config.json.origin` змінено на `https://planitflow.com`. Старого `NEXT_PUBLIC_BASE_URL` у середовищі збірки немає. Canonical, hreflang, sitemap, robots, social images та structured data використовують новий origin. Google HTML-файл збережено з початковим SHA-256. Вебверсія застосунку залишається окремою адресою.

Виконано `npm.cmd run site:update`: синхронізація юридичних документів із джерела лише для читання, lint, 66 unit tests, production build із TypeScript, SEO й цілісність експорту, 11 export tests, публікація та перевірка всіх 15 індексованих сторінок, redirects, 404, юридичних матеріалів, зображень і ownership proof. Усе пройшло. `npm.cmd run graphify:update` виконано без LLM/API.

Службові web.app/firebaseapp.com адреси продовжують віддавати сайт, але canonical веде на власний домен. Перенаправлення старих hostname окремо не налаштовано; безумовний redirect у спільному Hosting config створив би цикл на новому домені. Постійні перенаправлення старих маршрутів збережено.

[Сайт на новому домені](../../audit-evidence/domain-setup-2026-10-25/live-homepage.png).

## Search Console

В акаунті `artomk.dev@gmail.com` успішно підтверджено ресурс `https://planitflow.com/`; Google показав способи HTML-файл і постачальник доменних імен. Sitemap `https://planitflow.com/sitemap.xml` подано рівно один раз. Після початкового проміжного «Не вдалось отримати» Google сам оновив результат на «Файл Sitemap оброблено», знайдено 15 сторінок. Повторного подання не було.

Перед цим одна перевірка доменного ресурсу через TXT повернула старий DNS-набір без нового маркера, хоча публічний Google DNS уже показував обидва TXT. Повторну DNS-перевірку не запускали; використали вже доступний HTML-доказ для HTTPS-ресурсу. Статус окремого доменного ресурсу після цього не перевіряли. Для sitemap використовується підтверджений HTTPS-ресурс.

Запитів ручної індексації та перевірок URL наживо в Search Console не виконували. Обробка sitemap не означає, що всі сторінки вже проіндексовані чи отримали позиції в пошуку.

- [Успішне підтвердження власності](../../audit-evidence/domain-setup-2026-10-25/search-console-verified.png).
- [Sitemap оброблено, 15 сторінок](../../audit-evidence/domain-setup-2026-10-25/search-console-sitemap-processed.png).

Подальші публікації: `npm.cmd run site:update`. DNS і підтвердження Google при кожній публікації повторювати не потрібно. Інструкції з обслуговування — [WEBSITE_WORKFLOW.md](../WEBSITE_WORKFLOW.md).
