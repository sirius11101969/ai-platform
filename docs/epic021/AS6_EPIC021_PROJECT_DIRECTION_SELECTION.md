# AS6 EPIC021 — Project Direction Selection

STAGE=AS6_EPIC021_PROJECT_DIRECTION_SELECTION
PROJECT_READINESS=99%
BASE_EXPECTED=87f338d0908894fdfd70cc20c75d256db4f5589f
BASE_RESTORE_TAG=AS6_RESTORE_EPIC020_CRM_COVERAGE_FINAL_VALIDATION_20260705T160602Z

## Previous confirmed state

AS6_EPIC020_CRM_COVERAGE=PRODUCTION_VALIDATED

## Selected direction

SELECTED_DIRECTION=AS6_DESIGN_SYSTEM_V1_COMPLETION
NEXT_STAGE=AS6_EPIC021_DESIGN_SYSTEM_V1_COMPLETION

## Root Cause

CRM coverage is production validated and no repository-backed next CRM module candidate remains, so the next project direction must shift from CRM module expansion to platform-level Design System and Workspace completion.

## Decision

EPIC021 selects platform-level Design System v1 completion as the next direction.

CRM module expansion is paused until a new repository-backed module candidate appears.

## Diagnostics added

- AS6_PROJECT_DIRECTION_SELECTION_GAP
- AS6_AEC_PROJECT_DIRECTION_SELECTION_BEFORE_NEW_EPIC

## Runtime policy

runtime/** is not committed to Git.

## Pathspec policy

AS6_GIT_PATHSPEC_EXISTENCE_GUARD remains active.
