# AS6 CODEX PROMPT

Продолжаем AS6.

Перед любым изменением обязательно прочитай:
1. docs/AS6_MASTER_CONTEXT.md
2. docs/AS6_HANDOFF.md
3. docs/AS6_PROJECT_STATE.md
4. ops/registry/as6-diagnostic-registry.md
5. ops/registry/as6-coverage-registry.md
6. ops/status/as6-detected-errors.md

Правило свежести:
- LAST_COMPLETED_STAGE из docs/AS6_MASTER_CONTEXT.md является источником истины.
- Если другой документ показывает более старый этап, считать его stale и обновить через ops/bin/as6-update-handoff.
- Каждый патч завершается только через ops/bin/as6-finish.

Текущий commit: 97851d2e95632a030772f1c0c7022306838eeeef
Текущий stage: V218B
Следующий stage: V218
Readiness: 99%
Restore tag: AS6_RESTORE_97851d2
