import { afterEach, describe, expect, it, vi } from 'vitest';
import { roktolife } from './roktolife/theme';
import { cachedThemeKey, DEFAULT_THEME_KEY, rememberThemeKey, resolveTheme } from './registry';

describe('theme registry', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses roktolife as the default and finds it by key', () => {
    expect(DEFAULT_THEME_KEY).toBe('roktolife');
    expect(resolveTheme('roktolife')).toBe(roktolife);
  });

  it('falls back to the default for a key the frontend does not have, with a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(resolveTheme('ocean')).toBe(roktolife);
    expect(warn).toHaveBeenCalledOnce();
  });

  it('falls back silently when the app has no theme key', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(resolveTheme(null)).toBe(roktolife);
    expect(warn).not.toHaveBeenCalled();
  });

  it('remembers the last key for the next first paint', () => {
    expect(cachedThemeKey()).toBeNull();
    rememberThemeKey('roktolife');
    expect(cachedThemeKey()).toBe('roktolife');
  });
});
