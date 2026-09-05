import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthActionClient } from "@/components/auth/AuthActionClient";
import styles from "@/components/auth/AuthAction.module.css";

type AuthActionPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: AuthActionPageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "AuthAction" });

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    robots: { index: false, follow: false },
  };
}

export default async function AuthActionPage({ params }: AuthActionPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "AuthAction" });

  return (
    <Suspense
      fallback={
        <section className={styles.page} aria-live="polite" aria-busy="true">
          <div className={styles.panel}>
            <div className={styles.state}>
              <span className={styles.spinner} aria-hidden="true" />
              <p className={styles.fallbackText}>{t("loading.generic")}</p>
            </div>
          </div>
        </section>
      }
    >
      <AuthActionClient />
    </Suspense>
  );
}
