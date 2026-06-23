# AS6 HANDOFF

Last updated: 20260623T060000Z
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

## 20260623T060000Z AS6 V213B PR Guardian
- Added ops/bin/as6-diagnose-pr-guardian-v213b.
- Registered failure classes: PR_GUARDIAN_MERGE_BLOCKED, FRONTEND_DOCKER_CONTEXT_MISMATCH, NPM_CI_EXECUTED_OUTSIDE_FRONTEND.
- Guardian frontend build invariant: docker compose builds nginx from ./frontend and npm ci runs with frontend/package-lock.json available.
