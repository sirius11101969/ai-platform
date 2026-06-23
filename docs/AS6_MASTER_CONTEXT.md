# AS6 MASTER CONTEXT

Last updated: 20260623T050133Z

## Project
- Name: AS6 AI Platform
- Repository: github.com/sirius11101969/ai-platform
- Production: https://www.as6.ru
- Health: https://www.as6.ru/api/health
- Server path: /var/www/ai-platform
- Readiness: 99%

## Purpose
AS6 is an AI Platform / Command Center project focused on creating a modern, simple, beautiful, useful interface and service for clients.

## Current Source Of Truth
- docs/AS6_MASTER_CONTEXT.md
- docs/AS6_HANDOFF.md
- docs/AS6_PROJECT_STATE.md
- docs/AS6_CODEX_PROMPT.md
- ops/registry/as6-diagnostic-registry.md
- ops/registry/as6-coverage-registry.md
- ops/status/as6-detected-errors.md

## Mandatory New Chat Start
Продолжаем AS6. Прочитай docs/AS6_MASTER_CONTEXT.md, docs/AS6_HANDOFF.md и docs/AS6_CODEX_PROMPT.md из GitHub репозитория sirius11101969/ai-platform. Продолжай с последнего завершённого этапа по AS6 Diagnostics First.

## Mandatory Workflow
Diagnostics → Root Cause → Structure → Plan → Change → Re-Diagnostics → Diagnostic Artifacts → Checks → Controls → Failure Classes → AEC Rules → GitHub → Diagnostic Registry → Coverage Registry → Governance → State → Detected Errors → Automation → Validation → Commit → Push

## Finish Rule
Любой AS6 патч считается незавершённым, если не выполнен:

ops/bin/as6-finish

## Key Frontend Files
- frontend/src/main.jsx
- frontend/src/App.jsx
- frontend/src/components/AppShell.jsx
- frontend/src/pages/CommandCenterPage.jsx
- frontend/src/theme/as6Theme.css
- frontend/src/styles.css

## Key Ops Files
- ops/bin/as6-finish
- ops/bin/as6-update-handoff
- ops/bin/as6-diagnose-handoff-finish-policy-v209
- ops/bin/as6-diagnose-master-context-v210
- ops/governance/as6-finish-policy.md

## Last Confirmed Stages
- V199: Command Center flash fixed.
- V205-V207: Command Center sidebar visual etalon improved.
- V208: Revenue Dynamics chart full-height correction.
- V209/V209B: Handoff docs and finish policy added.

## Active UI Focus
- Command Center visual etalon.
- Left sidebar final polish.
- Revenue chart layout.
- Card spacing, radius and typography.
- Stable no-flash first render.

## Known Important Root Causes
- COMMAND_CENTER_FALLBACK_TO_LIVE_DATA_FULL_RERENDER
- COMMAND_CENTER_MULTIPLE_STYLE_AUTHORITIES
- SIDEBAR_V204_OVERSIZED_SPACING_FONT_AND_WIDTH_DRIFT_FROM_ETALON
- REVENUE_DYNAMICS_CHART_USED_ONLY_TOP_PART_OF_CARD_LEAVING_EMPTY_BOTTOM_SPACE
- ISSUE_330_PARTIALLY_IMPLEMENTED_FINISH_POLICY_MISSING

## Current Rules
- Do not rely on chat memory.
- GitHub docs are the project memory.
- Before any UI change, find actual React component, actual DOM node, actual CSS owner.
- Add runtime tracer if source is unknown.
- Always update diagnostics, coverage, governance, state and detected errors.
- Always finish through ops/bin/as6-finish.

## 20260623T130000Z Package Lock Sync V213B
- Active blocker: PR #333 Architecture Guardian frontend Docker build failed because frontend/package.json and frontend/package-lock.json were out of sync.
- Fix scope: frontend/package-lock.json only for dependency lock synchronization, plus diagnostics/docs/registries for prevention.
- Diagnostic: ops/bin/as6-diagnose-package-lock-sync-v213b
- Failure classes: PACKAGE_LOCK_OUT_OF_SYNC, NPM_CI_LOCKFILE_MISMATCH, FRONTEND_DEPENDENCY_DRIFT
