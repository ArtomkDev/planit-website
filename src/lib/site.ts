// Website identity and product destinations are intentionally separate.
export const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || "https://planit-app.com").replace(/\/$/, "");
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://planit-demo.web.app";
export const PLAY_MARKET_URL = "https://play.google.com/store/apps/details?id=com.artomk.planit";
export const SUPPORT_URL = "mailto:planit.app.support@gmail.com";

export function buildLocaleUrl(pathname: string, search: string, hash: string, targetLocale: string) {
  const path = pathname.replace(/^(?:\/(?:en|uk))+(?=\/|$)/, "");
  const targetPath = `/${targetLocale}${path === "/" ? "" : path}`;
  const params = new URLSearchParams(search);
  if (path === "/auth/action" && params.size) {
    params.set("lang", targetLocale);
    const continueUrl = params.get("continueUrl");
    if (continueUrl) {
      try {
        const url = new URL(continueUrl);
        url.searchParams.set("lang", targetLocale);
        params.set("continueUrl", url.toString());
      } catch {
        // The action page validates malformed continuation URLs.
      }
    }
  }
  return `${targetPath}${params.size ? `?${params}` : ""}${hash}`;
}
