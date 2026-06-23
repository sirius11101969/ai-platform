# AS6 HANDOFF

Last updated: 20260623T052728Z
Branch: main
Last commit: 04d62b7

## Project
- Name: AS6 AI Platform
- Repository: github.com/sirius11101969/ai-platform
- Production: https://www.as6.ru
- Health: https://www.as6.ru/api/health
- Readiness: 99%

## New Chat Instruction
Продолжаем AS6. Источник истины: docs/AS6_HANDOFF.md. Сначала прочитай состояние проекта, выполни диагностику и продолжай с последнего завершенного этапа.

## Mandatory Workflow
Diagnostics → Root Cause → Structure → Plan → Change → Re-Diagnostics → Diagnostic Artifacts → Checks → Controls → Failure Classes → AEC Rules → GitHub → Diagnostic Registry → Coverage Registry → Governance → State → Detected Errors → Automation → Validation → Commit → Push

## Always Update
- docs/AS6_HANDOFF.md
- docs/AS6_CURRENT_STATE.md
- docs/AS6_ARCHITECTURE.md
- docs/AS6_UI_ETALONS.md
- docs/AS6_PROJECT_STATE.md
- ops/registry/as6-diagnostic-registry.md
- ops/registry/as6-coverage-registry.md
- ops/status/as6-detected-errors.md

## 20260623T000000Z AS6 V213C Diagnostic Status Registry Lifecycle
- Fixed diagnostic status registry lifecycle handling for historical entries.
- Registry entries now include lifecycle_status: ACTIVE, ARCHIVED, DEPRECATED, REMOVED.
- ACTIVE entries require an existing diagnostic file; historical statuses may be file-missing without failure.
- Added ops/bin/as6-update-diagnostic-status-registry deterministic lifecycle updater.
- Added ops/bin/as6-diagnose-diagnostic-status-registry-lifecycle-v213c.
- Validation required: update registry, diagnose registry, diagnose lifecycle v213c.
