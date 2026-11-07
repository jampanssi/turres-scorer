"use client";

import { useCallback, useSyncExternalStore } from "react";
import { DEFAULT_LOCALE, type Locale, readLocale, subscribeLocale } from "./locale";
import type { MessageKey } from "./messages/en";
import { type Params, type PluralKey, translate } from "./translate";

/** Translation hook for Client Components: `const { t } = useT(); t("auth.title")`. */
export function useT(): { t: (key: MessageKey | PluralKey, params?: Params) => string; locale: Locale } {
  const locale = useSyncExternalStore(subscribeLocale, readLocale, () => DEFAULT_LOCALE);
  const t = useCallback((key: MessageKey | PluralKey, params?: Params) => translate(locale, key, params), [locale]);
  return { t, locale };
}
