# AS6 Living Space v2 Read-Only Data v1

## Диагностика

Living Shell v2 использовал демонстрационные CRM-записи, несмотря на наличие реального workspace-isolated API `GET /api/crm/leads`.

## Root Cause

- отсутствовал отдельный read-only data adapter;
- отсутствовали loading, empty и error-состояния;
- после замены `RelationsState` старый массив `relationRows` остался как недостижимый мёртвый код;
- source scan обнаружил демонстрационные записи до commit и deployment.

## Изменение

- создан read-only data adapter;
- подключён реальный список CRM leads активного workspace;
- используется существующий bearer-token и `X-Workspace-Id` контракт;
- добавлены loading, empty и error-состояния;
- удалены демонстрационные компании;
- удалён orphaned массив `relationRows`;
- запрещены POST, PATCH, PUT и DELETE в adapter;
- проекты и документы не подменяются вымышленными production-данными.

## Failure classes

- `AS6_LIVING_RELATIONS_DEMO_DATA_PRESENT`
- `AS6_READ_ONLY_DATA_ADAPTER_MISSING`
- `AS6_LOADING_STATE_GAP`
- `AS6_EMPTY_STATE_GAP`
- `AS6_READ_ERROR_STATE_GAP`
- `AS6_UNAVAILABLE_DOMAIN_FALSE_DATA_RISK`
- `AS6_LIVING_DATA_AUTH_CONTRACT_GAP`
- `AS6_LIVING_DATA_WORKSPACE_ISOLATION_GAP`
- `AS6_READ_ONLY_MUTATION_LEAK`
- `AS6_DEAD_DEMO_DATA_CONSTANT`
- `AS6_COMPONENT_REPLACEMENT_ORPHANED_SOURCE`
- `AS6_DEMO_DATA_SOURCE_SCAN_BLOCKED`
- `AS6_REAL_DATA_DEPLOYMENT_DRIFT`

## Prevention

Любая демонстрационная CRM-запись и любая mutating operation внутри Living read-only adapter блокируют build/deployment.
