# AS6 CODEX PROMPT

Use this in Codex or a new AI coding session:

Продолжаем AS6. Источник истины: docs/AS6_HANDOFF.md. Работай строго по AS6 Diagnostics First. Перед изменениями выполни диагностику, найди root cause, проверь структуру, добавь диагностические артефакты, checks, controls, failure classes, AEC rules, registry, coverage, governance, state, validation, commit и push. Всегда обновляй docs/AS6_HANDOFF.md через ops/bin/as6-update-handoff.

## Master Context Rule
Before any work, read docs/AS6_MASTER_CONTEXT.md, docs/AS6_HANDOFF.md and docs/AS6_PROJECT_STATE.md.

## AS6 V211 Master Context Autosync Rule
Every AS6 patch must run ops/bin/as6-update-handoff before commit, normally through ops/bin/as6-finish. The updater must refresh both docs/AS6_MASTER_CONTEXT.md and docs/AS6_HANDOFF.md with current branch, last commit, last commit message, readiness, priority, workstream and last stage.

AEC-MASTER-CONTEXT-001: every AS6 patch must update docs/AS6_MASTER_CONTEXT.md and docs/AS6_HANDOFF.md through ops/bin/as6-update-handoff before commit.
