import i18n from 'i18next';

/**
 * For keys built at runtime (`errors.<CODE>`, `menu.<key>`, `lang.<code>`, Zod messages): the
 * translation when the key exists, else `fallback`. Static keys use `t()`, which is type-checked.
 */
export function tx(key: string, fallback: string, options?: Record<string, unknown>): string {
  if (!i18n.exists(key)) return fallback;
  return String((i18n.t as (k: string, o?: Record<string, unknown>) => unknown)(key, options));
}
