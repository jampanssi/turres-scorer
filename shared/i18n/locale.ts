/**
 * Locale preference. English is the source language and the default; Finnish is selectable.
 * The choice is remembered in localStorage and mirrored to <html lang>.
 * LOCALE_INIT_SCRIPT sets <html lang> before first paint (the text itself switches on hydration).
 */

export type Locale = "en" | "fi";

/** Language names are shown in their own language and are not translated. */
export const LOCALES: ReadonlyArray<{ code: Locale; name: string }> = [
  { code: "en", name: "English" },
  { code: "fi", name: "Suomi" },
];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_STORAGE_KEY = "turres-scorer.locale";
export const LOCALE_CHANGE_EVENT = "turres-scorer:locale";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "fi";
}

export function readLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(stored) ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function writeLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Storage can be blocked; the language still changes for this page view.
  }
  document.documentElement.lang = locale;
  window.dispatchEvent(new Event(LOCALE_CHANGE_EVENT));
}

export function subscribeLocale(onChange: () => void): () => void {
  window.addEventListener(LOCALE_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(LOCALE_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Inline <script> for <head>: sets <html lang> from the stored choice. Keep in sync with readLocale. */
export const LOCALE_INIT_SCRIPT = `(function(){try{var l=localStorage.getItem(${JSON.stringify(
  LOCALE_STORAGE_KEY,
)});document.documentElement.lang=(l==="fi"||l==="en")?l:${JSON.stringify(DEFAULT_LOCALE)}}catch(e){}})()`;
