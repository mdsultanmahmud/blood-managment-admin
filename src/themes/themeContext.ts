import { createContext, useContext } from 'react';
import type { ThemeTokens } from './engine/tokens';
import type { ThemeDefinition } from './types';

export interface ThemeContextValue {
  theme: ThemeDefinition;
  tokens: ThemeTokens;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used inside ThemeProvider');
  return ctx;
}
