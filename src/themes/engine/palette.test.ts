import { describe, expect, it } from 'vitest';
import { contrastRatio, deriveScale, hexToOklch, SHADES } from './palette';
import { roktolife as themeConfig } from '../roktolife/theme';
import { buildCssVariables } from './tokens';

describe('palette derivation', () => {
  it('keeps the brand hex exactly as shade 600', () => {
    expect(deriveScale('#13647a')[600]).toBe('#13647A');
  });

  it('produces monotonically darker shades', () => {
    for (const hex of [
      '#13647A',
      '#C2362F',
      '#2E8540',
      '#B7791F',
      '#FFCC00',
      '#0A1F44',
      '#7C3AED',
      '#5B6470',
    ]) {
      const scale = deriveScale(hex);
      const lightness = SHADES.map((s) => hexToOklch(scale[s]).l);
      for (let i = 1; i < lightness.length; i++) {
        expect(lightness[i]).toBeLessThan(lightness[i - 1]!);
      }
    }
  });

  it('every shade is a valid hex', () => {
    const scale = deriveScale('#FFCC00');
    for (const s of SHADES) expect(scale[s]).toMatch(/^#[0-9A-F]{6}$/);
  });

  it('the configured brand gives readable white text on 600 and dark text on 50', () => {
    const scale = deriveScale(themeConfig.brand);
    expect(contrastRatio(scale[600], '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(scale[50], scale[900])).toBeGreaterThanOrEqual(7);
  });

  it('changing the one brand hex changes every primary variable', () => {
    const a = buildCssVariables(themeConfig);
    const b = buildCssVariables({ ...themeConfig, brand: '#7C3AED' });
    for (const s of SHADES) expect(a[`--c-primary-${s}`]).not.toBe(b[`--c-primary-${s}`]);
    expect(a['--c-neutral-500']).toBe(b['--c-neutral-500']);
  });

  it('rejects invalid input', () => {
    expect(() => deriveScale('teal')).toThrow();
  });
});
