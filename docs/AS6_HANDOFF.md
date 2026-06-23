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

## 20260623T102000Z package-lock-sync-v213b
- Diagnostic: ops/bin/as6-diagnose-package-lock-sync-v213b
- Failure classes:
  - PACKAGE_LOCK_OUT_OF_SYNC
  - NPM_CI_LOCKFILE_MISMATCH
  - FRONTEND_DEPENDENCY_DRIFT
- Fix: frontend/package-lock.json regenerated so npm ci recognizes local vendor dependencies framer-motion@11.18.2 and react-router-dom@6.26.2.
- Validation target: npm ci, npm run build, docker build, AS6 guardian.
