# Guide: adding a page to the Blood admin panel

Pages are chosen by **menu key**, not by router path. The App hub in Business Central owns the menu tree; this app owns the page for each key.

1. In the backend repo, declare the menu key in `src/apps/blood-management/catalog.ts` and seed the menu (`src/seed/apps.ts`); in Business Central switch it on for the company. Never rename an existing key.
2. Create `src/features/<name>/<Name>Page.tsx` (use `PageLayout`, `DataGrid`, the form kit).
3. Register the page in `src/routes/pages.ts` under the same menu key. `MenuRoute` finds it by the longest path prefix from `GET /me/navigation`.
4. Gate actions with `<Can>` or `can('<menuKey>:<action>')`; the server enforces anyway.
5. If the menu offers fewer than four operations, add it to `MENU_OPERATIONS` so the role matrix only shows the real ones.
6. Add UI strings to `src/locales/en.json` (flat dotted keys).
7. Check: `npm run typecheck`, `npm run lint`, `npm test`. Update `docs/SUMMARY.md` and `docs/changelog.md`.

A menu with no registered page shows the Under Construction page, even if the user is granted it.
