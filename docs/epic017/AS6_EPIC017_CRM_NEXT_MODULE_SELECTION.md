# AS6 EPIC017 — CRM Next Module Selection

STAGE=AS6_EPIC017_CRM_NEXT_MODULE_SELECTION
PROJECT_READINESS=99%
BASE_EXPECTED=8bad574267a75d3affdf4c02896b0e75fccd7c32
BASE_RESTORE_TAG=AS6_RESTORE_EPIC016_CRM_FOLLOWUPS_FINAL_VALIDATION_20260704T174150Z
PREVIOUS_EPIC=AS6_EPIC016
PREVIOUS_STATUS=AS6_EPIC016_CRM_FOLLOWUPS=PRODUCTION_VALIDATED
SELECTED_NEXT_MODULE=CRM_ANALYTICS
NEXT_STAGE=AS6_EPIC017_CRM_ANALYTICS_FOUNDATION

## Diagnostics

- HEAD matches BASE_EXPECTED: PASS.
- Restore tag exists at HEAD: PASS.
- Worktree clean before selection: PASS.
- EPIC016 final validation artifact exists: PASS.
- Existing CRM production chain verified: contacts, companies, deals, activities, followups.
- Next CRM module candidate selected from repository structure: PASS.

## Root Cause

CRM analytics exists as a UI panel surface at frontend/src/pages/crm/CRMAnalyticsPanel.jsx, but frontend/src/crm/analytics does not exist as a registered CRM domain foundation.

## Decision

EPIC017 selects CRM_ANALYTICS as the next CRM module.

## Explicit Diagnostic Additions

- Added diagnostic class: AS6_CRM_EPIC017_NEXT_MODULE_SELECTION_GAP.
- Added control: EPIC017 next CRM module must be selected from repository structure after EPIC016 production validation, not from model memory.
- Added AEC rule: AS6_AEC_EPIC017_NEXT_MODULE_SELECTION_BEFORE_IMPLEMENTATION.

## Next Stage

NEXT_STAGE=AS6_EPIC017_CRM_ANALYTICS_FOUNDATION
