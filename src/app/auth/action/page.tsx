import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthActionRedirect } from "@/components/auth/AuthActionRedirect";
import styles from "@/components/auth/AuthAction.module.css";

export const metadata: Metadata = {
  title: "Opening PlanIt",
  description: "Continue a PlanIt account action in your preferred language.",
  robots: { index: false, follow: false },
};

function RedirectFallback() {
  return (
    <main className={styles.redirectPage} aria-live="polite" aria-busy="true">
      <div className={styles.redirectContent}>
        <span className={styles.spinner} aria-hidden="true" />
        <p>Opening PlanIt…</p>
      </div>
    </main>
  );
}

export default function AuthActionEntryPage() {
  return (
    <Suspense fallback={<RedirectFallback />}>
      <AuthActionRedirect />
    </Suspense>
  );
}
