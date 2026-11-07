"use client";

import { LOCALES, type Locale, writeLocale } from "./locale";
import { useT } from "./useT";

const nameOf = (code: Locale) => LOCALES.find((l) => l.code === code)?.name ?? code;

/** Switches between the available languages (EN | FI). Sits top right next to the theme toggle. */
export function LanguageToggle() {
  const { t, locale } = useT();
  const next = LOCALES[(LOCALES.findIndex((l) => l.code === locale) + 1) % LOCALES.length].code;

  return (
    <button
      type="button"
      onClick={() => writeLocale(next)}
      aria-label={t("language.label", { current: nameOf(locale), next: nameOf(next) })}
      className="flex size-11 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold uppercase text-white"
    >
      {locale}
    </button>
  );
}
