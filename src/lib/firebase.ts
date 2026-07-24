import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  getAnalytics,
  isSupported,
  setConsent,
  type Analytics,
  type ConsentSettings,
} from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export const COOKIE_CONSENT_STORAGE_KEY = "planit-cookie-consent";

export type CookieConsentChoice = "accepted" | "rejected";

export const DEFAULT_DENIED_ANALYTICS_CONSENT = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
} satisfies ConsentSettings;

const GRANTED_ANALYTICS_CONSENT = {
  analytics_storage: "granted",
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
} satisfies ConsentSettings;

type GtagDataLayerCommand = IArguments | unknown[];

declare global {
  interface Window {
    dataLayer?: GtagDataLayerCommand[];
  }
}

let analyticsInstance: Analytics | null = null;
let analyticsInitialization: Promise<Analytics | null> | null = null;
let queuedGrantAfterBootstrap = false;

function applyAnalyticsConsent(consentSettings: ConsentSettings): void {
  if (typeof window === "undefined") {
    return;
  }

  setConsent(consentSettings);
}

if (typeof window !== "undefined") {
  applyAnalyticsConsent(DEFAULT_DENIED_ANALYTICS_CONSENT);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function dataLayerCommandToArray(command: GtagDataLayerCommand): unknown[] {
  return Array.from(command as ArrayLike<unknown>);
}

function hasFirebaseAnalyticsConfigCommand(): boolean {
  if (typeof window === "undefined" || !Array.isArray(window.dataLayer)) {
    return false;
  }

  return window.dataLayer.some((command) => {
    const [commandName, , config] = dataLayerCommandToArray(command);

    return commandName === "config" && isRecord(config) && config.origin === "firebase";
  });
}

function waitForFirebaseAnalyticsBootstrap(timeoutMs = 65_000): Promise<void> {
  if (typeof window === "undefined" || hasFirebaseAnalyticsConfigCommand()) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const startedAt = Date.now();
    const intervalId = window.setInterval(() => {
      if (hasFirebaseAnalyticsConfigCommand() || Date.now() - startedAt >= timeoutMs) {
        window.clearInterval(intervalId);
        resolve();
      }
    }, 100);
  });
}

function queueGrantConsentAfterBootstrap(): void {
  if (queuedGrantAfterBootstrap) {
    return;
  }

  queuedGrantAfterBootstrap = true;

  void waitForFirebaseAnalyticsBootstrap()
    .then(() => applyAnalyticsConsent(GRANTED_ANALYTICS_CONSENT))
    .finally(() => {
      queuedGrantAfterBootstrap = false;
    });
}

export function denyFirebaseAnalyticsConsent(): void {
  applyAnalyticsConsent(DEFAULT_DENIED_ANALYTICS_CONSENT);
}

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") {
    return null;
  }

  applyAnalyticsConsent(DEFAULT_DENIED_ANALYTICS_CONSENT);

  if (!analyticsInitialization) {
    analyticsInitialization = isSupported()
      .then((supported) => {
        if (!supported) {
          return null;
        }

        applyAnalyticsConsent(DEFAULT_DENIED_ANALYTICS_CONSENT);
        analyticsInstance = getAnalytics(app);

        return analyticsInstance;
      })
      .catch(() => null);
  }

  return analyticsInitialization;
}

export async function updateFirebaseAnalyticsConsent(choice: CookieConsentChoice): Promise<Analytics | null> {
  if (choice === "rejected") {
    denyFirebaseAnalyticsConsent();
    return null;
  }

  const analytics = await getFirebaseAnalytics();

  if (analytics) {
    queueGrantConsentAfterBootstrap();
  }

  return analytics;
}

export { app, db, auth };
