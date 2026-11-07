import { DEFAULT_LOCALE, type Locale } from "./locale";
import { en, type MessageKey } from "./messages/en";
import { fi } from "./messages/fi";

export type Params = Record<string, string | number>;
export type Catalogs = Record<Locale, Record<string, string>>;

/** `foo.other` -> `foo`: base keys that can be called with { count }. */
type StripOther<K> = K extends `${infer Base}.other` ? Base : never;
export type PluralKey = StripOther<MessageKey>;

export const CATALOGS: Catalogs = { en, fi };

/**
 * Look up a message. Fallback chain when a translation is missing:
 * 1. the selected locale, 2. English, 3. the key itself (with a dev-only console warning).
 * With a numeric `count` param, `key.<plural category>` and `key.other` are tried before `key`.
 */
export function translate(
  locale: Locale,
  key: MessageKey | PluralKey,
  params?: Params,
  catalogs: Catalogs = CATALOGS,
): string {
  return translateKey(locale, key, params, catalogs);
}

/** Untyped core, also used by tests with custom catalogs. */
export function translateKey(locale: Locale, key: string, params?: Params, catalogs: Catalogs = CATALOGS): string {
  const order: Locale[] = locale === DEFAULT_LOCALE ? [DEFAULT_LOCALE] : [locale, DEFAULT_LOCALE];

  let raw: string | undefined;
  for (const loc of order) {
    const candidates =
      typeof params?.count === "number"
        ? [`${key}.${new Intl.PluralRules(loc).select(params.count)}`, `${key}.other`, key]
        : [key];
    raw = candidates.map((k) => catalogs[loc][k]).find((value) => value !== undefined);
    if (raw !== undefined) break;
  }

  if (raw === undefined) {
    if (process.env.NODE_ENV !== "production") console.warn(`[i18n] Missing message: "${key}" (${locale})`);
    return key;
  }

  return raw.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    params && name in params ? String(params[name]) : placeholder,
  );
}
