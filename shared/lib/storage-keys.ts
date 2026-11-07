/**
 * Every key and event name the app uses in browser storage or on `window`, in one place, so they
 * cannot collide or drift. `key` is the localStorage key, `event` the in-page change notification.
 */
export const STORAGE = {
  theme: { key: "turres-scorer.theme", event: "turres-scorer:theme" },
  locale: { key: "turres-scorer.locale", event: "turres-scorer:locale" },
  session: { key: "turres-scorer.session", event: "turres-scorer:session" },
} as const;

/** The IndexedDB database that holds the saved results (see shared/data/local.ts). */
export const INDEXED_DB_NAME = "turres-scorer";
