# AS6 ONE Command Center Rebrand Diagnostics

## Diagnostics
AS6 ONE route was checked against the Command Center implementation and found to require a strict structural clone of `CommandCenterPage.jsx` instead of a custom page composition.

## Root Cause
AS6 ONE failed visual validation because prior iterations reused Command Center theme but still redesigned the page composition instead of performing a strict 1:1 Command Center rebrand.

## Structure check
`AS6OnePage` is copied from `CommandCenterPage` and keeps Command Center visual classes, section order, grids, right rail, and shell mode.

## Plan
1. Copy Command Center page structure to AS6 ONE.
2. Replace only text, labels, route aliases, and semantic production markers.
3. Keep Command Center shell for `/as6-one`, `/crm-enterprise`, and `/crm-v3`.
4. Re-run validation and guardian checks.

## Change
Created AS6 ONE as a Command Center rebrand clone and wired required AS6 routes.

## Re-diagnostics
The AS6 ONE page uses `command-center-page`, `command-hero`, `command-kpis`, `quick-actions-primary`, `command-main-grid`, `command-core`, and `command-right-rail` from Command Center.

## Diagnostic artifacts
- `frontend/src/pages/AS6OnePage.jsx`
- `frontend/src/components/AppShell.jsx`
- `frontend/src/App.jsx`
- `frontend/src/diagnostics/as6-one-command-center-rebrand.md`

## Checks
- `git diff --check`
- `npm --prefix frontend run build`
- `npm --prefix frontend run test:ui-sanitizer`, when available
- `ops/bin/as6-pr-guardian`

## Controls
Command Center route `/command-center` is unchanged. AS6 routes reuse the command shell without changing Command Center page code.

## Failure classes
- `as6-one-command-center-rebrand-drift`

## AEC rules
- `as6-one-must-be-command-center-rebrand-not-redesign-before-crm-cutover`

## Diagnostic Registry
- `AS6OnePage`
- `as6-one`
- `as6-command-center-rebrand`

## Coverage Registry
- `/as6-one`
- `/crm-enterprise`
- `/crm-v3`
- `/command-center` retained as reference and guardian anchor

## Governance
No new visual CSS system was added. Only semantic markers and route/shell wiring were changed.

## State
Ready for validation.

## Detected errors
Prior AS6 ONE implementation drifted from Command Center page composition.

## Validation
Guardian expected markers: `COMMAND_CENTER_NAV=OK`, `COMMAND_CENTER_RESULT=OK`, `UI_MERGE_GATE_RESULT=OK`, `AS6_GUARDIAN_VERDICT=SAFE_TO_MERGE`.

## Commit
Pending local validation.

## Push
Pending after commit if remote push is available.
