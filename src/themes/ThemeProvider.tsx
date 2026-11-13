import { useLayoutEffect, useMemo, type ReactNode } from 'react';
import { applyCssVariables, buildCssVariables, buildTokens } from './engine/tokens';
import { rememberThemeKey, resolveTheme } from './registry';
import { ThemeContext, type ThemeContextValue } from './themeContext';

/** Applies one registered theme: CSS variables for Tailwind, `data-theme`. */
export function ThemeProvider({
  themeKey,
  children,
}: {
  themeKey: string | null;
  children: ReactNode;
}) {
  const theme = useMemo(() => resolveTheme(themeKey), [themeKey]);
  const tokens = useMemo(() => buildTokens(theme), [theme]);

  useLayoutEffect(() => {
    applyCssVariables(buildCssVariables(theme, tokens));
    // Hook for theme-specific CSS: [data-theme='<key>'] selectors.
    document.documentElement.dataset['theme'] = theme.key;
    rememberThemeKey(theme.key);
  }, [theme, tokens]);

  const value = useMemo<ThemeContextValue>(() => ({ theme, tokens }), [theme, tokens]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
