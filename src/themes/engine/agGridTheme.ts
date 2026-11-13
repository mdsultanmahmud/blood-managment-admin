import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';

// Registered here (not in main.tsx) so AG Grid loads only with pages that render a grid.
ModuleRegistry.registerModules([AllCommunityModule]);
import { cssVar } from './tokens';

/**
 * AG Grid theme built from the same CSS variables as Tailwind, so the grid re-themes live when
 * the brand changes (no rebuild of grid options needed).
 */
export const agGridTheme = themeQuartz.withParams({
  fontFamily: 'var(--font-ui)',
  fontSize: 13,
  dataFontSize: 13,
  headerFontSize: 12,
  headerFontWeight: 600,
  spacing: 7,
  rowHeight: 44,
  headerHeight: 38,
  accentColor: cssVar('primary', 600),
  foregroundColor: cssVar('neutral', 900),
  textColor: cssVar('neutral', 900),
  subtleTextColor: cssVar('neutral', 600),
  backgroundColor: 'var(--c-surface)',
  chromeBackgroundColor: cssVar('neutral', 50),
  headerBackgroundColor: cssVar('neutral', 50),
  headerTextColor: cssVar('neutral', 700),
  borderColor: cssVar('neutral', 200),
  rowBorder: { style: 'solid', width: 1, color: cssVar('neutral', 100) },
  wrapperBorder: false,
  wrapperBorderRadius: 0,
  borderRadius: 2,
  rowHoverColor: cssVar('primary', 50),
  selectedRowBackgroundColor: cssVar('primary', 100),
  columnBorder: false,
  headerColumnBorder: false,
  oddRowBackgroundColor: 'var(--c-surface)',
  browserColorScheme: 'light',
  iconSize: 14,
});
