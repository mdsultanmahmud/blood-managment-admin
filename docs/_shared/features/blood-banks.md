# Feature: blood banks page

| | |
| --- | --- |
| Status | Implemented |
| Code | `src/features/banks/BanksPage.tsx`, `BankForm.tsx` |
| Menu key | `blood_banks`, path `/blood-banks` |
| Backend | `GET/POST /blood-banks`, `PATCH /blood-banks/:id`, `DELETE /blood-banks/:id` |

- **List:** server-paged grid with search "Search by name or address", default sort by name. Columns, in order: Name, District, Phone, Status (a **Listed** or **Hidden** badge), and a row actions menu. Page text: "Blood banks and hospitals listed on the site."
- **Actions:** Edit; Delete with confirm "Delete <name>?": "It is removed from the site. This cannot be undone."
- **Form fields:** Name, District, Phone (optional, same mobile rule), Address, Notes, Listed switch (helper "Turn off to hide it from the site without deleting it.").
- **Empty state:** "No blood banks yet" / "Add the blood banks and hospitals you work with."
