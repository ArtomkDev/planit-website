import siteConfig from "../../site.config.json";

// Website identity and product destinations are intentionally separate.
export function resolveSiteUrl(value?: string) {
  const url = new URL(value?.trim() || siteConfig.origin);
  if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("NEXT_PUBLIC_BASE_URL must be an HTTPS origin without a path, query or credentials.");
  }
  return url.origin;
}

export const SITE_URL = resolveSiteUrl(process.env.NEXT_PUBLIC_BASE_URL);
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
