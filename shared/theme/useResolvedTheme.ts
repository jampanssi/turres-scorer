"use client";

import { useSyncExternalStore } from "react";
import { readResolvedTheme, type ResolvedTheme, subscribeResolvedTheme } from "./theme";

/** The theme that is actually showing ("light" or "dark"), also when the preference is "system". */
export function useResolvedTheme(): ResolvedTheme {
  return useSyncExternalStore(subscribeResolvedTheme, readResolvedTheme, () => "light" as const);
}
