# Flow: verifying a donor

1. A visitor registers on the public site; the donor arrives as **PENDING** and is not shown publicly. The dashboard shows "N waiting for review".
2. Staff open **Donors**, filter status to PENDING and review the details.
3. **Verify** sets the status to VERIFIED (toast "<name> verified"). The donor appears on the public site only if the **Available** switch is on.
4. To remove a donor, **Delete** (confirm dialog); the phone number becomes free to register again.

Staff-added donors start VERIFIED. If the phone is already registered, the form shows an error on the Phone field.
