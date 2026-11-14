# 0001. Form inputs built in-house, no UI library

**Status:** Accepted (2026-11-14). Replaces the earlier use of MUI for form inputs.

Related docs: [SUMMARY](../../SUMMARY.md). The same decision was taken in all four frontends; the full write-up is ADR 0009 in repo `business-central-frontend`, `docs/decisions/0009-form-inputs-without-a-ui-library.md`.

## Context

blood-managment-admin used MUI (`@mui/material`, with `@emotion/react` and `@emotion/styled`) for form inputs only, and kept it in step with the Tailwind tokens through a theme bridge (`muiTheme.ts`). That meant two styling systems, a runtime CSS-in-JS dependency and an extra vendor chunk for a handful of widgets.

## Decision

Remove the three packages and build the inputs in `src/components/form/` with Tailwind and the existing theme tokens: `TextField` (input, textarea or native select, label above, helper and error text, adornments), `Checkbox` and `Switch` (native checkbox, `accent-color`, `indeterminate`), `Combobox` (single select with type-to-filter and keyboard navigation), `MultiCombobox` (chips, list stays open) and `MultiSelect` (checkbox list used by the grid multi-filter). The public API of the `Form*` wrappers is unchanged, so feature code did not change. The theme bridge and `MuiThemeProvider` were deleted.

## Consequences

- Positive: one styling system, no CSS-in-JS runtime, the inputs follow the theme tokens directly.
- Negative: we own the accessibility and keyboard behavior of the combobox widgets (covered by component tests).
- Look and behavior changes: labels sit above the field (no floating label); selects are the browser's native control; `Escape` in an open combobox closes the list without closing an enclosing dialog; native `<option>` elements have the ARIA role `option`, so tests should scope popup queries to the `listbox`.
- New translation keys: `common.select.clear`, `close`, `loading`, `open`, `remove` (`src/locales/en.json`).
