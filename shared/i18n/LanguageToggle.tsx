"use client";

import { GlobeIcon } from "@/shared/ui/icons";
import { LOCALES, writeLocale } from "./locale";
import { useT } from "./useT";

/**
 * Language switch for Sign in (signed-in screens use the user menu). Same logic as the menu's
 * language row: it names the language you will switch TO ("Suomi" while English is on).
 */
export function LanguageToggle() {
  const { locale } = useT();
  const next = LOCALES[(LOCALES.findIndex((l) => l.code === locale) + 1) % LOCALES.length];

  return (
    <button
      type="button"
      onClick={() => writeLocale(next.code)}
      className="flex min-h-touch shrink-0 items-center gap-2 rounded-full px-3 text-[15px] font-semibold text-white"
    >
      <GlobeIcon strokeWidth={2} width={20} height={20} />
      <span lang={next.code}>{next.name}</span>
    </button>
  );
}
