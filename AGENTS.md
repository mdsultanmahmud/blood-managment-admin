# Agent notes: Blood Management admin panel

The Blood Management admin panel (React + Vite). The folder name `blood-managment-admin` has a typo; keep it. Platform overview and the other repositories: `AGENTS.md` in the `business-central-backend` repository.

- **Read first:** [docs/SUMMARY.md](docs/SUMMARY.md) (pages, endpoints, design, rules, gaps).
- **Run:** `npm install`, `npm run dev` (`http://roktolife.localhost:5600`, strict port; `/api` proxied to `VITE_DEV_BACKEND`). It needs the backend running and a company whose ADMIN origin equals that address. Copy `.env.example`; never commit `.env`.
- **Check before finishing:** `npm run typecheck`, `npm run lint`, `npm test`, `npm run format:check`.
- **Rules:** menu keys must match the backend exactly: `dashboard`, `blood_requests`, `blood_donors`, `blood_banks`, `blood_stock`, `role_management`, `staff_management`. Request status buttons mirror the backend transitions (PENDING to VERIFIED or REJECTED; VERIFIED to FULFILLED or REJECTED). Colors come from theme tokens only (theme `roktolife`).
- **Docs:** organised by theme (`docs/_shared/`, `docs/themes/<theme-key>/`). `docs/` is excluded from prettier. Update `docs/SUMMARY.md` and `docs/changelog.md` when behaviour changes. No secrets in docs.
