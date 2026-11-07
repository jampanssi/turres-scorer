"use client";

import { useSyncExternalStore } from "react";
import { ContrastIcon, MoonIcon, SunIcon } from "@/shared/ui/icons";
import {
  NEXT_PREFERENCE,
  type ThemePreference,
  THEME_CHANGE_EVENT,
  readPreference,
  writePreference,
} from "./theme";

const LABEL: Record<ThemePreference, string> = { system: "system", light: "light", dark: "dark" };
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
  const preference = useSyncExternalStore(subscribe, readPreference, () => "system" as const);
  const next = NEXT_PREFERENCE[preference];
  const Icon = ICON[preference];

  return (
    <button
      type="button"
      onClick={() => writePreference(next)}
      aria-label={`Theme: ${LABEL[preference]}. Switch to ${LABEL[next]}.`}
      title={`Theme: ${LABEL[preference]}`}
      className="flex size-11 shrink-0 items-center justify-center rounded-full text-white"
    >
      <Icon />
    </button>
  );
}
