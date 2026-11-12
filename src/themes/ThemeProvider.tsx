import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useLayoutEffect, useMemo, type ReactNode } from 'react';
import { buildMuiTheme } from './engine/muiTheme';
import { applyCssVariables, buildCssVariables, buildTokens } from './engine/tokens';
import { rememberThemeKey, resolveTheme } from './registry';
import { ThemeContext, type ThemeContextValue } from './themeContext';

/** Applies one registered theme: CSS variables for Tailwind, the MUI theme, `data-theme`. */
export function ThemeProvider({
  themeKey,
  children,
}: {
  themeKey: string | null;
  children: ReactNode;
}) {
  const theme = useMemo(() => resolveTheme(themeKey), [themeKey]);
  const tokens = useMemo(() => buildTokens(theme), [theme]);
  const muiTheme = useMemo(() => buildMuiTheme(theme, tokens), [theme, tokens]);

  useLayoutEffect(() => {
    applyCssVariables(buildCssVariables(theme, tokens));
    // Hook for theme-specific CSS: [data-theme='<key>'] selectors.
    document.documentElement.dataset['theme'] = theme.key;
    rememberThemeKey(theme.key);
  }, [theme, tokens]);

  const value = useMemo<ThemeContextValue>(() => ({ theme, tokens }), [theme, tokens]);
  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
