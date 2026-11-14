# Feature: roles and staff

| | |
| --- | --- |
| Status | Implemented |
| Code | `src/features/roles/`, `src/features/staff/` |
| Menu keys | `role_management` (`/admin/roles`), `staff_management` (`/admin/staff`) |
| Backend | Platform company-plane endpoints: `GET /access/menus`, `GET|POST /roles`, `GET|PUT|DELETE /roles/:id`, `GET|POST /staff`, `GET /staff/roles`, `PATCH /staff/:id`, `PUT /staff/:id/password` |

## Roles

- Role list, create, edit and delete. `RolesPage` handles `<base>`, `<base>/new` and `<base>/<uuid>`.
- **Role matrix:** one row per usable menu, columns Visible, Read, Create, Update, Delete. Ticking any write flag ticks Read; unticking Read clears the rest. `MENU_OPERATIONS` narrows the columns (dashboard: read only; staff management: read, create, update).
- The locked **Admin** role grants every usable menu and cannot be edited by non-admins; a role cannot be deleted while someone holds it. A non-admin editor can only hand out permissions they hold.

## Staff

- Grid with status and role filters; add staff with name, email, password (12 to 128 characters) and roles; edit name, email, roles and status; set a new password.
- You cannot disable yourself or reset your own password from the grid. The last Admin cannot be removed.

Rules for both come from the backend (`LAST_ADMIN`, `ROLE_IN_USE`, `ROLE_LOCKED`, `PERMISSION_ESCALATION`); the UI shows the server message.
