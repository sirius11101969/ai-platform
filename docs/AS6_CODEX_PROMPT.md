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
- LAST_COMPLETED_STAGE, LAST_COMMIT и LAST_RESTORE_TAG должны совпадать в AS6_MASTER_CONTEXT, AS6_HANDOFF и AS6_CODEX_PROMPT.
- Если другой документ показывает более старый этап или другой commit/tag, считать его stale и обновить через ops/bin/as6-update-handoff.
- Каждый патч завершается только через ops/bin/as6-finish.
- После каждого finish новый чат должен видеть один и тот же LAST_COMMIT и LAST_RESTORE_TAG во всех трёх документах.

Текущий commit: ba35f8a2eee6670576d50529e86379a42b14d506
Текущий short commit: ba35f8a
Текущий stage: V218D
Следующий stage: V219
Readiness: 99%
Restore tag: AS6_RESTORE_ba35f8a
