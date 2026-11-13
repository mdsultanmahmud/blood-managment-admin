# Blood Management: admin panel

The admin panel for blood requests, donors, blood banks, stock, roles and staff (React + Vite).

| | |
| --- | --- |
| Code | this repository (`blood-managment-admin`) |
| Backend | `business-central-backend`, module `src/apps/blood-management` (see its `docs/`) |
| Start here | [SUMMARY.md](SUMMARY.md) |

## Layout

- `SUMMARY.md`: start here. What is built, routes, design, rules, gaps. One page.
- `_shared/`: documentation that is the same in every theme: `features/`, `flows/`, `decisions/`, `guides/`, `designs/` (design specs and mockups).
- `themes/<theme-key>/`: documentation of one theme: `designs/`, `features/`, `flows/`, `guides/`. `base-theme` is the complete reference theme. Any other theme documents **only its differences**; a missing file means "same as base-theme". Folder names equal the theme key in Business Central (`bc_themes.key`).
- `changelog.md`: what changed and when.
