import i18n from 'i18next';
import en from '@/locales/en.json';

/** Returns the translations of one language, or null when there are none. */
export type TranslationLoader = (lng: string) => Promise<Record<string, string> | null>;

/** Today only the bundled English exists. */
export const bundledLoader: TranslationLoader = (lng) =>
  Promise.resolve(lng === 'en' ? (en as Record<string, string>) : null);

let loader: TranslationLoader = bundledLoader;

/**
 * Where translations come from. When BC Language Management ships, a remote loader fetching
 * GET /api/v1/company/i18n/{lang} is set here and its result is added over the bundled English;
 * components and pages do not change (ADR 0022).
 */
export function setTranslationLoader(next: TranslationLoader): void {
  loader = next;
}

export async function ensureLanguage(lng: string): Promise<void> {
  if (i18n.hasResourceBundle(lng, 'translation')) return;
  const bundle = await loader(lng);
  if (bundle) i18n.addResourceBundle(lng, 'translation', bundle, true, true);
}
