/**
 * Locale preference. English is the source language and the default; Finnish is selectable.
 * The choice is remembered in localStorage and mirrored to <html lang>.
 * LOCALE_INIT_SCRIPT sets <html lang> before first paint (the text itself switches on hydration).
 */

import { createPersistedStore } from "@/shared/lib/persisted-store";
import { STORAGE } from "@/shared/lib/storage-keys";

export type Locale = "en" | "fi";

/** Language names are shown in their own language and are not translated. */
export const LOCALES: ReadonlyArray<{ code: Locale; name: string }> = [
  { code: "en", name: "English" },
  { code: "fi", name: "Suomi" },
];

export const DEFAULT_LOCALE: Locale = "en";

// The stored language. Writing it also updates <html lang> before subscribers are told.
const store = createPersistedStore({
  ...STORAGE.locale,
  onWrite: (value) => {
    document.documentElement.lang = isLocale(value) ? value : DEFAULT_LOCALE;
  },
});

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "fi";
}

export function readLocale(): Locale {
  const stored = store.read();
  return isLocale(stored) ? stored : DEFAULT_LOCALE;
}

export function writeLocale(locale: Locale): void {
  store.write(locale);
}

export function subscribeLocale(onChange: () => void): () => void {
  return store.subscribe(onChange);
}

/** Inline <script> for <head>: sets <html lang> from the stored choice. Keep in sync with readLocale. */
export const LOCALE_INIT_SCRIPT = `(function(){try{var l=localStorage.getItem(${JSON.stringify(
  STORAGE.locale.key,
)});document.documentElement.lang=(l==="fi"||l==="en")?l:${JSON.stringify(DEFAULT_LOCALE)}}catch(e){}})()`;
