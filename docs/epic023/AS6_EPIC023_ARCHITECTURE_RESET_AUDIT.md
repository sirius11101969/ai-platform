# AS6 EPIC023 Architecture Reset Audit

Stage: AS6_EPIC023_ARCHITECTURE_RESET_AUDIT

Audit timestamp: 2026-07-06T11:42:29Z

Base:

- HEAD: 937ab4c82a27dc10fa23d9d16c1bd24f2889a29c
- Branch: preview/pr-359
- Restore tag at HEAD: AS6_RESTORE_EPIC022_AS6_ONE_BRANDED_ENTRYPOINT_REPAIR_20260706T111831Z
- origin/main: 937ab4c82a27dc10fa23d9d16c1bd24f2889a29c
- preview/pr-359: 937ab4c82a27dc10fa23d9d16c1bd24f2889a29c
- Production deploy workflow: .github/workflows/deploy.yml deploys pushes to main and runs `git pull origin main`.

## 1. Current Reality

The repository currently has the AS6 ONE direction partially connected, but several historical public surfaces still coexist.

Actual frontend router evidence:

- `frontend/src/App.jsx` mounts `/` to `AS6OneShellAdapter`.
- `frontend/src/App.jsx` mounts `/as6-crm` to `AS6CrmShellAdapter`.
- `frontend/src/App.jsx` mounts `/crm` to `AS6SalesShellAdapter`, not to a redirect.
- `frontend/src/as6/living-spaces/as6LivingSpaceRegistry.js` registers `/as6-one`, `/as6-crm` and `/as6-sales`.
- `frontend/src/App.jsx` calls both `createAS6LivingSpaceRouteElements()` and `<AS6LivingSpaceRoutes />`, creating duplicate living-space route declarations for the same registry.
- `/crm-workspace`, `/crm-v2`, `/as6-workspace`, `/as6-os`, `/business-home` remain live public or protected interfaces.
- `frontend/src/pages/LandingPage.jsx` remains in the repository but is not mounted as `/`.
- `frontend/src/pages/CRMPage.jsx` remains real business CRM logic and is reused by `CRMWorkspacePage`.
- `frontend/src/components/AppShell.jsx` still links major navigation to `/crm`, so old internal navigation can keep users on the legacy rollback surface.

Production/deployment reality:

- `.github/workflows/deploy.yml` deploys `main`; local `origin/main` and `preview/pr-359` currently point at the same commit.
- Earlier project state recorded production serving an older bundle while AS6 ONE and CRM ONE existed only in the newer branch lineage. That is the deployment/visual reason users could still see old UI after new routes appeared in code.
- A route can be code-correct and still visually wrong if navigation ownership, deployment branch, static bundle freshness, and public route ownership are not validated together.

## 2. Route Map

| route | current component | status | recommended action |
| --- | --- | --- | --- |
| `/` | `AS6OneShellAdapter` -> `AS6Shell` -> `AS6OnePage` | primary | Keep as AS6 ONE branded landing and product shell. |
| `/as6-crm` | `AS6CrmShellAdapter` -> `AS6Shell` -> `AS6CrmOneWorkspace` | primary | Keep as single public CRM Workspace inside AS6 ONE. |
| `/crm` | `AS6SalesShellAdapter` -> `AS6Shell` -> `CRMWorkspacePage` -> `CRMPage` | legacy | Convert to redirect to `/as6-crm` or retain only as rollback after separate validation. |
| `/as6-sales` | living-space route -> `AS6SalesShellAdapter` | legacy | Keep only as rollback route until deletion validation. |
| `/as6-one` | living-space route -> `AS6OneShellAdapter` with `RequireAuth` | duplicate | Use only as optional alias to AS6 ONE if needed; otherwise redirect to `/`. |
| `/crm-workspace` | `CRMWorkspacePage` -> `components/as6/AS6Workspace` -> `CRMPage` | duplicate | Remove from public navigation later or restrict to rollback/testing after validation. |
| `/crm-v2` | `CRMBrandV2Page` behind `ProtectedRoute` | legacy | Mark rollback/experiment only; no primary CRM ownership. |
| `/as6-workspace` | `AS6WorkspacePage` -> `components/as6/AS6Workspace` | duplicate | Preserve until workspace ownership review, then fold into AS6 ONE or deprecate. |
| `/as6-os` | `AS6OSPage` -> `AS6OSShell` | duplicate | Preserve as legacy OS experiment until shell consolidation. |
| `/business-home` | `AS6BusinessHome` behind `ProtectedRoute` | legacy | Keep as business logic source; no public shell ownership. |
| `/marketplace` | direct `AS6RealAppWiring` bypass in `App.jsx` | unknown | Audit as direct route bypass before shell reset. |
| `/dashboard`, `/command-center`, `/ai-*`, `/followups`, `/priority-inbox`, `/pipeline-copilot` | protected app pages using `AppShell` helpers and/or protected routes | legacy | Keep business pages; migrate navigation ownership under final shell plan. |
| `*` | `<Navigate to="/" replace />` | primary fallback | Keep SPA fallback to AS6 ONE. |

Public route classification:

- Public primary: `/`, `/as6-crm`.
- Public legacy/rollback: `/crm`, `/as6-sales`, `/crm-workspace`, `/as6-workspace`, `/as6-os`, `/marketplace`.
- Protected legacy/business routes: `/crm-v2`, `/dashboard`, `/command-center`, `/business-home`, AI routes, followups and inbox routes.

## 3. Shell Map

| shell | file | used by | status | recommended action |
| --- | --- | --- | --- | --- |
| `AS6Shell` | `frontend/src/as6/shell/AS6Shell.jsx` | `AS6OneShellAdapter`, `AS6CrmShellAdapter`, `AS6SalesShellAdapter` | primary target shell | Keep as single primary shell candidate; make ownership explicit in next plan. |
| `AS6OneShellAdapter` | `frontend/src/as6-one/AS6OneShellAdapter.jsx` | `/`, `/as6-one` living-space route | primary/alias adapter | Keep root ownership; decide whether `/as6-one` remains alias. |
| `AS6CrmShellAdapter` | `frontend/src/as6-crm/AS6CrmShellAdapter.jsx` | `/as6-crm` and living-space route | primary CRM adapter | Keep as only public CRM adapter. |
| `AS6SalesShellAdapter` | `frontend/src/as6-sales/AS6SalesShellAdapter.jsx` | `/crm`, `/as6-sales` | legacy rollback adapter | Keep until rollback validation; later redirect or delete. |
| `ProtectedLayout` / `AppShell` | `frontend/src/components/AppShell.jsx` | protected app pages and shared helpers | legacy shell/helper hybrid | Preserve helpers; migrate shell/navigation ownership in reset plan. |
| `AS6OSShell` | `frontend/src/components/as6-os/AS6OSShell.jsx` | `/as6-os` | duplicate shell | Do not delete before OS route validation; not primary. |
| `AS6ApplicationShell` | `frontend/src/as6os/applicationShell/AS6ApplicationShell.jsx` | as6os foundation modules | unknown/internal | Preserve as internal architecture artifact; not public primary shell. |
| `AS6WorkspaceShell` | `frontend/src/as6os/workspace/AS6WorkspaceShell.jsx` | `AS6WorkspaceExperienceFoundation` | duplicate/internal | Preserve for workspace foundation review; not public primary shell. |
| `AS6DynamicShellBridge` | `frontend/src/as6/shell/dynamic/AS6DynamicShellBridge.jsx` | dynamic shell registry | internal | Preserve; govern under no-new-shell rule. |

## 4. Workspace Map

| workspace | file | used by | status | recommended action |
| --- | --- | --- | --- | --- |
| `AS6CrmOneWorkspace` | `frontend/src/as6-crm/AS6CrmOneWorkspace.jsx` | `/as6-crm` through `AS6CrmShellAdapter` | primary CRM workspace | Keep as target CRM workspace. |
| `AS6Workspace` wrapper | `frontend/src/components/as6-workspace/AS6Workspace.jsx` | `AS6CrmOneWorkspace`, `AppShell` | primary wrapper/helper | Keep; make relationship to `AS6Shell` explicit. |
| `AS6Workspace` legacy page wrapper | `frontend/src/components/as6/AS6Workspace.jsx` | `CRMWorkspacePage`, `AS6WorkspacePage` | duplicate | Preserve until routes are redirected or removed after validation. |
| `CRMWorkspacePage` | `frontend/src/pages/CRMWorkspacePage.jsx` | `/crm-workspace`, `/crm`, `/as6-sales` through rollback adapter | legacy CRM workspace | Keep as rollback/business logic carrier until CRM reset. |
| `AS6WorkspacePage` | `frontend/src/pages/AS6WorkspacePage.jsx` | `/as6-workspace` | duplicate | Review for alias/deprecation in reset plan. |
| `AS6WorkspaceFoundation` | `frontend/src/as6/workspace/AS6WorkspaceFoundation.jsx` | AS6 workspace foundation modules | internal | Preserve as business/workspace logic. |
| `AS6WorkspaceExperienceFoundation` | `frontend/src/as6os/workspaceExperience/AS6WorkspaceExperienceFoundation.jsx` | as6os workspace experience | internal/duplicate | Preserve for later consolidation. |
| CRM module workspace surfaces | `frontend/src/crm/*/*WorkspaceSurface.jsx` and workspace integrations | CRM panels inside `CRMPage` | business logic | Do not delete; these are reusable CRM logic surfaces. |

## 5. CRM Map

| CRM entrypoint | file | role | status | recommended action |
| --- | --- | --- | --- | --- |
| `/as6-crm` | `frontend/src/as6-crm/AS6CrmShellAdapter.jsx`, `frontend/src/as6-crm/AS6CrmOneWorkspace.jsx` | AS6 CRM ONE public workspace | primary | Keep as the only public CRM entrypoint. |
| `/crm` | `frontend/src/App.jsx` route to `AS6SalesShellAdapter` | legacy alias currently public | legacy | Redirect to `/as6-crm` after rollback validation. |
| `/as6-sales` | `frontend/src/as6-sales/AS6SalesShellAdapter.jsx` | rollback shell for old CRM workspace | legacy rollback | Keep hidden/rollback only until deletion validation. |
| `/crm-workspace` | `frontend/src/pages/CRMWorkspacePage.jsx` | old workspace wrapper around `CRMPage` | duplicate | Remove from public use later; keep while rollback depends on it. |
| `/crm-v2` | `frontend/src/pages/CRMBrandV2Page.jsx` | historical CRM brand experiment | legacy | Deprecate or gate after validation. |
| `CRMPage` | `frontend/src/pages/CRMPage.jsx` | mature CRM business UI, data wiring, panels | business logic | Do not delete; reuse logic during AS6 CRM reset. |
| CRM domain registry | `frontend/src/as6crm/*`, `frontend/src/crm/*` | CRM contracts, entities, modules, diagnostics | business logic | Do not delete; this is canonical CRM logic inventory. |

## 6. Final Target Architecture

Final target:

- `/` = AS6 ONE branded landing and product shell.
- `/as6-crm` = CRM Workspace inside AS6 ONE.
- `/crm` = legacy redirect or rollback only.
- `/as6-sales` = legacy rollback only.
- `/as6-one` = alias to AS6 ONE only if needed.

Ownership:

- One primary shell: `AS6Shell`.
- One public CRM entrypoint: `/as6-crm`.
- Legacy routes can exist only with explicit rollback status and no primary navigation ownership.
- Internal CRM business logic must be preserved while public entrypoints are simplified.

## 7. Delete Later List

Delete or redirect only after a separate validation stage:

- Route `/crm` as public CRM surface.
- Route `/as6-sales` after rollback window expires.
- Route `/crm-workspace` after rollback dependency is removed.
- Route `/crm-v2` after historical CRM brand experiment is confirmed unused.
- Route `/as6-workspace` after workspace consolidation.
- Route `/as6-os` after shell consolidation.
- Duplicate living-space route creation in `frontend/src/App.jsx`.
- `frontend/src/pages/LandingPage.jsx` only after confirming no external campaign/auth dependency.
- Legacy shell CSS tied only to deprecated shells, after route and visual validation.

## 8. Do Not Delete List

Do not delete:

- CRM business logic: `frontend/src/pages/CRMPage.jsx`, `frontend/src/crm/**`, `frontend/src/as6crm/**`.
- API/services: `frontend/src/services/**`, backend CRM APIs, data connectors.
- Diagnostics: `docs/diagnostics/**`, `ops/bin/as6-*`, runtime-independent diagnostic scripts.
- Registries: `ops/registry/**`, `frontend/src/as6/living-spaces/**`, `frontend/src/as6/workspace/**` registries.
- Governance: `docs/governance/**`, `docs/aec/**`, `docs/coverage/**`.
- Restore tags and release evidence.
- Existing rollback paths until the next plan validates production visual parity.

## 9. Root Cause

Registered root cause:

- AS6_PARALLEL_UI_ARCHITECTURE_DRIFT

Definition:

Multiple UI generations were kept live as public surfaces while route ownership, navigation ownership, deployment branch ownership and visual validation were not governed as one architecture contract.

## 10. Failure Classes

Registered failure classes:

- AS6_MULTIPLE_PRIMARY_SHELLS_GAP
- AS6_MULTIPLE_CRM_ENTRYPOINTS_GAP
- AS6_PRODUCTION_VISUAL_VALIDATION_GAP
- AS6_ROUTE_OWNERSHIP_DRIFT

## 11. Architecture Rules

Registered architecture rules:

- AS6_SINGLE_PRIMARY_SHELL_RULE
- AS6_SINGLE_PUBLIC_CRM_ENTRYPOINT_RULE
- AS6_PRODUCTION_VISUAL_VALIDATION_REQUIRED_RULE
- AS6_NO_NEW_SHELL_WITHOUT_ARCHITECTURE_APPROVAL_RULE

Rule details:

- New public UI shells require architecture approval and registry ownership.
- CRM can have only one public primary route.
- Production visual validation must prove the public root and CRM route after deploy.
- Legacy routes must be marked rollback, redirect, or protected experiment; they cannot silently act as primary interfaces.

## 12. Next Plan

Recommended next stage:

- AS6_EPIC023_ARCHITECTURE_RESET_PLAN

Plan goals:

- Convert this audit into an ordered, validation-first route ownership plan.
- Decide exact redirect behavior for `/crm`, `/as6-sales`, `/as6-one`, `/crm-workspace`, `/crm-v2`, `/as6-workspace`, `/as6-os`.
- Define one shell owner and one workspace owner.
- Define production visual checks for `/`, `/as6-crm`, `/crm`, `/as6-sales`, `/as6-one`.
- Preserve CRM business logic while reducing public entrypoints.
