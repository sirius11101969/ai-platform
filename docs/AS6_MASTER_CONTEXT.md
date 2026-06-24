# AS6 MASTER CONTEXT

LAST_UPDATE_UTC=20260624T004400Z
CURRENT_BRANCH=main
LAST_COMMIT=7d1d833ff2484388b406de46b59d8a6ac669caee
LAST_COMMIT_SHORT=7d1d833
LAST_COMMIT_MESSAGE=docs: repair AS6 master context freshness v217b
LAST_COMPLETED_STAGE=V218B
CURRENT_STAGE=V218B
NEXT_RECOMMENDED_STAGE=V218 — Design System Foundation
PROJECT_READINESS=99%
LAST_RESTORE_TAG=AS6_RESTORE_7d1d833
ACTIVE_WORKSTREAM=AS6 platform stabilization, UI restore safety, Command Center production quality
CURRENT_PRIORITY=Keep project context fresh for new chats and prevent stale handoff recovery
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
- V217: Master Context Freshness Enforcement — PASS

## Restore Safety
- Latest restore tag: AS6_RESTORE_7d1d833
- Local restore command: ops/bin/as6-restore-to-tag AS6_RESTORE_7d1d833
- Remote restore command: CONFIRM_AS6_RESTORE=YES ops/bin/as6-restore-to-tag AS6_RESTORE_7d1d833 --push

## Mandatory New Chat Start
Продолжаем AS6. Прочитай docs/AS6_MASTER_CONTEXT.md, docs/AS6_HANDOFF.md и docs/AS6_CODEX_PROMPT.md из GitHub репозитория sirius11101969/ai-platform. Продолжай с LAST_COMPLETED_STAGE и не используй старые этапы, если LAST_COMMIT отличается.

## Mandatory Workflow
Diagnostics → Root Cause → Structure → Plan → Change → Re-Diagnostics → Diagnostic Artifacts → Checks → Controls → Failure Classes → AEC Rules → GitHub → Diagnostic Registry → Coverage Registry → Governance → State → Detected Errors → Automation → Validation → Commit → Push → Restore Tag.
