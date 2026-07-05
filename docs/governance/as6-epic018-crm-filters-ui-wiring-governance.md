# AS6 EPIC018 CRM Filters UI Wiring Governance

GOVERNANCE=AS6_EPIC018_CRM_FILTERS_UI_WIRING
STATUS=ACTIVE

Rules:
- CRM Filters panel must use the reusable Workspace UI surface.
- Existing legacy content must be preserved until full visual migration is complete.
- No separate Filters shell, router or store may be created.
- Workspace UI wiring must consume the already-created Filters Workspace runtime.
- JSX validation must be performed through frontend build, not direct node --check.
