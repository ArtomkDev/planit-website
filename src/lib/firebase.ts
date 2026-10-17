import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { analyticsOnlyConsent, createConsentGate, deniedConsent } from "./analytics-consent";
import {
  getAnalytics,
  isSupported,
  setConsent,
  setAnalyticsCollectionEnabled,
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

export const DEFAULT_DENIED_ANALYTICS_CONSENT = deniedConsent satisfies ConsentSettings;

const GRANTED_ANALYTICS_CONSENT = analyticsOnlyConsent satisfies ConsentSettings;

type GtagDataLayerCommand = IArguments | unknown[];

declare global {
  interface Window {
    dataLayer?: GtagDataLayerCommand[];
  }
}

let analyticsInstance: Analytics | null = null;
let analyticsInitialization: Promise<Analytics | null> | null = null;
let queuedGrantAfterBootstrap = false;
const consentGate = createConsentGate();

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
    .then(() => { if (consentGate.canGrant()) applyAnalyticsConsent(GRANTED_ANALYTICS_CONSENT); })
    .finally(() => {
      queuedGrantAfterBootstrap = false;
    });
}

export function denyFirebaseAnalyticsConsent(): void {
  consentGate.update("rejected");
  if (analyticsInstance) setAnalyticsCollectionEnabled(analyticsInstance, false);
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
        if (!supported || !consentGate.canGrant()) {
          return null;
        }

        applyAnalyticsConsent(DEFAULT_DENIED_ANALYTICS_CONSENT);
        analyticsInstance = getAnalytics(app);
        setAnalyticsCollectionEnabled(analyticsInstance, consentGate.canGrant());

        return analyticsInstance;
      })
      .catch(() => null);
  }

  const analytics = await analyticsInitialization;
  if (!analytics) analyticsInitialization = null;
  return analytics;
}

export async function updateFirebaseAnalyticsConsent(choice: CookieConsentChoice): Promise<Analytics | null> {
  consentGate.update(choice);
  if (choice === "rejected") {
    denyFirebaseAnalyticsConsent();
    return null;
  }

  const analytics = await getFirebaseAnalytics();

  if (analytics) {
    setAnalyticsCollectionEnabled(analytics, consentGate.canGrant());
    if (consentGate.canGrant()) queueGrantConsentAfterBootstrap();
  }

  return analytics;
}

export { app, db, auth };
