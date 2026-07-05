# AS6 EPIC019 — CRM Next Module Selection

STAGE=AS6_EPIC019_CRM_NEXT_MODULE_SELECTION
PROJECT_READINESS=99%
BASE_EXPECTED=8b610e3849465670474116c86dafd8f22a6b3ff0
BASE_RESTORE_TAG=AS6_RESTORE_EPIC018_CRM_FILTERS_FINAL_VALIDATION_20260705T014640Z
PREVIOUS_EPIC=AS6_EPIC018
PREVIOUS_STATUS=AS6_EPIC018_CRM_FILTERS=PRODUCTION_VALIDATED
SELECTED_NEXT_MODULE=CRM_KANBAN
NEXT_STAGE=AS6_EPIC019_CRM_KANBAN_FOUNDATION

## Diagnostics

- HEAD matches BASE_EXPECTED: PASS.
- Restore tag exists at HEAD: PASS.
- Worktree clean before selection: PASS.
- EPIC018 final validation artifact exists: PASS.
- Existing CRM production chain verified: contacts, companies, deals, activities, followups, analytics, filters.
- Next CRM module candidate selected from repository structure: PASS.

## Root Cause

CRM kanban exists as a UI panel surface at frontend/src/pages/crm/CRMKanbanPanel.jsx, but frontend/src/crm/kanban does not exist as a registered CRM domain foundation.

## Decision

EPIC019 selects CRM_KANBAN as the next CRM module.

## Explicit Diagnostic Additions

- Added diagnostic class: AS6_CRM_EPIC019_NEXT_MODULE_SELECTION_GAP.
- Added control: EPIC019 next CRM module must be selected from repository structure after EPIC018 production validation, not from model memory.
- Added AEC rule: AS6_AEC_EPIC019_NEXT_MODULE_SELECTION_BEFORE_IMPLEMENTATION.

## Next Stage

NEXT_STAGE=AS6_EPIC019_CRM_KANBAN_FOUNDATION
