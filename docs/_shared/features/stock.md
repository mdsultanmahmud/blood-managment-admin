# Feature: blood stock page

| | |
| --- | --- |
| Status | Implemented |
| Code | `src/features/stock/StockPage.tsx`, `StockForm.tsx` |
| Menu key | `blood_stock`, path `/stock` |
| Backend | `GET /stock`, `PUT /stock/:bloodGroup` |

- **Page:** a card for each of the 8 blood groups showing "Bags in stock", the target, a progress bar and "Updated <when>" (or "Not set yet"). Description: "Bags in stock for each blood group, against the target to keep." A bar **under 30%** uses the danger color.
- **Edit:** the **Set** button (only with `blood_stock:update`) opens "Stock of <group>" with two integer fields: Bags in stock and Target (helper "The number of bags you want to keep. Levels below 30% are shown in red."), each 0 to 100000. Save shows "Stock of <group> saved".
- **Rules:** stock is entered by hand; fulfilling a request does not change it.
