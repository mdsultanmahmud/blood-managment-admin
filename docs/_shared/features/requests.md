# Feature: blood requests page

| | |
| --- | --- |
| Status | Implemented |
| Code | `src/features/requests/RequestsPage.tsx`, `RequestForm.tsx` |
| Menu key | `blood_requests`, path `/requests` |
| Backend | `GET/POST /requests`, `PATCH /requests/:id`, `PATCH /requests/:id/status`, `DELETE /requests/:id` (contract: repo `business-central-backend`, `src/apps/blood-management/docs/api/admin-api.md`) |

## List

AG Grid with server-side paging, sorting and URL state. Search box "Search patient or hospital" (`q`), a multi-select status filter, default sort newest first. Columns, in order: Blood group, Patient, Bags, Urgency (badge), Needed by, Attendant (contact), Status (badge), and a row actions menu.

Row actions (menu "Actions for <name>"), shown only with the right permission:

| Action | When | Effect |
| --- | --- | --- |
| Verify | status PENDING | `PATCH status VERIFIED`, toast "Request updated" |
| Mark fulfilled | status VERIFIED | `PATCH status FULFILLED` |
| Reject | PENDING or VERIFIED | Confirm "Reject the request for <name>?": "It will not be shown on the site, and a rejected request cannot be reopened." |
| Edit | any | Opens the form in a dialog |
| Delete | any | Confirm "Delete the request for <name>?": "The request is removed for good. This cannot be undone." |

"Add request" opens the same form. Page text: "Requests from the site and from staff. Verify a request to show it to donors, then mark it fulfilled."

## Form fields

Patient name, Hospital, District, Blood group, Bags (helper "1 to 20 bags."), Urgency, Needed by (date and time), Attendant name, Attendant phone (Bangladeshi mobile), Reason (optional). The form warns before discarding unsaved changes. Server validation errors appear on the matching field.

## Rules

- Status buttons mirror the backend lifecycle ([flow](../flows/request-handling.md)); a 409 after a click usually means the list is stale.
- Empty states: "No blood requests yet" with "Requests from the site and staff appear here."; with filters, "No requests match these filters".
