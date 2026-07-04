# AS6 EPIC016 — CRM Followups UI Wiring

STAGE=AS6_EPIC016_CRM_FOLLOWUPS_UI_WIRING
REPAIR=AS6_EPIC016_CRM_FOLLOWUPS_UI_WIRING_JSX_NODE_CHECK_REPAIR
PROJECT_READINESS=99%
BASE_EXPECTED=ca91fc20f5e4fae83f7035a9118a944e52f0d11b
BASE_RESTORE_TAG=AS6_RESTORE_EPIC016_CRM_FOLLOWUPS_WORKSPACE_INTEGRATION_20260704T161420Z
SELECTED_MODULE=CRM_FOLLOWUPS

## Diagnostics

- HEAD matches BASE_EXPECTED: PASS.
- Restore tag exists at HEAD: PASS.
- Worktree clean before implementation: PASS.
- AS6 Workspace foundation exists: PASS.
- CRM Followups foundation exists: PASS.
- CRM Followups Workspace integration exists: PASS.
- Route-level Followups page was not yet wired through Workspace UI surface: PASS.
- Followups Workspace UI surface added: PASS.
- Existing Followups page preserved as legacy inner content: PASS.

## Root Cause

CRM Followups was integrated with AS6 Workspace as a reusable adapter, but the existing route-level FollowupsPage still rendered as a page-level surface and was not yet wired through the Workspace UI surface.

## Repair Root Cause

The first UI wiring cycle attempted node --check on a JSX file. Node.js in this environment does not accept .jsx as a direct syntax-check target, so JSX validation must be performed through the frontend build pipeline.

## Structure Added

- frontend/src/crm/followups/FollowupsWorkspaceSurface.jsx
- frontend/src/pages/FollowupsLegacyPage.jsx

## Structure Updated

- frontend/src/pages/FollowupsPage.jsx now renders the existing legacy Followups content inside FollowupsWorkspaceSurface.
- frontend/src/crm/followups/index.js exports FollowupsWorkspaceSurface.

## Explicit Diagnostic Additions

- Added diagnostic class: AS6_CRM_FOLLOWUPS_UI_WIRING_GAP.
- Added repair diagnostic class: AS6_JSX_NODE_CHECK_UNSUPPORTED_EXTENSION_GAP.
- Added control: Followups route-level UI must render through the reusable Workspace surface while preserving the legacy page as inner content until full UI migration is complete.
- Added repair control: Do not run node --check directly on .jsx files; validate JSX through npm frontend build or a JSX-aware parser.
- Added AEC rule: AS6_AEC_CRM_FOLLOWUPS_ROUTE_USES_WORKSPACE_SURFACE.
- Added repair AEC rule: AS6_AEC_JSX_VALIDATION_USES_FRONTEND_BUILD.

## Next Stage

NEXT_STAGE=AS6_EPIC016_CRM_FOLLOWUPS_FINAL_VALIDATION
