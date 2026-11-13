# Feature: site gate, login and session

| | |
| --- | --- |
| Status | Implemented |
| Code | `src/features/auth/`, `src/features/status/SiteGate.tsx`, `src/context/{Site,Auth}Context.tsx`, `src/api/{interceptors,refreshCoordinator,tokenStore}.ts` |
| Backend | `GET /api/v1/company/site`, `POST /auth/login`, `/auth/refresh`, `/auth/logout`, `GET /me`, `GET /me/navigation` |

## Behaviour

1. **Site gate.** On load the app calls `GET /api/v1/company/site?origin=<window.location.origin>`. The answer gives the company title and logo, the theme key, the languages and the default language. An unknown address shows a "site not found" page; other errors show a retry state. The browser tab title becomes "<company title> · <app name>" and the favicon becomes the company logo.
2. **Theme.** The theme key picks the look; an unknown key falls back to `roktolife`. The last key is cached in `localStorage` (`bm.themeKey`) so the first paint is already themed.
3. **Session restore.** A silent `POST /auth/refresh` (httpOnly cookie `co_rt`) runs on load. If it succeeds, `GET /me` and `GET /me/navigation` fill permissions and the sidebar; if not, the visitor goes to `/login?next=<path>`.
4. **Login.** Email and password, plus `origin: window.location.origin`, go to `POST /auth/login`. Every failure shows the same generic message. After success the user lands on `next` (sanitised so it cannot leave the site) or the first menu entry.
5. **Tokens.** The access token lives in memory only. A 401 triggers **one shared refresh** and a single retry; concurrent requests wait for the same refresh. If the refresh fails the session ends with a toast and a redirect to login.
6. **Sign out** calls `POST /auth/logout` and clears local state even if the call fails.

## Rules

- The company is the one whose ADMIN origin equals the page address: running the panel on a different host or port than the one registered in Business Central gives "site not found".
- Permissions and the menu always come from the server; nothing is read from the token.
- Lockout and rate limits are enforced by the backend (see repo `business-central-backend`, `docs/SUMMARY.md`).
