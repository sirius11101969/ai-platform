# AS6 ONE Command Center Visual Drift Root Cause

## Root cause
AS6 ONE visually drifted from Command Center because it reimplemented layout instead of reusing Command Center visual foundation.

## Failure class
as6-one-command-center-visual-drift

## AEC rule
as6-one-must-reuse-command-center-visual-foundation-before-crm-cutover

## Fix
`/as6-one`, `/crm-enterprise`, and `/crm-v3` now route to `AS6OnePage`, a semantic fork of `CommandCenterPage` that preserves the Command Center visual foundation: AppShell mode, sidebar, hero, KPI row, quick actions, main grid, core cards, right rail, command-card primitives, recommendation/event/status blocks, and class names.

## Production markers
- AS6OnePage
- as6-one
- as6-command-center-visual-foundation
- as6-one-exact-command-center-clone
- as6-revenue-flow
- as6-general-director
- as6-core
