# AS6 EPIC019 CRM Kanban UI Wiring Governance

GOVERNANCE=AS6_EPIC019_CRM_KANBAN_UI_WIRING
STATUS=ACTIVE

Rules:
- CRM Kanban panel must use the reusable Workspace UI surface.
- Existing legacy content must be preserved until full visual migration is complete.
- No separate Kanban shell, router or store may be created.
- Workspace UI wiring must consume the already-created Kanban Workspace runtime.
- JSX validation must be performed through frontend build, not direct node --check.
