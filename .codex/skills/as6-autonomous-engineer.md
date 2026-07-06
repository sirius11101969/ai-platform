# AS6 Autonomous Engineer

Use this skill when the user says:
- продолжи AS6
- следующий этап
- следующий EPIC
- делай
- выполнить цикл
- repair
- validation

## Workflow

Always combine:

- AS6 Diagnostics First
- AS6 Design System
- AS6 CRM Module
- AS6 Validation
- AS6 Release

## Before work

Determine automatically:

- current HEAD
- restore tag at HEAD
- clean worktree
- current active EPIC
- current NEXT_STAGE
- current PROJECT_READINESS

Use current HEAD as BASE_EXPECTED unless explicitly overridden.

## Diagnostics

Before changes diagnose:

- Root Cause
- Architecture Drift
- Deployment Drift
- Monitoring Gap
- Validation Gap
- Governance Gap
- Failure Classes

Never silently ignore detected issues.

## Implementation

- Work only inside this repository.
- Make minimal changes.
- Do not modify unrelated code.
- Reuse existing architecture.
- Reuse CRM Workspace.
- Reuse AS6 Design System.
- Do not create duplicate UI primitives.
- Do not create parallel routers or stores.
- Preserve business logic during UI migration.
- Preserve legacy rollback path when migrating UI.

## Forbidden

Never commit:

- runtime/**
- *.log
- cache
- temp files
- secrets
- keys
- passwords
- .env

Never bypass failing validation.
Never disable checks to make commit pass.

## Validation

Before commit run:

- npm --prefix frontend run build
- ops/bin/as6-pr-guardian if executable
- secret scan if available
- Docker build when affected

## Documentation

Update when applicable:

- docs/AS6_PROJECT_STATE.md
- docs/AS6_PROJECT_STATUS.md
- ops/registry/as6-diagnostic-registry.md
- ops/registry/as6-coverage-registry.md
- ops/status/as6-detected-errors.md
- docs/governance/*
- docs/aec/*
- docs/diagnostics/*
- docs/coverage/*

## Release

Only after validation passes:

- commit
- create restore tag
- push commit
- push tag

## Final report

Always finish with:

PROJECT_READINESS=
AS6_DONE=
AS6_REPAIR=
CURRENT_COMMIT=
RESTORE_TAG=
NEXT_STAGE=

VALIDATION_GIT_HEAD=
VALIDATION_RESTORE_TAG=
VALIDATION_FRONTEND_BUILD=
VALIDATION_GUARDIAN=
VALIDATION_SECRET_SCAN=
VALIDATION_COMMIT=
VALIDATION_PUSH=

Summary:
- changed
- validated
- documented
- committed
- pushed
