import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { roktolife } from './roktolife/theme';
import { ThemeProvider } from './ThemeProvider';

describe('ThemeProvider', () => {
  it('writes the theme to :root and marks the theme key', () => {
    render(
      <ThemeProvider themeKey="roktolife">
        <span />
      </ThemeProvider>,
    );
    const root = document.documentElement;
    expect(root.dataset['theme']).toBe('roktolife');
    expect(root.style.getPropertyValue('--c-primary-600').toLowerCase()).toBe(
      roktolife.brand.toLowerCase(),
    );
    expect(root.style.getPropertyValue('--c-canvas').toLowerCase()).toBe(
      roktolife.surfaces.canvas.toLowerCase(),
    );
  });
});
