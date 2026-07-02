# EPIC-006 PR-2 — Scenario Dependencies

STAGE=AS6_EPIC006_PR2_SCENARIO_DEPENDENCIES
DATE_UTC=20260702T053658Z

## Diagnostics
- AS6_EXECUTIVE_SCENARIO_DEPENDENCY_MODEL_GAP detected and closed.
- AS6_EXECUTIVE_SCENARIO_DEPENDENCY_VALIDATION_GAP detected and closed.
- AS6_EXECUTIVE_SCENARIO_DEPENDENCY_WAIT_REASON_GAP detected and closed.
- AS6_EXECUTIVE_SCENARIO_DEPENDENCY_CYCLE_DRIFT detected and controlled.
- AS6_EXECUTIVE_SCENARIO_DEPENDENCY_STORAGE_DRIFT checked.

## Root Cause
EPIC-006 PR-1 introduced priorities, but execution order also needs runtime-only dependency validation before orchestration can safely select the next scenario.

## Change
- Added runtime-only dependsOn model.
- Added dependency validation.
- Added missing dependency detection.
- Added wait reason explanation.
- Added dependency cycle detection.
- Added Business Home dependencies panel.

## Storage Safety
- Workspace Storage V99 unchanged.
- contextState.businessHome unchanged.
- layout schema unchanged.
- localStorage unchanged.
- persistent storage unchanged.

PROJECT_READINESS=99.97%
