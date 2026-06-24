# AS6 MASTER CONTEXT

LAST_COMPLETED_STAGE=V220A
PROJECT_READINESS=99%
NEXT_RECOMMENDED_STAGE=V220 — Design System Foundation
SAFE_TO_CHANGE=YES

## Source Of Truth
- Current commit: run `git rev-parse HEAD`
- Current restore tag: run `git tag --points-at HEAD | grep AS6_RESTORE_`
- Full history: docs/AS6_PROJECT_STATE.md
- Diagnostics: ops/registry/as6-diagnostic-registry.md

## Rule
Do not store self-referential commit hashes in MASTER/HANDOFF/CODEX.
