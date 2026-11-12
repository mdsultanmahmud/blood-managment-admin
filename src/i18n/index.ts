import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en.json';
import { storedLanguage } from './language';

export const DEFAULT_LANGUAGE = 'en';

/**
 * One flat namespace with dotted keys (auth.login.title), so a key is one row for BC Language
 * Management later (ADR 0022). English is bundled and is the fallback for every language.
 */
void i18n.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: storedLanguage() ?? DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  keySeparator: false,
  nsSeparator: false,
  interpolation: { escapeValue: false }, // React escapes already
  initAsync: false,
});

export default i18n;
