# base-theme design tokens (`roktolife`)

The only theme today. Defined in `src/themes/roktolife/theme.ts`; the engine in `src/themes/engine/` turns it into CSS variables, a MUI theme and an AG Grid theme. Components use tokens only, never raw colors.

| Token | Value |
| --- | --- |
| Brand (shade 600) | `#E11D48` |
| Success | `#059669` |
| Warning | `#D97706` |
| Danger | `#DC2626` |
| Info | `#2563EB` |
| Neutral | `#64748B` |
| Canvas (page background) | `#F8FAFC` |
| Surface (cards, panels) | `#FFFFFF` |
| Radius, controls | 12 px |
| Radius, layers (dialogs, cards) | 20 px |
| Font, UI | Hanken Grotesk |
| Font, code | JetBrains Mono |
| Base text size | 14 px |

## How tokens reach the UI

1. `palette.ts` derives a scale of 11 shades (50 to 950) for each color from the base values.
2. `ThemeProvider` writes `--c-*` colors, `--font-*`, `--radius-*` on `:root` and sets `data-theme`.
3. `index.css` maps them to Tailwind with `@theme inline` and removes Tailwind's default palette, so `bg-blue-500` style classes do not exist.

## Semantic use

- **Brand (rose)** for primary buttons, focus, the active sidebar item and "needs attention" stock bars under 30%.
- **Badge tones:** urgency CRITICAL danger, URGENT warning, MODERATE neutral. Request status PENDING warning, VERIFIED info, FULFILLED success, REJECTED neutral. Donor status PENDING warning, VERIFIED success. Bank state Listed success, Hidden neutral.

## Adding another theme

Create `src/themes/<key>/theme.ts`, add one line to `src/themes/registry.ts`, and use that key as the theme key of the Blood app in Business Central (App hub > Apps). Document the new theme in `docs/themes/<key>/` with **only the differences** from this theme. An unknown key falls back to `roktolife`.

No dark mode exists; the page declares `color-scheme: light`.
