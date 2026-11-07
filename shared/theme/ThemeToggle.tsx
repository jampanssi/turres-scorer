"use client";

import { useSyncExternalStore } from "react";
import { useT } from "@/shared/i18n/useT";
import { ContrastIcon, MoonIcon, SunIcon } from "@/shared/ui/icons";
import { NEXT_PREFERENCE, type ThemePreference, THEME_CHANGE_EVENT, readPreference, writePreference } from "./theme";

const ICON: Record<ThemePreference, typeof SunIcon> = {
  system: ContrastIcon,
  light: SunIcon,
  dark: MoonIcon,
};

function subscribe(onChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Cycles system → light → dark. Sits top right on the blue header, so the icon is white. */
export function ThemeToggle() {
  const { t } = useT();
  const preference = useSyncExternalStore(subscribe, readPreference, () => "system" as const);
  const next = NEXT_PREFERENCE[preference];
  const Icon = ICON[preference];
  const current = t(`theme.${preference}` as const);

  return (
    <button
      type="button"
      onClick={() => writePreference(next)}
      aria-label={t("theme.label", { current, next: t(`theme.${next}` as const) })}
      title={current}
      className="flex size-11 shrink-0 items-center justify-center rounded-full text-white"
    >
      <Icon />
    </button>
  );
}
