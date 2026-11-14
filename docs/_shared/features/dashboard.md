# Feature: dashboard

| | |
| --- | --- |
| Status | Implemented |
| Code | `src/features/dashboard/DashboardPage.tsx` |
| Menu key | `dashboard` (read only) |
| Backend | `GET /dashboard`; `GET /requests?pageSize=5&sort=-createdAt`; `PATCH /requests/:id/status` |

## Sections

| Section | Content | Needs |
| --- | --- | --- |
| Stat cards | Registered donors, Lives saved, Districts covered, Active requests; two cards add "N waiting for review" when there are pending items | `dashboard:read` |
| Live emergency requests | The 5 newest requests (urgency, group, bags, place and status; exact fields per row not itemised here) | `blood_requests:read` |
| Inline actions | Verify (PENDING) and Mark fulfilled (VERIFIED) on each row | `blood_requests:update` |
| Availability by group | 8 bars of stock against target; **under 30% is shown in red**, with the note "Groups below 30% are shown in red and need new donors." | `dashboard:read` |
| New donors | The 4 newest donors with group and district | `dashboard:read` |

## Rules

- Parts the user is not permitted to see are hidden, not disabled. The page works with only `dashboard:read`.
- "Lives saved" is the count of FULFILLED requests; "Active requests" counts VERIFIED requests.
- Empty states: "No requests yet." and "No donors yet."
