const eventValues = {
  cta_click: {
    platform: ["web", "android"],
    placement: ["header", "top", "features", "everyday", "platforms", "get-started", "footer"],
  },
  demo_interaction: { feature: ["lesson", "tasks", "schedule", "appearance"] },
  faq_open: { question: ["price", "account", "start", "offline", "ios", "reminders", "sharing", "files", "demo", "privacy"] },
} as const;

export type MarketingEventName = keyof typeof eventValues;
export type MarketingEvent = { name: MarketingEventName; parameters: Record<string, string> };

export function createMarketingEvent(name: MarketingEventName, values: Record<string, string>): MarketingEvent | null {
  if (!Object.hasOwn(eventValues, name)) return null;
  const fields: Record<string, readonly string[]> | undefined = eventValues[name];
  if (!fields || Object.keys(values).length !== Object.keys(fields).length) return null;
  if (!Object.entries(fields).every(([key, allowed]) => allowed.includes(values[key]))) return null;
  return { name, parameters: { ...values } };
}

export async function dispatchMarketingEvent<T>(event: MarketingEvent, connection: {
  isAllowed: () => boolean;
  connect: () => Promise<T | null>;
  send: (analytics: T, event: MarketingEvent) => void;
}) {
  const safeEvent = createMarketingEvent(event.name, event.parameters);
  if (!safeEvent || !connection.isAllowed()) return false;
  const analytics = await connection.connect();
  if (!analytics || !connection.isAllowed()) return false;
  connection.send(analytics, safeEvent);
  return true;
}
