import { storage } from '@/lib/storage';
import { roktolife } from './roktolife/theme';
import type { ThemeDefinition } from './types';

/**
 * Every theme of this app by its App hub theme key. Adding a theme: a folder next to roktolife/,
 * one line here, and the key in BC under App hub > Apps.
 */
export const THEMES: Readonly<Record<string, ThemeDefinition>> = {
  [roktolife.key]: roktolife,
};

export const DEFAULT_THEME_KEY = roktolife.key;

const CACHE_KEY = 'bm.themeKey';

/** The theme for a key from the site config; unknown or missing keys get the default. */
export function resolveTheme(key: string | null | undefined): ThemeDefinition {
  const found = key ? THEMES[key] : undefined;
  if (found) return found;
  if (key) console.warn(`Unknown theme key "${key}", using "${DEFAULT_THEME_KEY}"`);
  return roktolife;
}

/** The key applied last time, so the first paint already has the right colors. */
export function cachedThemeKey(): string | null {
  return storage.get<string | null>(CACHE_KEY, null);
}

export function rememberThemeKey(key: string): void {
  storage.set(CACHE_KEY, key);
}
