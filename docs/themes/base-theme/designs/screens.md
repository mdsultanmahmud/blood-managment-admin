# base-theme: screens

Text descriptions of each screen (no image mockups exist yet; add screenshots next to this file when available). Behaviour of each screen is in `docs/_shared/features/`.

| Screen | Layout |
| --- | --- |
| Login | Centered column (max 400 px) on the canvas: company logo (30 px), company title and app name, then the sign-in form with email, password and a Sign in button |
| Site not found | Full-page message when the page address is not a registered ADMIN address |
| Dashboard | Four stat cards (2 per row on small screens, 4 in a row on wide screens). Below, a three-column area on wide screens: the "Live emergency requests" feed (with a "View all" link) takes two columns; the right column stacks a **dark** "Availability by group" panel (8 bars, red under 30%) and a "New donors" panel. Panels you cannot see are left out |
| Blood requests | Page header (title, description, **Add request**); toolbar with search and status filter; grid with a row actions menu |
| Donors | Page header with **Add donor**; search by name, status filter; grid |
| Blood banks | Page header with **Add blood bank**; search; grid with Listed or Hidden badges |
| Blood stock | Page header; a responsive grid of 8 cards (1 column on phones, 2 on small, 4 on wide screens), each with the group, bags in stock, target, progress bar, last update and a **Set** button |
| Roles | List of roles; editor page with the role name and the permission matrix (rows: menus, columns: Visible, Read, Create, Update, Delete) |
| Staff | Grid with status and role filters; add and edit in a dialog; set password dialog |
| Under Construction | Centered notice for a menu that has no page registered |
| 404 / 403 | Centered notice inside the shell |

Dialogs (forms, confirmations) are centered; wide forms are single-column with paired short fields (for example bags and urgency) side by side on desktop.
