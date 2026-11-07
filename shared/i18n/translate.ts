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

/** The `t` function returned by useT(), for helpers that format text. */
export type TFn = (key: MessageKey | PluralKey, params?: Params) => string;

/**
 * The values `V` for which `${Prefix}.${V}` is a message: `EnumValues<"reason.dq">` is the union of the
 * DQ reason codes that have a message. Used to look up a message by a code, with type checking.
 */
export type EnumValues<Prefix extends string, K = MessageKey> = K extends `${Prefix}.${infer Value}` ? Value : never;

/**
 * Look up a message chosen by a code: `translateEnum(locale, "reason.dq", "other")` is the message
 * `reason.dq.other`. The value's type must be covered by messages (a missing message, or a prefix
 * typo, is a type error), which replaces building the key as a template string with a cast.
 */
export function translateEnum<Prefix extends string>(
  locale: Locale,
  prefix: Prefix,
  value: EnumValues<Prefix>,
  params?: Params,
  catalogs: Catalogs = CATALOGS,
): string {
  return translateKey(locale, `${prefix}.${value}`, params, catalogs);
}

/** The `tEnum` function returned by useT(), for helpers that format text by code. */
export type TEnumFn = <Prefix extends string>(prefix: Prefix, value: EnumValues<Prefix>, params?: Params) => string;
