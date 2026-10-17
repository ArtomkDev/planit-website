// Runs directly in the entry document's head, before hydration or visible content.
// Keep this self-contained: the static export has no request-time locale routing.
export const localeRedirectScript = `
(function () {
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
