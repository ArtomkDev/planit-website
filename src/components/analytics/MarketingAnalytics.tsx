"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { APP_URL, PLAY_MARKET_URL } from "@/lib/site";
import { isAnalyticsPage } from "@/lib/analytics-consent";
import { parseCookiePreference } from "@/lib/cookie-preferences";
import { createMarketingEvent, type MarketingEvent } from "@/lib/marketing-events";

export function MarketingAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isAnalyticsPage(pathname)) return;
    const seenDemos = new Set<string>();
    const appHref = new URL(APP_URL).href;
    const playHref = new URL(PLAY_MARKET_URL).href;

    function hasConsent() {
      try {
        return parseCookiePreference(localStorage.getItem("planit-cookie-consent")) === "accepted";
      } catch {
        return false;
      }
    }

    function record(event: MarketingEvent | null) {
      if (!event || !hasConsent()) return;
      void import("@/lib/firebase").then(({ logMarketingEvent }) => logMarketingEvent(event)).catch(() => undefined);
    }

    function interact(event: Event) {
      if (!hasConsent() || !(event.target instanceof Element)) return;
      const target = event.target;
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (event.type === "click" && link) {
        const platform = link.href === appHref ? "web" : link.href === playHref ? "android" : null;
        if (platform) {
          const placement = link.closest("header") ? "header" : link.closest("footer") ? "footer" : link.closest("section[id]")?.id;
          record(createMarketingEvent("cta_click", { platform, placement: placement ?? "" }));
        }
      }
      if (target.closest("button,input,select,textarea")) {
        const article = target.closest("article[id^='feature-']");
        const feature = article?.id.replace("feature-", "");
        if (feature && !seenDemos.has(feature)) {
          const interaction = createMarketingEvent("demo_interaction", { feature });
          if (interaction) {
            seenDemos.add(feature);
            record(interaction);
          }
        }
      }
    }

    function toggle(event: Event) {
      if (event.target instanceof HTMLDetailsElement && event.target.open) {
        record(createMarketingEvent("faq_open", { question: event.target.dataset.faq ?? "" }));
      }
    }

    document.addEventListener("click", interact);
    document.addEventListener("change", interact);
    document.addEventListener("toggle", toggle, true);
    return () => {
      document.removeEventListener("click", interact);
      document.removeEventListener("change", interact);
      document.removeEventListener("toggle", toggle, true);
    };
  }, [pathname]);

  return null;
}
