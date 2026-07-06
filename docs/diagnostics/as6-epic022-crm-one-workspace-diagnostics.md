# AS6 EPIC022 CRM ONE Workspace Diagnostics

Diagnostics:

- HEAD captured before change.
- Worktree was clean before change.
- Current routes inspected in `frontend/src/App.jsx` and `frontend/src/as6/living-spaces/*`.
- AS6 ONE shell located at `frontend/src/as6/shell/AS6Shell.jsx`.
- Existing AS6 ONE adapter located at `frontend/src/as6-one/AS6OneShellAdapter.jsx`.
- Legacy CRM located at `frontend/src/pages/CRMPage.jsx`, `frontend/src/pages/CRMWorkspacePage.jsx`, and `/as6-sales`.
- CRM modules found under `frontend/src/crm`: contacts, companies, deals, activities, followups, analytics, filters, kanban.
- Sidebar/header/workspace primitives found under `frontend/src/components/as6-workspace`.

Result:

- `/as6-crm` created as a new AS6 ONE CRM Workspace route.
- New UI reuses CRM business API/runtime data without mounting legacy CRM UI as the primary interface.
- Rollback path remains `/as6-sales`.
