export type ConsentChoice = "accepted" | "rejected";
export function isAnalyticsPage(pathname: string) {
  return /^\/(uk|en)\/?$/.test(pathname);
}
export const deniedConsent = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
} as const;
export const analyticsOnlyConsent = { ...deniedConsent, analytics_storage: "granted" } as const;

export function createConsentGate() {
  let choice: ConsentChoice = "rejected";
  return {
    update(next: ConsentChoice) { choice = next; },
    canGrant() { return choice === "accepted"; },
  };
}
