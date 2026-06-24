# AS6 MASTER CONTEXT

LAST_COMPLETED_STAGE=V220B
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

## AS6 Product Philosophy
- Mission: AS6 — Ваш бизнес. Простыми словами.
- Promise: AS6 помогает принимать умные решения.
- Emotional KPI: Я понимаю ситуацию; Я знаю следующий шаг; У меня есть план; У меня есть решение; Сегодня будет хороший день.
- Blueprint: docs/AS6_UX_BLUEPRINT.md
- Design principles: docs/AS6_DESIGN_PRINCIPLES.md
