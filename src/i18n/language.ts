import i18n from 'i18next';
import { storage } from '@/lib/storage';
import { ensureLanguage } from './loaders';

const STORAGE_KEY = 'bm.language';

export function storedLanguage(): string | null {
  return storage.get<string | null>(STORAGE_KEY, null);
}

async function switchTo(lng: string): Promise<void> {
  await ensureLanguage(lng);
  await i18n.changeLanguage(lng);
  document.documentElement.lang = lng;
}

/** Applies the user's stored choice when the site offers it, else the site's default. */
export async function applyLanguage(
  available: readonly string[],
  fallback: string,
): Promise<string> {
  const wanted = storedLanguage();
  const lng = wanted && available.includes(wanted) ? wanted : fallback;
  await switchTo(lng);
  return lng;
}

/** The language switcher: remembers the choice for next time. */
export async function chooseLanguage(lng: string): Promise<void> {
  storage.set(STORAGE_KEY, lng);
  await switchTo(lng);
}
