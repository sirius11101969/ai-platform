# AS6 Living Projects, Documents and Knowledge Domain Discovery v1

## Диагностика

После подключения реальных CRM-отношений состояния Projects, Documents и
Knowledge оставались прототипами.

Discovery-цикл проверил:

- реальные таблицы PostgreSQL;
- количество строк в кандидатных таблицах;
- зарегистрированные backend-маршруты;
- frontend API-функции;
- workspace isolation;
- семантическое назначение найденных сущностей.

## Итоговая классификация

### Projects — `MISSING`

Канонической таблицы Projects и отдельного API проектов нет.

Таблицы:

- `ai_tasks`;
- `ai_workforce_tasks`;
- `task_execution_history`

описывают задачи исполнения AI и workforce. Они не являются пользовательскими
проектами и не должны отображаться как Projects.

Следующий шаг: создать каноническую workspace-isolated модель Projects.

### Documents — `REUSABLE_CANDIDATE`

Повторно можно использовать:

- `email_attachments`;
- `email_message_attachments`;
- `lead_attachments`;
- `GET /api/email/attachments`.

Это пригодный read-only источник первой версии Living Documents, но интерфейс
обязан честно называть сущности вложениями или материалами, пока не создана
полноценная модель документов.

### Knowledge — `REUSABLE_CANDIDATE`

Повторно можно использовать:

- organizational memory snapshot;
- organizational timeline;
- institutional learning;
- memory items;
- зарегистрированные read-only organizational-memory API.

Нужен безопасный адаптер, который преобразует внутренние AI-структуры в
понятные knowledge items и не раскрывает внутренние технические payload.

## Evidence

- database report: `runtime/as6-living-domain-discovery-20260715T055944Z/database-structure.txt`;
- code report: `runtime/as6-living-domain-discovery-20260715T055944Z/code-structure.txt`;
- runtime evidence не добавляется в Git.

## Root Cause остановки

Первичный classification использовал `grep | wc -l` при активном
`set -o pipefail`. Нулевое количество совпадений ошибочно завершило скрипт.

Также широкий поиск по слову `project` мог находить `projectedRevenue`,
что создавало риск ложной классификации.

## Failure classes

- `AS6_PROJECT_DOMAIN_CONTRACT_UNKNOWN`
- `AS6_DOCUMENT_DOMAIN_CONTRACT_UNKNOWN`
- `AS6_KNOWLEDGE_DOMAIN_CONTRACT_UNKNOWN`
- `AS6_DOMAIN_API_DISCOVERY_GAP`
- `AS6_FALSE_PRODUCTION_DATA_RISK`
- `AS6_PROJECT_WORKSPACE_ISOLATION_UNDEFINED`
- `AS6_DOCUMENT_WORKSPACE_ISOLATION_UNDEFINED`
- `AS6_KNOWLEDGE_WORKSPACE_ISOLATION_UNDEFINED`
- `AS6_DOMAIN_EMPTY_STATE_CONTRACT_GAP`
- `AS6_DOMAIN_MIGRATION_PLAN_GAP`
- `AS6_DISCOVERY_ZERO_MATCH_PIPEFAIL`
- `AS6_DOMAIN_CLASSIFICATION_BROAD_PATTERN`
- `AS6_PROJECTED_VALUE_FALSE_POSITIVE`
- `AS6_EXECUTION_TASKS_MISCLASSIFIED_AS_PROJECTS`
- `AS6_DISCOVERY_EVIDENCE_NOT_REGISTERED`

## План реализации

1. Подключить Living Documents к существующему read-only attachments API.
2. Подключить Living Knowledge через sanitizing read-only adapter.
3. Создать новую каноническую модель Projects:
   - workspace isolation;
   - owner;
   - title;
   - description;
   - status;
   - progress;
   - next action;
   - timestamps.
4. Только после миграции подключить Projects к Living Space.
