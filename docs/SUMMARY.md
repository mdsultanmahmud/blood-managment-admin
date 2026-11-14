# Blood Management admin summary

> The Blood Management admin panel (React + Vite SPA). Company staff sign in at their company's admin address and manage blood requests, donors, blood banks, stock, roles and staff. Status: **Implemented**. This file is the first documentation of the app.

Verified against code on 2026-11-13 (folder: this repository, `blood-managment-admin`; the folder name has a typo, keep it). Detailed docs: none yet. Docs are organised by theme: `_shared/` is theme-independent, `themes/base-theme/` is the reference theme (code key `roktolife`). A new theme documents only its differences.

## Stack and code map

React 19, Vite, TypeScript, react-router 8, TanStack Query, Tailwind 4 (in-house form inputs, no UI library), AG Grid, react-hook-form + zod, i18next, framer-motion. Dev: port 5600 (strict), `http://roktolife.localhost:5600`. Vite proxies `/api` to `VITE_DEV_BACKEND` (default `http://localhost:4000`), so the page and API share an origin and the `co_rt` cookie stays first-party. `VITE_API_URL` is empty by default.

| Path (under `src/`) | Purpose |
| --- | --- |
| `App.tsx` | Providers: ErrorBoundary > QueryClient > SiteProvider > SiteTheme > SiteGate > AuthProvider > ModalProvider > RouterProvider, plus the toaster |
| `routes/{router.tsx,pages.ts,MenuRoute.tsx,ProtectedLayout.tsx,StatusPages.tsx}` | Routing; `pages.ts` is the registry by menu key and holds `MENU_OPERATIONS` |
| `api/{client,request,interceptors,refreshCoordinator,tokenStore,schemas}.ts` | HTTP layer (token in memory only) |
| `api/modules/{auth,me,site,blood,roles,staff}.ts` | Typed clients |
| `context/{Auth,Site,Modal,Sidebar}Context.tsx` | State |
| `features/{auth,dashboard,requests,donors,banks,stock,roles,staff,status}`, `features/blood/labels.ts` | Pages |
| `components/{ui,form,grid,layout,modal}` | UI kit |
| `themes/{registry,ThemeProvider,SiteTheme}`, `themes/roktolife/theme.ts`, `themes/engine/*` | Theme engine and the `roktolife` theme |
| `i18n/{index,language,loaders}.ts`, `locales/en.json` | i18next; English only |
| `index.css`, `lib/{menus,permissions,env,storage,queryClient}.ts` | Styles and helpers |

## Implemented features

| Feature | Status | Where in code | Notes |
| --- | --- | --- | --- |
| Site gate and theme by origin | Implemented | `features/status/SiteGate`, `themes/SiteTheme` | `GET /api/v1/company/site?origin=<own origin>`; unknown site shows SiteNotFoundPage; the tab title is "<company title> · <app name>" and the favicon is the company logo |
| Login and session | Implemented | `features/auth` | Sends `window.location.origin` at login; silent refresh by cookie on load |
| Dashboard | Implemented | `features/dashboard` | Stats, latest requests, stock bars, recent donors |
| Blood requests | Implemented | `features/requests` | Grid, create, edit, verify, fulfil, reject, delete |
| Donors | Implemented | `features/donors` | Grid, create, edit, verify, delete |
| Blood banks | Implemented | `features/banks` | Grid, create, edit, delete |
| Blood stock | Implemented | `features/stock` | Card grid of 8 groups; set units and target |
| Roles | Implemented | `features/roles` | Role matrix per menu with read, create, update, delete |
| Staff | Implemented | `features/staff` | Grid, add, edit, set password |
| Under Construction page | Implemented | `features/status` | For a menu with no registered page; today every seeded menu has one |

## Pages / routes

The router has only 2 entries: `/login` (lazy `LoginPage`; reads `?next=`) and `*` under `ProtectedLayout`, rendered by `MenuRoute`. Signed-out visitors go to `/login?next=...`. `MenuRoute` takes the longest-prefix match of the path against `routes` from `GET /me/navigation` (paths come from the App hub) and picks the page by menu key. Unknown paths show 404; `/` redirects to the first navigation leaf. Backend base for app calls: `/api/v1/apps/blood-management/admin`; platform base: `/api/v1/company`.

| Menu key, seeded path | Permission | What it does and backend calls |
| --- | --- | --- |
| `dashboard`, `/` | `dashboard:read` | `GET /dashboard`; latest 5 requests (`GET /requests?pageSize=5&sort=-createdAt`) if `blood_requests:read`; inline Verify and Fulfil (`PATCH /requests/:id/status`) if `blood_requests:update`; 8 stock bars (under 30% shows the primary colour); 4 recent donors |
| `blood_requests`, `/requests` | `blood_requests:*` | AG Grid with server paging, search `q`, status multi-filter, default sort `-createdAt`. Row menu: Verify (PENDING), Fulfil (VERIFIED), Reject (PENDING or VERIFIED, confirm), Edit, Delete (confirm). Add and Edit in a modal form. `GET/POST /requests`, `PATCH /requests/:id`, `PATCH /requests/:id/status`, `DELETE /requests/:id` |
| `blood_donors`, `/donors` | `blood_donors:*` | Grid with name search, status filter, default sort `-createdAt`. Row menu: Verify (PENDING), Edit, Delete (confirm). `/donors` endpoints |
| `blood_banks`, `/blood-banks` | `blood_banks:*` | Grid with search, default sort name. Edit, Delete (confirm). `/blood-banks` endpoints |
| `blood_stock`, `/stock` | `blood_stock:read`, `:update` | Card grid of 8 groups with progress bar and a Set button (only with update permission); under 30% shows the danger colour. `GET /stock`, `PUT /stock/:group`; the form validates 0 to 100000 |
| `role_management`, `/admin/roles` | `role_management:*` | `RolesPage` handles `<base>`, `<base>/new`, `<base>/<uuid>`; role matrix per menu. Platform `roles` and `access/menus` endpoints |
| `staff_management`, `/admin/staff` | `staff_management:*` | Staff grid with status and role filters; add, edit, set password. Platform `staff` endpoints |

`MENU_OPERATIONS`: dashboard offers only read; staff_management offers read, create, update.

## Design and UX

- **Shell:** collapsible sidebar (256 px expanded, 72 px collapsed; state in localStorage). Below 1024 px it becomes a slide-over drawer. Sticky 56 px topbar with page title, language switcher (hidden if the site offers fewer than 2 languages) and user menu (sign out). Footer. Skip-to-content link.
- **Tokens** are not in CSS. `themes/registry.ts` holds the themes; `ThemeProvider` writes `--c-*` CSS variables and `data-theme`; `index.css` maps them into Tailwind via `@theme inline` and removes Tailwind's default palette. A scale of 11 shades (50 to 950) per colour is derived by `themes/engine/palette.ts`.
- **Theme `roktolife` (base-theme, `themes/roktolife/theme.ts`):** brand `#E11D48` (shade 600), success `#059669`, warning `#D97706`, danger `#DC2626`, info `#2563EB`; neutral `#64748B`, canvas `#F8FAFC`, surface `#FFFFFF`; radius control 12 px, layer 20 px; font Inter for everything (Google Fonts; `font.sans` and `font.mono` are both Inter), base 14 px.
- **Theme selection:** by the App hub theme key from the site call; an unknown key falls back to `roktolife`; the last key is cached in localStorage `bm.themeKey`.
- **Color modes:** none. No dark mode; `<meta color-scheme=light>`.
- **Language:** only English (`locales/en.json`, flat dotted keys). The choice is stored in `bm.language`. A remote loader hook exists but is not wired (ADR 0022 in the backend repo).
- **UI kit:** Button, Badge (tones neutral, primary, success, warning, danger, info; `dot` variant), Menu, Tabs, Tooltip, Avatar, Spinner, States (Empty, Error, Loading), PageLayout, Can, ToastCard, AppErrorBoundary, MenuIcon. Form: in-house `TextField` (label above, native select), `Checkbox`, `Switch`, `Combobox`, `MultiCombobox` (chips), `MultiSelect` (grid multi-filter), wrapped by FormTextField, FormAutocomplete, FormMultiAutocomplete, FormCheckbox, FormPasswordField (no UI library; see `_shared/decisions/0001-form-inputs-without-a-ui-library.md`). Grid: DataGrid (column widths and visibility persisted per grid id), search, filters, ColumnsMenu, cells. ModalHost and ConfirmDialog (danger tone).
- **UX rules:** modal forms have a dirty guard; destructive actions use a confirm dialog; every page has loading, error (with Retry) and empty or empty-filtered states; success and error toasts; framer-motion fades respect reduced motion; stale chunks after a deploy trigger one reload.
- **Badge tones:** urgency CRITICAL danger, URGENT warning, MODERATE neutral. Request status PENDING warning, VERIFIED info, FULFILLED success, REJECTED neutral. Donor status PENDING warning, VERIFIED success.

## Auth and permissions

- On load a silent refresh runs through the httpOnly `co_rt` cookie. The access token lives in memory only (`tokenStore`). `GET /me` and `GET /me/navigation` drive permissions, the sidebar and the routes.
- Login: `POST /api/v1/company/auth/login` with `{origin: window.location.origin, email, password}`.
- Permissions are `<menuKey>:<action>`; `lib/permissions.ts` gates buttons and sub-routes; the server re-checks every call.
- Site gate: an unknown site shows SiteNotFoundPage; other errors show a retry state. The site supplies company title and logo, `themeKey`, languages and `defaultLanguage`.

## Business rules worth knowing

- Menu keys must match the backend exactly: `dashboard`, `blood_requests`, `blood_donors`, `blood_banks`, `blood_stock`, `role_management`, `staff_management`.
- Request status buttons mirror the backend transitions: PENDING to VERIFIED or REJECTED, VERIFIED to FULFILLED or REJECTED; FULFILLED and REJECTED are terminal.
- Donors registered on the public site are PENDING until staff use Verify.
- Stock is limited to integers 0 to 100000; the dashboard stock bars show the primary colour under 30%.
- A menu with no entry in the page registry is Under Construction even if granted.

## Not built / known gaps

- Only English; no dark mode.
- No request detail page and no audit-log viewer.
- The dashboard admin-actions column is hidden for users without update permission.
- UNVERIFIED: the exact donor and bank form fields (not read in full).
- Planned redesign (donations, request-donor responses, per-bank inventory): see repo `business-central-backend`, `docs/platform/erd/`. Not built.

## Related docs

- Decision: [0001 form inputs without a UI library](_shared/decisions/0001-form-inputs-without-a-ui-library.md)
- In this repository: features [login and session](_shared/features/login-and-session.md), [dashboard](_shared/features/dashboard.md), [requests](_shared/features/requests.md), [donors](_shared/features/donors.md), [blood banks](_shared/features/blood-banks.md), [stock](_shared/features/stock.md), [roles and staff](_shared/features/roles-and-staff.md); flows [request handling](_shared/flows/request-handling.md), [donor verification](_shared/flows/donor-verification.md); guide [adding a page](_shared/guides/adding-a-page.md); designs [tokens](themes/base-theme/designs/design-tokens.md), [shell and components](themes/base-theme/designs/shell-and-components.md), [screens](themes/base-theme/designs/screens.md)
- Backend: repo `business-central-backend`, `src/apps/blood-management/docs/SUMMARY.md`. Public site: repo `blood-management-frontend`, `docs/SUMMARY.md`.
- Platform rules (theming, i18n, roles): repo `business-central-backend`, `docs/platform/`. ADRs 0016, 0020, 0021, 0022, 0023: repo `business-central-backend`, `docs/decisions/`.
