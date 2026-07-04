# AS6 EPIC017 CRM Analytics UI Wiring Governance

GOVERNANCE=AS6_EPIC017_CRM_ANALYTICS_UI_WIRING
STATUS=ACTIVE

Rules:
- CRM Analytics panel must use the reusable Workspace UI surface.
- Existing legacy content must be preserved until full visual migration is complete.
- No separate Analytics shell, router or store may be created.
- Workspace UI wiring must consume the already-created Analytics Workspace runtime.
- JSX validation must be performed through frontend build, not direct node --check.
