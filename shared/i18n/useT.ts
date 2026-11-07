"use client";

import { useCallback, useSyncExternalStore } from "react";
import { DEFAULT_LOCALE, type Locale, readLocale, subscribeLocale } from "./locale";
import type { MessageKey } from "./messages/en";
import { type EnumValues, type Params, type PluralKey, translate, translateEnum } from "./translate";

/**
 * Translation hook for Client Components.
 * - `t("auth.title")`: a message by its key (`t("common.squad", { number: 2 })`, plurals with `{ count }`).
 * - `tEnum("reason.dq", code)`: a message chosen by a code, with the code type-checked against the messages.
 *   Never build a key as a template string: use `tEnum`.
 */
export function useT(): {
  t: (key: MessageKey | PluralKey, params?: Params) => string;
  tEnum: <Prefix extends string>(prefix: Prefix, value: EnumValues<Prefix>, params?: Params) => string;
  locale: Locale;
} {
  const locale = useSyncExternalStore(subscribeLocale, readLocale, () => DEFAULT_LOCALE);
  const t = useCallback((key: MessageKey | PluralKey, params?: Params) => translate(locale, key, params), [locale]);
  const tEnum = useCallback(
    <Prefix extends string>(prefix: Prefix, value: EnumValues<Prefix>, params?: Params) =>
      translateEnum(locale, prefix, value, params),
    [locale],
  );
  return { t, tEnum, locale };
}
