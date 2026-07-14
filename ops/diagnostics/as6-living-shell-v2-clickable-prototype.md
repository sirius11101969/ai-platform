# AS6 Living Shell v2 Clickable Prototype

## Диагностика

`/app` использовал временную оболочку Living Product v1 с технической навигацией
по идентификаторам пространств.

## Root Cause

- продуктовый v2-контракт существовал только в документации;
- отсутствовал единый кликабельный Living Shell;
- состояния не отражались в URL;
- отсутствовали Universal Command и AI Conductor prototype;
- пользователь не мог пройти будущий продуктовый сценарий.

## Изменение

- создан единый Living Shell v2;
- добавлены Home, AI Conductor, Relations, Projects, Documents, Knowledge,
  Living Blog и Settings;
- добавлены URL-состояния `/app/*`;
- добавлен Universal Command `Ctrl + K`;
- добавлена keyboard-навигация и `Escape`;
- добавлена mobile-композиция;
- добавлен `prefers-reduced-motion`;
- реальные мутации данных намеренно отключены.

## Failure classes

- `AS6_LIVING_SHELL_V2_IMPLEMENTATION_GAP`
- `AS6_PRODUCT_STATE_URL_OWNERSHIP_GAP`
- `AS6_TECHNICAL_SPACE_ID_NAVIGATION_PRESENT`
- `AS6_UNIVERSAL_COMMAND_IMPLEMENTATION_GAP`
- `AS6_AI_CONDUCTOR_PROTOTYPE_GAP`
- `AS6_LIVING_HOME_PROTOTYPE_GAP`
- `AS6_CLICKABLE_STATE_COVERAGE_GAP`
- `AS6_MOBILE_LIVING_SHELL_GAP`
- `AS6_KEYBOARD_COMMAND_ACCESS_GAP`
- `AS6_PROTOTYPE_MUTATION_SAFETY_GAP`
- `AS6_LEGACY_VISUAL_LANGUAGE_REGRESSION`
- `AS6_LIVING_SHELL_DEPLOYMENT_DRIFT`

## Safety

Prototype не выполняет реальные изменения CRM, проектов, документов или настроек.
AI Conductor показывает план, но production mutations не подключены.

## Iterative UTF-8 reconstruction

Один проход ISO-8859-1 reconstruction создал валидный UTF-8,
но не восстановил все обязательные русские маркеры.

Добавлена итеративная проверка глубины повреждения с выбором результата,
который восстанавливает максимальное количество канонических строк.

### Additional failure classes

- `AS6_UTF8_REPAIR_DEPTH_UNDETECTED`
- `AS6_UTF8_VALID_BUT_SEMANTICALLY_CORRUPTED`
- `AS6_LOCALIZATION_MARKER_MISMATCH`
- `AS6_UTF8_REPAIR_RESULT_SCORING_GAP`

## API upstream transient recovery closure

После deployment Living Shell v2 один запрос `/api/health` вернул `502`.
Повторная диагностика подтвердила:

- backend container работает без перезапусков;
- внутренний health endpoint возвращает `200`;
- Nginx напрямую достигает `backend:3001`;
- PostgreSQL и Redis исправны;
- public API health стабильно возвращает `200`;
- пересоздание backend не потребовалось.

### Root Cause

Кратковременное окно upstream readiness после пересоздания Nginx.

### Failure classes

- `AS6_API_UPSTREAM_502`
- `AS6_TRANSIENT_HEALTH_RETRY_GAP`
- `AS6_POST_DEPLOY_READINESS_WAIT_GAP`
- `AS6_CONTROL_ARTIFACT_QUOTING_FAILURE`
- `AS6_API_UPSTREAM_CONTROL_SYNTAX_GAP`

### Prevention

Добавлен постоянный контроль внутреннего backend health, прямого Nginx upstream и public health с ограниченным retry.
