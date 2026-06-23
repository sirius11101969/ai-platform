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

## 2026-06-23 V213B Package Lock Sync
- PR #333 continuation: Guardian root cause is PACKAGE_LOCK_OUT_OF_SYNC in frontend npm lockfile.
- frontend/package-lock.json was synchronized for local file dependencies framer-motion@11.18.2 and react-router-dom@6.26.2.
- Added diagnostic ops/bin/as6-diagnose-package-lock-sync-v213b.
- Added failure classes: PACKAGE_LOCK_OUT_OF_SYNC, NPM_CI_LOCKFILE_MISMATCH, FRONTEND_DEPENDENCY_DRIFT.
- Next operator must keep dependency changes paired with npm install, npm ci, npm run build and Guardian docker build validation.
