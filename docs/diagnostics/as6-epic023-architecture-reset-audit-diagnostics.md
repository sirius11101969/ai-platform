# AS6 EPIC023 Architecture Reset Audit Diagnostics

Stage: AS6_EPIC023_ARCHITECTURE_RESET_AUDIT

Timestamp: 2026-07-06T11:42:29Z

Git diagnostics:

- `git rev-parse HEAD`: 937ab4c82a27dc10fa23d9d16c1bd24f2889a29c
- `git tag --points-at HEAD`: AS6_RESTORE_EPIC022_AS6_ONE_BRANDED_ENTRYPOINT_REPAIR_20260706T111831Z
- `git branch --show-current`: preview/pr-359
- `git status --short`: clean before audit changes
- `git rev-parse origin/main`: 937ab4c82a27dc10fa23d9d16c1bd24f2889a29c
- `git rev-parse preview/pr-359`: 937ab4c82a27dc10fa23d9d16c1bd24f2889a29c

Deployment diagnostics:

- Production deploy workflow: `.github/workflows/deploy.yml`
- Trigger branch: `main`
- Deploy command evidence: workflow runs `git pull origin main` on the server.
- AS6 validation workflow includes `main` and `preview/pr-359`.

Route diagnostics:

- `/`: `frontend/src/App.jsx` route to `AS6OneShellAdapter`.
- `/as6-crm`: `frontend/src/App.jsx` route to `AS6CrmShellAdapter`.
- `/crm`: `frontend/src/App.jsx` route to `AS6SalesShellAdapter`.
- `/as6-sales`: living-space route to `AS6SalesShellAdapter`.
- `/as6-one`: living-space route to `AS6OneShellAdapter`.
- Duplicate route declaration risk: `frontend/src/App.jsx` renders both `createAS6LivingSpaceRouteElements()` and `<AS6LivingSpaceRoutes />`.

Shell diagnostics:

- Primary candidate: `frontend/src/as6/shell/AS6Shell.jsx`.
- Legacy shell/helper hybrid: `frontend/src/components/AppShell.jsx`.
- Duplicate shells: `frontend/src/components/as6-os/AS6OSShell.jsx`, `frontend/src/as6os/applicationShell/AS6ApplicationShell.jsx`, `frontend/src/as6os/workspace/AS6WorkspaceShell.jsx`.

Workspace diagnostics:

- Primary CRM workspace: `frontend/src/as6-crm/AS6CrmOneWorkspace.jsx`.
- Primary wrapper/helper: `frontend/src/components/as6-workspace/AS6Workspace.jsx`.
- Legacy workspace wrapper: `frontend/src/components/as6/AS6Workspace.jsx`.
- Legacy CRM workspace page: `frontend/src/pages/CRMWorkspacePage.jsx`.

CRM entrypoint diagnostics:

- Primary CRM: `/as6-crm`.
- Legacy CRM: `/crm`, `/as6-sales`, `/crm-workspace`, `/crm-v2`.
- CRM business logic: `frontend/src/pages/CRMPage.jsx`, `frontend/src/crm/**`, `frontend/src/as6crm/**`.

Root cause:

- AS6_PARALLEL_UI_ARCHITECTURE_DRIFT

Failure classes:

- AS6_MULTIPLE_PRIMARY_SHELLS_GAP
- AS6_MULTIPLE_CRM_ENTRYPOINTS_GAP
- AS6_PRODUCTION_VISUAL_VALIDATION_GAP
- AS6_ROUTE_OWNERSHIP_DRIFT

Result:

- AS6_EPIC023_ARCHITECTURE_RESET_AUDIT=PASS
- UI code changed: NO
- Architecture audit artifacts created: YES
