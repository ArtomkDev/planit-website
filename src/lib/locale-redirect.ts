// Runs directly in the entry document's head, before hydration or visible content.
// Keep this self-contained: the static export has no request-time locale routing.
// Search engine crawlers are not redirected: the root is the hreflang x-default
// language selector, and redirecting them would collapse it into one locale
// (Googlebot reports en-US). They see the same HTML a visitor without JavaScript sees.
// Named crawlers only: a generic "bot" match would also catch phone models such as CUBOT.
export const crawlerUserAgentPattern = "googlebot|google-inspectiontool|storebot-google|adsbot-google|mediapartners-google|bingbot|adidxbot|bingpreview|yandexbot|yandexmobilebot|baiduspider|duckduckbot|applebot|slurp|petalbot|seznambot|facebookexternalhit|twitterbot|linkedinbot|telegrambot|discordbot|slackbot";

export const localeRedirectScript = `
(function () {
  try {
    if (new RegExp("${crawlerUserAgentPattern}", "i").test(navigator.userAgent || "")) return;
  } catch (_) {}

  var locale;
  try {
    var saved = window.localStorage.getItem("planit:locale");
    if (saved === "uk" || saved === "en") locale = saved;
  } catch (_) {}

  if (!locale) {
    try {
      var cookie = document.cookie.match(/(?:^|;\\s*)NEXT_LOCALE=(uk|en)(?:;|$)/);
      if (cookie) locale = cookie[1];
    } catch (_) {}
  }

  if (!locale) {
    var languages = navigator.languages && navigator.languages.length
      ? navigator.languages : [navigator.language];
    for (var i = 0; i < languages.length; i++) {
      var match = (languages[i] || "").toLowerCase().match(/^(uk|en)(?:-|$)/);
      if (match) {
        locale = match[1];
        break;
      }
    }
  }

  window.location.replace("/" + (locale || "uk") + window.location.search + window.location.hash);
})();
`;
