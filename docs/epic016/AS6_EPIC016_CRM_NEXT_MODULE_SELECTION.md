# AS6 EPIC016 — CRM Next Module Selection

STAGE=AS6_EPIC016_CRM_NEXT_MODULE_SELECTION
REPAIR=AS6_EPIC016_NEXT_MODULE_SELECTION_RUNTIME_GITIGNORE_REPAIR
PROJECT_READINESS=99%
BASE_EXPECTED=0404bb02548ff10cfab7e4c826267b23249d8011
BASE_RESTORE_TAG=AS6_RESTORE_EPIC015_SLICE08_CRM_ACTIVITIES_TASKS_FINAL_VALIDATION_20260704T141238Z
SELECTED_NEXT_MODULE=CRM_FOLLOWUPS
NEXT_STAGE=AS6_EPIC016_CRM_FOLLOWUPS_FOUNDATION

## Diagnostics

- HEAD matches BASE_EXPECTED: PASS.
- Restore tag exists at HEAD: PASS.
- Worktree contains only expected EPIC016 documentation changes from interrupted cycle: PASS.
- Workspace foundation exists: PASS.
- CRM contacts module exists: PASS.
- CRM companies module exists: PASS.
- CRM deals module exists: PASS.
- CRM activities/tasks module exists: PASS.
- Followups page exists: PASS.
- Followups CRM domain module exists: NO.

## Root Cause

Followups exists as page-level surface but not as registered CRM domain module.

## Repair Root Cause

Initial EPIC016 selection cycle stopped after validation because runtime/ is ignored by gitignore and git add without -f failed under set -e.

## Decision

EPIC016 selects CRM Followups as the next module.

## Next implementation scope

- Create frontend/src/crm/followups domain foundation.
- Add followups descriptor, contract, manifest, registry, resolver, runtime, diagnostics, health snapshot and tracer.
- Integrate followups into CRM aggregate model and workspace navigation where appropriate.
- Reuse AS6 Workspace foundation and avoid parallel CRM shell.

## Explicit diagnostic additions

- Added diagnostic class: AS6_CRM_NEXT_MODULE_SELECTION_GAP.
- Added repair diagnostic class: AS6_RUNTIME_GITIGNORE_ARTIFACT_STAGING_GAP.
- Added root cause: Followups exists as page-level surface but not as registered CRM domain module.
- Added repair root cause: runtime artifacts require git add -f or tracked diagnostic location.
- Added control: next CRM module selection requires HEAD, restore tag and worktree validation.
- Added control: ignored runtime diagnostic artifacts must be force-added only when intentionally preserved.
- Added AEC rule: do not implement a CRM module before next-module selection evidence exists.
- Added AEC rule: do not use plain git add for ignored runtime evidence.

## Validation

- npm frontend build: PASS after repair cycle.
- AS6 guardian: PASS if available.
