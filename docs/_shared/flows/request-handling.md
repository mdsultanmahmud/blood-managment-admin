# Flow: handling a blood request in the admin panel

1. A visitor submits a request on the public site; it arrives as **PENDING**. The dashboard shows "N waiting for review" and the request appears in the Blood requests grid.
2. Staff open **Blood requests**, optionally filter status to PENDING, and check the patient, hospital, need time and attendant phone (calling the attendant is a manual step).
3. **Verify** (PENDING to VERIFIED): the request is published on the public site. Or **Reject** (confirm dialog): it is never shown and cannot be reopened.
4. When the need is met, staff choose **Mark fulfilled** (VERIFIED to FULFILLED). The request leaves the public list and counts as a life saved.
5. A VERIFIED request that is no longer needed can be **Rejected**.

Allowed moves: PENDING to VERIFIED or REJECTED; VERIFIED to FULFILLED or REJECTED. FULFILLED and REJECTED are final. Backend flow: repo `business-central-backend`, `src/apps/blood-management/docs/flows/request-lifecycle.md`.

Staff can also enter a request themselves with **Add request**; it starts VERIFIED and is published at once.
