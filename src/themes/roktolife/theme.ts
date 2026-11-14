import type { ThemeDefinition } from '../types';

/** RoktoLife: the rose and slate look of the public blood-management website. */
export const roktolife: ThemeDefinition = {
  key: 'roktolife',
  brand: '#E11D48',
  semantic: { success: '#059669', warning: '#D97706', danger: '#DC2626', info: '#2563EB' },
  neutral: '#64748B',
  surfaces: { canvas: '#F8FAFC', surface: '#FFFFFF' },
  radius: { control: 12, layer: 20 },
  font: {
    sans: "'Inter', ui-sans-serif, system-ui, sans-serif",
    mono: "'Inter', ui-sans-serif, system-ui, sans-serif",
    baseSize: 14,
  },
};
