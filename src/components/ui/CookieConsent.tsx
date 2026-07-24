"use client";

import { Cookie } from "@phosphor-icons/react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CookieConsentChoice } from "@/lib/firebase";

const COOKIE_CONSENT_STORAGE_KEY = "planit-cookie-consent";

type StoredCookieConsent = {
  choice?: CookieConsentChoice;
  status?: CookieConsentChoice;
  updatedAt?: string;
  version?: number;
};

function isCookieConsentChoice(value: unknown): value is CookieConsentChoice {
  return value === "accepted" || value === "rejected";
}

function readStoredConsent(): CookieConsentChoice | null {
  try {
    const storedValue = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);

    if (!storedValue) {
      return null;
    }

    if (isCookieConsentChoice(storedValue)) {
      return storedValue;
    }

    const parsed = JSON.parse(storedValue) as StoredCookieConsent;

    if (isCookieConsentChoice(parsed.choice)) {
      return parsed.choice;
    }

    if (isCookieConsentChoice(parsed.status)) {
      return parsed.status;
    }
  } catch {
    return null;
  }

  return null;
}

function writeStoredConsent(choice: CookieConsentChoice): void {
  try {
    window.localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify({
        choice,
        updatedAt: new Date().toISOString(),
        version: 1,
      }),
    );
  } catch {
    return;
  }
}

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

async function syncFirebaseAnalyticsConsent(choice: CookieConsentChoice): Promise<void> {
  const { updateFirebaseAnalyticsConsent } = await import("@/lib/firebase");

  await updateFirebaseAnalyticsConsent(choice);
}

const shapeOneOuterVariants: Variants = {
  rest: {
    scale: 1,
    rotate: 0,
    x: 0,
    y: 0,
    opacity: 0.15,
    transition: { type: "spring", stiffness: 50, damping: 15 },
  },
  hover: {
    scale: 1.4,
    rotate: 45,
    x: 20,
    y: -20,
    opacity: 0.4,
    transition: { type: "spring", stiffness: 50, damping: 15 },
  },
  buttonHover: {
    scale: 1.8,
    rotate: 90,
    x: 40,
    y: -40,
    opacity: 0.7,
    transition: { type: "spring", stiffness: 50, damping: 12 },
  },
};

const shapeTwoOuterVariants: Variants = {
  rest: {
    scale: 1,
    rotate: 0,
    x: 0,
    y: 0,
    opacity: 0.15,
    transition: { type: "spring", stiffness: 50, damping: 15 },
  },
  hover: {
    scale: 1.4,
    rotate: -45,
    x: -20,
    y: 20,
    opacity: 0.4,
    transition: { type: "spring", stiffness: 50, damping: 15 },
  },
  buttonHover: {
    scale: 1.8,
    rotate: -90,
    x: -40,
    y: 40,
    opacity: 0.7,
    transition: { type: "spring", stiffness: 50, damping: 12 },
  },
};

export const CookieConsent = () => {
  const t = useTranslations("CookieConsent");
  const locale = useLocale();
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const [sessionConsent, setSessionConsent] = useState<CookieConsentChoice | null>(null);
  const syncedConsentRef = useRef<CookieConsentChoice | null>(null);
  const storedConsent = mounted ? readStoredConsent() : null;
  const effectiveConsent = sessionConsent ?? storedConsent;
  const isVisible = mounted && !effectiveConsent;

  const [isCardHovered, setIsCardHovered] = useState<boolean>(false);
  const [isButtonHovered, setIsButtonHovered] = useState<boolean>(false);

  const animationState = isButtonHovered ? "buttonHover" : isCardHovered ? "hover" : "rest";

  useEffect(() => {
    if (effectiveConsent && syncedConsentRef.current !== effectiveConsent) {
      syncedConsentRef.current = effectiveConsent;
      void syncFirebaseAnalyticsConsent(effectiveConsent);
    }
  }, [effectiveConsent]);

  function handleChoice(choice: CookieConsentChoice): void {
    writeStoredConsent(choice);
    setSessionConsent(choice);

    if (syncedConsentRef.current === choice) {
      return;
    }

    syncedConsentRef.current = choice;
    void syncFirebaseAnalyticsConsent(choice);
  }

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.aside
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-description"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 sm:px-6 sm:pb-6"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="pointer-events-auto relative mx-auto flex max-w-5xl flex-col gap-5 overflow-hidden rounded-[2rem] border border-zinc-200 bg-white/80 p-6 shadow-2xl backdrop-blur-xl transition-colors duration-500 dark:border-zinc-800 dark:bg-zinc-950/80 sm:flex-row sm:items-center sm:justify-between sm:p-8"
            onMouseEnter={() => setIsCardHovered(true)}
            onMouseLeave={() => setIsCardHovered(false)}
          >
            <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#F45B8A]/5 via-transparent to-transparent dark:from-[#3EF7D2]/10" />

            <motion.div
              variants={shapeOneOuterVariants}
              initial="rest"
              animate={animationState}
              className="pointer-events-none absolute -left-12 -top-12 z-0 h-40 w-40 mix-blend-multiply blur-[30px] dark:mix-blend-screen"
            >
              <motion.div
                animate={{
                  scale: [0.9, 1.1, 0.9],
                  borderRadius: [
                    "40% 60% 70% 30% / 40% 50% 60% 50%",
                    "50% 50% 60% 40% / 50% 60% 50% 40%",
                    "40% 60% 70% 30% / 40% 50% 60% 50%",
                  ],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="h-full w-full bg-[#3EF7D2]"
              />
            </motion.div>

            <motion.div
              variants={shapeTwoOuterVariants}
              initial="rest"
              animate={animationState}
              className="pointer-events-none absolute -bottom-12 -right-12 z-0 h-48 w-48 mix-blend-multiply blur-[30px] dark:mix-blend-screen"
            >
              <motion.div
                animate={{
                  scale: [0.9, 1.05, 0.9],
                  borderRadius: [
                    "50% 50% 30% 70% / 50% 50% 70% 30%",
                    "40% 60% 40% 60% / 60% 40% 60% 40%",
                    "50% 50% 30% 70% / 50% 50% 70% 30%",
                  ],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="h-full w-full bg-[#F45B8A]"
              />
            </motion.div>

            <div className="relative z-10 flex min-w-0 gap-5">
              <motion.span
                animate={isCardHovered ? { rotate: [0, -10, 10, 0], scale: 1.1 } : { rotate: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-lg dark:bg-white dark:text-zinc-950"
              >
                <Cookie weight="duotone" className="h-6 w-6" />
              </motion.span>
              <div className="min-w-0">
                <h2 id="cookie-consent-title" className="text-lg font-black tracking-tight text-zinc-950 dark:text-white">
                  {t("title")}
                </h2>
                <p id="cookie-consent-description" className="mt-1.5 max-w-2xl text-sm font-medium leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {t("description")}
                </p>
              </div>
            </div>

            <div className="relative z-10 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
                onClick={() => handleChoice("accepted")}
                className="group inline-flex h-12 items-center justify-center rounded-full bg-zinc-950 px-6 text-sm font-black text-white shadow-[0_0_20px_-5px_rgba(0,0,0,0.1)] transition-all duration-300 hover:bg-[#c93667] hover:shadow-[0_0_30px_-5px_rgba(244,91,138,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F45B8A] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-white dark:text-zinc-950 dark:hover:bg-[#3EF7D2] dark:hover:shadow-[0_0_30px_-5px_rgba(62,247,210,0.4)] dark:focus-visible:ring-[#3EF7D2] dark:focus-visible:ring-offset-zinc-950"
              >
                {t("accept")}
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
                onClick={() => handleChoice("rejected")}
                className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300/70 bg-white/70 px-6 text-sm font-black text-zinc-800 transition-all duration-300 hover:bg-zinc-100 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F45B8A] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-zinc-700/70 dark:bg-zinc-900/70 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:ring-[#3EF7D2] dark:focus-visible:ring-offset-zinc-950"
              >
                {t("reject")}
              </motion.button>
              <Link
                href={`/${locale}/wiki/cookies`}
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
                className="inline-flex h-12 items-center justify-center rounded-full px-4 text-sm font-black text-zinc-500 transition-colors duration-300 hover:text-[#c93667] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F45B8A] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-zinc-400 dark:hover:text-[#3EF7D2] dark:focus-visible:ring-[#3EF7D2] dark:focus-visible:ring-offset-zinc-950"
              >
                {t("learnMore")}
              </Link>
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
};