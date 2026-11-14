# Feature: donors page

| | |
| --- | --- |
| Status | Implemented |
| Code | `src/features/donors/DonorsPage.tsx`, `DonorForm.tsx` |
| Menu key | `blood_donors`, path `/donors` |
| Backend | `GET/POST /donors`, `PATCH /donors/:id`, `DELETE /donors/:id` |

## List

Server-paged grid; search "Search donors by name"; status filter; default sort newest first. Columns, in order: Blood group, Full name, Phone, Last donated on ("Never" when empty), Available ("Available" or "Unavailable"), Status, and a row actions menu. Page text: "Registered donors. Donors who sign up on the site start pending until you verify them."

| Action | When | Effect |
| --- | --- | --- |
| Verify | status PENDING | `PATCH status VERIFIED`, toast "<name> verified" |
| Edit | any | Dialog with the form |
| Delete | any | Confirm "Delete <name>?": "Their details are removed for good. This cannot be undone." |

## Form fields

Full name, Phone (Bangladeshi mobile, unique), Blood group, District, Last donated on (helper "Leave empty if the donor has never donated."), Status (helper "Only verified donors are shown on the site."), Available switch (helper "Turn off while the donor is travelling, unwell or asked not to be called."), Notes.

## Rules

- A phone that is already registered shows an error on the Phone field (409 `DONOR_PHONE_TAKEN`).
- Only VERIFIED and available donors appear on the public site.
- Empty state: "No donors yet" / "Registered donors appear here with their blood group."
