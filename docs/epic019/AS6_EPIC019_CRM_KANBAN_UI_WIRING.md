# AS6 EPIC019 — CRM Kanban UI Wiring

STAGE=AS6_EPIC019_CRM_KANBAN_UI_WIRING
PROJECT_READINESS=99%
BASE_EXPECTED=e4c324f5e961b043d953aeea220987971656c67f
BASE_RESTORE_TAG=AS6_RESTORE_EPIC019_CRM_KANBAN_FOUNDATION_20260705T092218Z
SELECTED_MODULE=CRM_KANBAN

## Diagnostics

- HEAD matches BASE_EXPECTED: PASS.
- Restore tag exists at HEAD: PASS.
- Worktree clean before implementation: PASS.
- CRM Kanban foundation exists: PASS.
- CRM Kanban Workspace integration exists: PASS.
- CRMKanbanPanel existed before this stage: PASS.
- CRMKanbanPanel was not yet wired through Kanban Workspace surface: PASS.
- Kanban Workspace UI surface added: PASS.
- Existing Kanban panel preserved as legacy inner content: PASS.

## Root Cause

CRM Kanban domain foundation existed after AS6_EPIC019_CRM_KANBAN_FOUNDATION, but the existing CRMKanbanPanel still rendered as a panel-level surface and was not yet wired through the reusable Kanban Workspace UI surface.

## Structure Added

- frontend/src/crm/kanban/CRMKanbanWorkspaceSurface.jsx
- frontend/src/pages/crm/CRMKanbanLegacyPanel.jsx

## Structure Updated

- frontend/src/pages/crm/CRMKanbanPanel.jsx now renders legacy kanban content inside CRMKanbanWorkspaceSurface.
- frontend/src/crm/kanban/index.js exports CRMKanbanWorkspaceSurface.

## Explicit Diagnostic Additions

- Added diagnostic class: AS6_CRM_KANBAN_UI_WIRING_GAP.
- Added control: CRM Kanban panel UI must render through the reusable Workspace surface while preserving the legacy panel as inner content until full visual migration is complete.
- Added AEC rule: AS6_AEC_CRM_KANBAN_PANEL_USES_WORKSPACE_SURFACE.
- JSX validation is delegated to frontend production build.

## Next Stage

NEXT_STAGE=AS6_EPIC019_CRM_KANBAN_FINAL_VALIDATION
