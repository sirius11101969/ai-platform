# AS6 Governance — EPIC013 CRM Companies CRM Layout Bridge

Stage: AS6_EPIC013_SLICE05_CRM_COMPANIES_CRM_LAYOUT_BRIDGE

- Companies must bridge into the unified CRM Layout.
- Companies must reuse existing CRM Workspace, Header and Sidebar.
- Companies must not create a parallel layout, shell, router or store.
- Breadcrumbs and active section must be synchronized.
- Layout states are limited to loading, empty, ready and error.
- Storage, API calls, backend coupling and business workflows remain forbidden.
- Diagnostics must use safe grep helper to avoid runtime/dist/node_modules false positives.
