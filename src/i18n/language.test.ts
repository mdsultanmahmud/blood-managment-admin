import i18n from 'i18next';
import { describe, expect, it } from 'vitest';
import { storage } from '@/lib/storage';
import { applyLanguage } from './language';

describe('language selection', () => {
  it('uses the stored choice when the site offers it, else the site default', async () => {
    storage.set('bm.language', 'bn');
    expect(await applyLanguage(['en'], 'en')).toBe('en');
    expect(i18n.language).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });
});
