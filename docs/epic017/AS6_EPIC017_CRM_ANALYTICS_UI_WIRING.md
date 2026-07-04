# AS6 EPIC017 — CRM Analytics UI Wiring

STAGE=AS6_EPIC017_CRM_ANALYTICS_UI_WIRING
PROJECT_READINESS=99%
BASE_EXPECTED=ddf5a784117719735d310b6089b04dcb071d4e3d
BASE_RESTORE_TAG=AS6_RESTORE_EPIC017_CRM_ANALYTICS_FOUNDATION_20260704T182748Z
SELECTED_MODULE=CRM_ANALYTICS

## Diagnostics

- HEAD matches BASE_EXPECTED: PASS.
- Restore tag exists at HEAD: PASS.
- Worktree clean before implementation: PASS.
- CRM Analytics foundation exists: PASS.
- CRM Analytics Workspace integration exists: PASS.
- CRMAnalyticsPanel existed before this stage: PASS.
- CRMAnalyticsPanel was not yet wired through Analytics Workspace surface: PASS.
- Analytics Workspace UI surface added: PASS.
- Existing Analytics panel preserved as legacy inner content: PASS.

## Root Cause

CRM Analytics domain foundation existed after AS6_EPIC017_CRM_ANALYTICS_FOUNDATION, but the existing CRMAnalyticsPanel still rendered as a panel-level surface and was not yet wired through the reusable Analytics Workspace UI surface.

## Structure Added

- frontend/src/crm/analytics/CRMAnalyticsWorkspaceSurface.jsx
- frontend/src/pages/crm/CRMAnalyticsLegacyPanel.jsx

## Structure Updated

- frontend/src/pages/crm/CRMAnalyticsPanel.jsx now renders legacy analytics content inside CRMAnalyticsWorkspaceSurface.
- frontend/src/crm/analytics/index.js exports CRMAnalyticsWorkspaceSurface.

## Explicit Diagnostic Additions

- Added diagnostic class: AS6_CRM_ANALYTICS_UI_WIRING_GAP.
- Added control: CRM Analytics panel UI must render through the reusable Workspace surface while preserving the legacy panel as inner content until full visual migration is complete.
- Added AEC rule: AS6_AEC_CRM_ANALYTICS_PANEL_USES_WORKSPACE_SURFACE.
- JSX validation is delegated to frontend production build.

## Next Stage

NEXT_STAGE=AS6_EPIC017_CRM_ANALYTICS_FINAL_VALIDATION
