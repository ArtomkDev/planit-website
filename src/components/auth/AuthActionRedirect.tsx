"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./AuthAction.module.css";

export function AuthActionRedirect() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const locale = params.get("lang") === "uk" ? "uk" : "en";
    const query = params.toString();

    window.location.replace(`/${locale}/auth/action${query ? `?${query}` : ""}`);
  }, [searchParams]);

  return (
    <main className={styles.redirectPage} aria-live="polite" aria-busy="true">
      <div className={styles.redirectMark} aria-hidden="true">P</div>
      <div className={styles.redirectContent}>
        <span className={styles.spinner} aria-hidden="true" />
        <p>Opening PlanIt…</p>
      </div>
    </main>
  );
}
