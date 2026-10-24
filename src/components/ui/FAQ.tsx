import { getLocale, getTranslations } from "next-intl/server";
import { AccentRule } from "./AccentRule";
import { SUPPORT_URL } from "@/lib/site";

export const faqItems = ["price", "account", "start", "offline", "ios", "reminders", "sharing", "files", "demo", "privacy"] as const;

export async function FAQ() {
  const t = await getTranslations("FAQ");
  const locale = await getLocale();

  return (
    <section id="faq" aria-labelledby="faq-title" className="relative z-20 mx-auto w-full max-w-5xl px-6 py-16 md:py-20">
      <span className="mb-4 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-brand-strong">
        <AccentRule />{t("badge")}
      </span>
      <h2 id="faq-title" className="max-w-2xl text-balance text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">{t("title")}</h2>
      <div className="mt-8 divide-y divide-site-border border-y border-site-border">
        {faqItems.map((item) => (
          <details key={item} name="planit-faq" data-faq={item} className="group">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-base font-bold text-site-text marker:content-none [&::-webkit-details-marker]:hidden">
              <span>{t(`items.${item}.question`)}</span>
              <span aria-hidden="true" className="shrink-0 text-2xl font-normal text-brand-strong group-open:rotate-45 motion-safe:transition-transform">+</span>
            </summary>
            <p className="max-w-[70ch] pb-6 text-base leading-7 text-site-muted sm:pr-6">{t(`items.${item}.answer`)}</p>
          </details>
        ))}
      </div>
      <p className="mt-6 text-sm leading-7 text-site-muted">{t("author")}</p>
      <div className="mt-2 flex flex-wrap gap-x-6">
        <a href={SUPPORT_URL} className="inline-flex min-h-11 items-center font-semibold text-brand-strong underline decoration-site-border-strong underline-offset-4 hover:decoration-current">{t("support")}</a>
        <a href={`/${locale}/wiki/privacy`} className="inline-flex min-h-11 items-center text-sm font-semibold text-site-muted underline decoration-site-border-strong underline-offset-4 hover:text-site-text">{t("privacyLink")}</a>
      </div>
    </section>
  );
}
