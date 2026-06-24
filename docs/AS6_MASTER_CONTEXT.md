# AS6 MASTER CONTEXT

LAST_UPDATE_UTC=20260624T034736Z
CURRENT_BRANCH=main
LAST_COMMIT=1fe32ebe5f3310e06441827ec1874b5c34318095
LAST_COMMIT_SHORT=1fe32eb
LAST_COMMIT_MESSAGE=docs: enforce AS6 context consistency v218d
LAST_COMPLETED_STAGE=V218D
CURRENT_STAGE=V218D
NEXT_RECOMMENDED_STAGE=V219 — Design System Foundation
PROJECT_READINESS=99%
LAST_RESTORE_TAG=AS6_RESTORE_1fe32eb
ACTIVE_WORKSTREAM=AS6 platform stabilization, UI restore safety, Command Center production quality
CURRENT_PRIORITY=Design System Foundation after verified context consistency
CURRENT_ROOT_CAUSE=none
SAFE_TO_CHANGE=YES

## Project
- Name: AS6 AI Platform
- Repository: github.com/sirius11101969/ai-platform
- Production: https://www.as6.ru
- Health: https://www.as6.ru/api/health
- Server path: /var/www/ai-platform
- Readiness: 99%

## Current Source Of Truth
- docs/AS6_MASTER_CONTEXT.md
- docs/AS6_HANDOFF.md
- docs/AS6_CODEX_PROMPT.md
- docs/AS6_PROJECT_STATE.md
- ops/registry/as6-diagnostic-registry.md
- ops/registry/as6-coverage-registry.md
- ops/status/as6-detected-errors.md
- ops/status/diagnostic-status-registry.json

## Latest Completed Stages
- V213E: Diagnostic Status Registry Lifecycle Fix — PASS
- V214: PR Lifecycle Cleanup — PASS
- V215: Command Center UI Quality — PASS
- V216: UI Restore Policy — PASS
- V217B: Master Context Freshness Repair — PASS
- V218B: Post-Commit Context Refresh — PASS
- V218C: Final Context Self-Refresh — PASS
- V218D: Context Consistency Repair — PASS

## Restore Safety
- Latest restore tag: AS6_RESTORE_d789f5b
- Local restore command: ops/bin/as6-restore-to-tag AS6_RESTORE_d789f5b
- Remote restore command: CONFIRM_AS6_RESTORE=YES ops/bin/as6-restore-to-tag AS6_RESTORE_d789f5b --push

## Mandatory New Chat Start
Продолжаем AS6. Прочитай docs/AS6_MASTER_CONTEXT.md, docs/AS6_HANDOFF.md и docs/AS6_CODEX_PROMPT.md из GitHub репозитория sirius11101969/ai-platform. Источник истины: LAST_COMPLETED_STAGE, LAST_COMMIT, LAST_RESTORE_TAG должны совпадать во всех трёх файлах.

## Mandatory Workflow
Diagnostics → Root Cause → Structure → Plan → Change → Re-Diagnostics → Diagnostic Artifacts → Checks → Controls → Failure Classes → AEC Rules → GitHub → Diagnostic Registry → Coverage Registry → Governance → State → Detected Errors → Automation → Validation → Commit → Push → Restore Tag.
