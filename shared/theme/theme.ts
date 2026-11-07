import { createPersistedStore } from "@/shared/lib/persisted-store";
import { STORAGE } from "@/shared/lib/storage-keys";

/**
 * Theme preference: "system" follows the OS, "light" / "dark" force one.
 * The resolved theme is written to <html data-theme="light|dark"> (see globals.css).
 * THEME_INIT_SCRIPT runs inline before first paint so there is no flash.
 */

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

// The stored preference. Writing it also applies the theme to <html> before subscribers are told.
const store = createPersistedStore({
  ...STORAGE.theme,
  onWrite: (value) => applyTheme(isPreference(value) ? value : "system"),
});

export function isPreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

export function resolveTheme(preference: ThemePreference, systemDark: boolean): ResolvedTheme {
  if (preference === "system") return systemDark ? "dark" : "light";
  return preference;
}

export function readPreference(): ThemePreference {
  const stored = store.read();
  return isPreference(stored) ? stored : "system";
}

export function subscribePreference(onChange: () => void): () => void {
  return store.subscribe(onChange);
}

/** The theme currently shown (what the inline script / applyTheme wrote to <html data-theme>). */
export function readResolvedTheme(): ResolvedTheme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

/** Notifies on preference changes and, while the preference is "system", on OS theme changes. */
export function subscribeResolvedTheme(onChange: () => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onMedia = () => {
    if (readPreference() === "system") applyTheme("system");
    onChange();
  };
  media.addEventListener("change", onMedia);
  const unsubscribe = subscribePreference(onChange);
  return () => {
    media.removeEventListener("change", onMedia);
    unsubscribe();
  };
}

export function applyTheme(preference: ThemePreference): void {
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.dataset.theme = resolveTheme(preference, systemDark);
}

export function writePreference(preference: ThemePreference): void {
  store.write(preference);
}

/** Same logic as above, as a string for an inline <script> in <head>. Keep the two in sync. */
export const THEME_INIT_SCRIPT = `(function(){try{var p=localStorage.getItem(${JSON.stringify(
  STORAGE.theme.key,
)});if(p!=="light"&&p!=="dark")p="system";var d=p==="dark"||(p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light"}catch(e){document.documentElement.dataset.theme="light"}})()`;
