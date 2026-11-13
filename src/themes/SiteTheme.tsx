import type { ReactNode } from 'react';
import { useSite } from '@/context/siteState';
import { cachedThemeKey } from './registry';
import { ThemeProvider } from './ThemeProvider';

/** The site's theme once known; until then the theme used last time (no color flash). */
export function SiteTheme({ children }: { children: ReactNode }) {
  const { site } = useSite();
  return (
    <ThemeProvider themeKey={site ? site.themeKey : cachedThemeKey()}>{children}</ThemeProvider>
  );
}
