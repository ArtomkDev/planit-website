export type CookieChoice = "accepted" | "rejected";
const lifetimeMs = 365 * 24 * 60 * 60 * 1000;

export function parseCookiePreference(value: string | null, now = Date.now()): CookieChoice | null {
  try {
    const stored = JSON.parse(value || "null");
    const choice = stored?.choice ?? stored?.status;
    const updatedAt = Date.parse(stored?.updatedAt);
    // Undated legacy preferences need renewal rather than lasting indefinitely.
    if (!Number.isFinite(updatedAt) || updatedAt > now || now - updatedAt >= lifetimeMs) return null;
    return choice === "accepted" || choice === "rejected" ? choice : null;
  } catch {
    return null;
  }
}
