# AS6 Documents API Anchor Repair v1

## Диагностика

Living Documents v1 остановился при добавлении frontend read-only API.

## Root Cause

Patch искал полное текстовое представление функции `uploadEmailAttachment`.
Семантически правильная функция имела другое форматирование, поэтому exact-text anchor не совпал.

## Изменение

- добавлена `fetchEmailAttachments`;
- вставка выполнена по границам экспортируемых функций;
- подтверждено отсутствие POST, PUT, PATCH и DELETE;
- добавлен постоянный prevention control.

## Failure classes

- `AS6_SOURCE_PATCH_EXACT_TEXT_ANCHOR_GAP`
- `AS6_FORMAT_DEPENDENT_FUNCTION_INSERTION`
- `AS6_DOCUMENT_READ_API_PATCH_BLOCKED`
- `AS6_SOURCE_PATCH_SEMANTIC_BOUNDARY_GAP`
- `AS6_READ_ONLY_FUNCTION_DUPLICATION_RISK`

## Prevention control runtime repair

После создания read-only API closure остановился при запуске prevention control.

### Root Cause

В сгенерированном control-файле выражение удаления последней строки sed было записано как `sed "$d"`.
Bash интерпретировал `$d` как переменную, а `set -u` завершил выполнение с `unbound variable`.

### Изменение

- небезопасное выражение удалено;
- граница функции теперь обрабатывается через `head -n -1`;
- добавлена проверка единственного определения функции;
- добавлена runtime-проверка самого prevention control;
- подтверждено отсутствие mutating HTTP methods.

### Additional failure classes

- `AS6_CONTROL_GENERATION_DOLLAR_EXPANSION`
- `AS6_SED_LAST_LINE_EXPRESSION_QUOTING_GAP`
- `AS6_PREVENTION_CONTROL_RUNTIME_SYNTAX_GAP`
- `AS6_COMPLETED_CHANGE_COMMIT_BLOCKED_BY_CONTROL`
- `AS6_CONTROL_SELF_VALIDATION_GAP`
