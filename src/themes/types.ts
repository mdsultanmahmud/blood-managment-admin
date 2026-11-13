/** Everything a theme decides. Components never use raw colors; they use the derived tokens. */
export interface ThemeConfig {
  /** Brand / primary color. Becomes shade 600 exactly; the rest is derived. */
  brand: string;
  semantic: { success: string; warning: string; danger: string; info: string };
  /** Hue and chroma of the neutral scale. */
  neutral: string;
  /** `canvas` is the app background, `surface` holds content. */
  surfaces: { canvas: string; surface: string };
  /** `control`: buttons, inputs, chips. `layer`: dialogs, menus, toasts. In px. */
  radius: { control: number; layer: number };
  font: { sans: string; mono: string; baseSize: number };
}

/** A registered theme. `key` equals a theme key of this app in the App hub. */
export interface ThemeDefinition extends ThemeConfig {
  key: string;
}
