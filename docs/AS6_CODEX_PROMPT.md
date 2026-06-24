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
- В каждом из трёх context-документов допустим только один уникальный AS6_RESTORE tag.
- Если другой документ показывает более старый этап или другой commit/tag, считать его stale и обновить через ops/bin/as6-update-handoff.
- Каждый патч завершается только через ops/bin/as6-finish.
- После каждого finish новый чат должен видеть один и тот же LAST_COMMIT и LAST_RESTORE_TAG во всех трёх документах.

Текущий commit: 0b8ccd511dce288f678021251bf829bf88d59851
Текущий short commit: 0b8ccd5
Текущий stage: V219A
Следующий stage: V219
Readiness: 99%
Restore tag: AS6_RESTORE_0b8ccd5
