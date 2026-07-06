# AS6 EPIC023 Architecture Reset Implementation AEC

Stage: AS6_EPIC023_ARCHITECTURE_RESET_IMPLEMENTATION

Decision:

- Accept AS6 route ownership reset implementation.

Accepted architecture:

- `/` is AS6 ONE primary shell.
- `/as6-crm` is the single public CRM entrypoint.
- `/crm` redirects to `/as6-crm`.
- `/as6-one` redirects to `/`.
- `/as6-sales` remains legacy rollback.

Constraints:

- No new shell.
- No new workspace.
- No new CRM module.
- No CRM business logic changes.
- No rollback removal in this stage.

Mandatory next control:

- AS6_EPIC023_PRODUCTION_VISUAL_VALIDATION must verify production DOM and visible state for `/`, `/as6-crm`, `/crm`, `/as6-sales`, and `/as6-one`.

AEC_RESULT=ACCEPTED
