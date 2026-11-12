import { deriveScale, SHADES, type Scale } from './palette';
import type { ThemeConfig } from '../types';

export type ScaleName = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export interface ThemeTokens {
  scales: Record<ScaleName, Scale>;
  canvas: string;
  surface: string;
}

export function buildTokens(config: ThemeConfig): ThemeTokens {
  return {
    scales: {
      primary: deriveScale(config.brand),
      neutral: deriveScale(config.neutral),
      success: deriveScale(config.semantic.success),
      warning: deriveScale(config.semantic.warning),
      danger: deriveScale(config.semantic.danger),
      info: deriveScale(config.semantic.info),
    },
    canvas: config.surfaces.canvas,
    surface: config.surfaces.surface,
  };
}

/** CSS custom properties written on :root; src/index.css maps Tailwind tokens onto these. */
export function buildCssVariables(config: ThemeConfig, tokens = buildTokens(config)) {
  const vars: Record<string, string> = {};
  for (const [name, scale] of Object.entries(tokens.scales)) {
    for (const shade of SHADES) vars[`--c-${name}-${shade}`] = scale[shade];
  }
  vars['--c-canvas'] = tokens.canvas;
  vars['--c-surface'] = tokens.surface;
  vars['--font-ui'] = config.font.sans;
  vars['--font-code'] = config.font.mono;
  vars['--radius-control'] = `${config.radius.control}px`;
  vars['--radius-layer'] = `${config.radius.layer}px`;
  vars['--text-base-size'] = `${config.font.baseSize}px`;
  return vars;
}

/** Shorthand for referencing a theme variable from JS-built styles (AG Grid params, toasts). */
export const cssVar = (name: ScaleName, shade: (typeof SHADES)[number]) =>
  `var(--c-${name}-${shade})`;

/** Writes derived CSS variables to :root before paint, so there is no flash of unthemed UI. */
export function applyCssVariables(vars: Record<string, string>, root = document.documentElement) {
  for (const [key, value] of Object.entries(vars)) root.style.setProperty(key, value);
}
