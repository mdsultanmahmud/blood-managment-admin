# base-theme: shell and components

## App shell

| Part | Behaviour |
| --- | --- |
| Skip link | First focusable element; jumps to `<main id="main">` |
| Sidebar | 256 px expanded, 72 px collapsed (icons). Below 1024 px it becomes a slide-over drawer. Collapsed state is remembered in `localStorage`. Items come from `GET /me/navigation`; only menus the user may see are shown |
| Topbar | 56 px, sticky. Page title, language switcher (hidden when the site offers fewer than 2 languages), user menu (sign out) |
| Content | Scrolls under the topbar; pages use `PageLayout` (title, description, actions) |
| Footer | Sticky 32 px bar: copyright with the year on the left, the developer credit (a link that opens LinkedIn in a new tab) on the right |

## Components

| Component | Notes |
| --- | --- |
| Button | primary, secondary, ghost, danger; loading state |
| Badge | tones neutral, primary, success, warning, danger, info; optional dot |
| DataGrid (AG Grid) | Server paging and sorting, URL-synced state, column widths and visibility remembered per grid, search box, multi-select filters, loading, error (retry), empty and empty-filtered states |
| Forms | In-house inputs (no UI library): `TextField` with the label above the field and a native select, `Checkbox`, `Switch`, `Combobox`, `MultiCombobox`, `MultiSelect`; wrapped by FormTextField, FormAutocomplete, FormMultiAutocomplete, FormCheckbox (checkbox with description), FormPasswordField; react-hook-form + zod; server errors land on the matching field |
| Modal host | Dialogs and drawers; dirty guard asks before discarding; `ConfirmDialog` with danger tone for destructive actions |
| Toasts | Success and error toasts at the top |
| States | Empty, Error (with Retry), Loading, FullPageSpinner |
| Menu, Tabs, Tooltip, Avatar | Row action menus ("Actions for <name>"), tabs, hints |
| Can | Shows children only when the user holds a permission |

## UX rules

- Every destructive action asks for confirmation with a specific title ("Delete <name>?") and consequence text.
- Buttons the user may not use are hidden, not disabled.
- Every list and page has loading, error and empty states; filtered empties say "No ... match these filters".
- Motion respects reduced-motion; a stale chunk after a deploy triggers one automatic reload.
