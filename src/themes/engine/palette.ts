/**
 * Derives a 50 to 950 shade scale from one hex, in OKLCH so lightness steps look even across
 * hues. The input color is kept exactly as shade 600; other shades share its hue and get a
 * lightness target plus a chroma taper toward the extremes, clamped into the sRGB gamut.
 */
export const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type Shade = (typeof SHADES)[number];
export type Scale = Record<Shade, string>;

/** Target OKLCH lightness per shade (600 is replaced by the input color). */
const LIGHTNESS: Record<Shade, number> = {
  50: 0.975,
  100: 0.945,
  200: 0.89,
  300: 0.81,
  400: 0.71,
  500: 0.6,
  600: 0.5,
  700: 0.43,
  800: 0.36,
  900: 0.29,
  950: 0.22,
};

/** Fraction of the input chroma kept per shade (pale and very dark shades get less). */
const CHROMA: Record<Shade, number> = {
  50: 0.12,
  100: 0.22,
  200: 0.4,
  300: 0.6,
  400: 0.8,
  500: 0.95,
  600: 1,
  700: 0.95,
  800: 0.85,
  900: 0.7,
  950: 0.55,
};

interface Oklch {
  l: number;
  c: number;
  h: number;
}

export function parseHex(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(hex.trim());
  if (!m?.[1]) throw new Error(`Invalid hex color: ${hex}`);
  const full = m[1].length === 3 ? m[1].replace(/./g, '$&$&') : m[1];
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255) as [number, number, number];
}

export function toHex([r, g, b]: [number, number, number]): string {
  const ch = (v: number) =>
    Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${ch(r)}${ch(g)}${ch(b)}`.toUpperCase();
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function hexToOklch(hex: string): Oklch {
  const [r, g, b] = parseHex(hex).map(toLinear) as [number, number, number];
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { l: L, c: Math.hypot(A, B), h: Math.atan2(B, A) };
}

function oklchToRgb({ l: L, c, h }: Oklch): [number, number, number] {
  const A = c * Math.cos(h);
  const B = c * Math.sin(h);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

const inGamut = (rgb: number[]) => rgb.every((v) => v >= -0.0005 && v <= 1.0005);

/** Reduces chroma until the color fits sRGB (keeps lightness and hue). */
function clampToGamut(color: Oklch): string {
  let lo = 0;
  let hi = color.c;
  if (inGamut(oklchToRgb(color))) return toHex(oklchToRgb(color));
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklchToRgb({ ...color, c: mid }))) lo = mid;
    else hi = mid;
  }
  return toHex(oklchToRgb({ ...color, c: lo }));
}

const L_MAX = LIGHTNESS[50];
const L_MIN = LIGHTNESS[950];
const L_ANCHOR = LIGHTNESS[600];

/**
 * Lightness targets are re-anchored on the input color's own lightness, so shades stay
 * monotonic for light inputs (amber, yellow) and dark ones (navy) alike.
 */
function targetLightness(shade: Shade, inputL: number): number {
  const anchor = inputL;
  // Very dark or very light inputs stretch the far end so shades never cross the anchor.
  const lo = Math.min(L_MIN, anchor * 0.6);
  const hi = Math.max(L_MAX, anchor + (1 - anchor) * 0.6);
  const t = LIGHTNESS[shade];
  if (t >= L_ANCHOR) return anchor + ((t - L_ANCHOR) / (L_MAX - L_ANCHOR)) * (hi - anchor);
  return lo + ((t - L_MIN) / (L_ANCHOR - L_MIN)) * (anchor - lo);
}

export function deriveScale(hex: string): Scale {
  const base = hexToOklch(hex);
  const scale = {} as Scale;
  for (const shade of SHADES) {
    scale[shade] =
      shade === 600
        ? toHex(parseHex(hex))
        : clampToGamut({
            l: targetLightness(shade, base.l),
            c: base.c * CHROMA[shade],
            h: base.h,
          });
  }
  return scale;
}

/** WCAG relative luminance, used to pick readable text on a color. */
export function luminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map(toLinear) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}
