# AI Worker System и AI Command Center

AS6 AI CRM расширяется до AI Sales Workforce Platform: каждый AI сотрудник становится видимым объектом с режимом исполнения, статусом, историей запусков, очередью рекомендаций и метриками эффективности.

## 1. Архитектура работников

В v1 платформа создаёт шесть базовых типов AI сотрудников для каждого workspace:

| Тип | Назначение v1 |
| --- | --- |
| `ai_sdr_agent` | Анализ новых лидов, приоритизация, предложение первого следующего шага. |
| `ai_followup_worker` | Поиск неактивных лидов и генерация follow-up рекомендаций. |
| `ai_revenue_analyst` | Сводка открытого pipeline, риски выручки, узкие места воронки. |
| `ai_crm_assistant` | CRM next-best-action, подсказки по этапам, заметкам и напоминаниям. |
| `ai_email_assistant` | Email-черновики и темы писем для ручного одобрения. |
| `ai_telegram_assistant` | Telegram-сценарии и короткие сообщения для ручного одобрения. |

Каждый worker хранится в `ai_workers`:

- `id`
- `workspace_id`
- `name`
- `type`
- `status`: `active`, `paused`, `error`
- `mode`: `suggestion_only`, `approval_required`, `autonomous_ready`
- `description`
- `last_run_at`
- `created_at`

Все backend endpoints обязательно проходят через `requireAuth` и `requireWorkspace`, а SQL-запросы фильтруют данные по `workspace_id`.

## 2. Модель очереди

Очередь разделена на две сущности:

1. `ai_worker_runs` — факт запуска AI сотрудника.
2. `ai_worker_queue` — действия и рекомендации, которые появились после запуска.

`ai_worker_runs` хранит:

- `worker_id`
- `workspace_id`
- `lead_id`, nullable
- `input_context`
- `output_summary`
- `status`
- `credits_spent`
- `created_at`

`ai_worker_queue` хранит pending recommendations:

- worker/run/workspace context;
- nullable `lead_id` для revenue-level задач;
- `action_type`;
- `status`, в v1 основной безопасный статус — `pending_approval`;
- `title`, `recommendation`, `payload`.

В v1 очередь не отправляет email/Telegram автоматически. Она создаёт прозрачный список действий на одобрение, чтобы менеджер видел, почему AI предлагает действие и по какому лиду.

## 3. Execution modes

### `suggestion_only`

AI сотрудник создаёт summary и рекомендации только для просмотра. Подходит для аналитики, forecast, revenue review и обучения команды.

### `approval_required`

AI сотрудник создаёт элементы очереди со статусом `pending_approval`. Человек должен принять решение перед любым внешним действием. Это режим по умолчанию для коммуникационных работников.

### `autonomous_ready`

Флаг будущей готовности к автономности. В текущей реализации режим видим в UI и API, но внешние действия всё равно не отправляются автоматически.

## 4. Backend API

Новые защищённые endpoints:

- `GET /api/ai/workers` — список AI сотрудников workspace с автосозданием базовых ролей.
- `POST /api/ai/workers` — создание worker в workspace.
- `PATCH /api/ai/workers/:id` — изменение статуса, режима, имени, описания.
- `GET /api/ai/workers/:id/runs` — история запусков выбранного worker.
- `GET /api/ai/command-center` — сводка workers, queue, recent runs и метрик.
- `POST /api/ai/workers/:id/run` — детерминированный v1 запуск worker по CRM данным workspace.

## 5. AI logic v1

v1 использует безопасную deterministic-логику поверх существующих CRM данных:

- AI SDR Agent берёт новые лиды и создаёт рекомендации квалификации.
- AI Follow-up Worker берёт неактивные открытые лиды и создаёт follow-up рекомендации.
- AI Revenue Analyst суммирует открытый pipeline и риски пауз.
- AI CRM Assistant создаёт next actions для открытых лидов.
- AI Email Assistant создаёт email draft recommendations для лидов с email.
- AI Telegram Assistant создаёт Telegram draft recommendations для лидов с Telegram.

OpenAI-powered analysis может быть добавлен в runner без изменения контрактов таблиц: `input_context` и `output_summary` уже JSONB, а очередь поддерживает payload для канала, текста, score и reasoning.

## 6. AI Command Center UI

Страница `/ai-workers` показывает:

- worker cards;
- статус и режим каждого worker;
- last run;
- действия `Запустить`, `Пауза`, `Настройки`;
- queue status;
- pending actions;
- failed actions;
- recent AI runs;
- AI efficiency;
- revenue impact placeholder.

Dashboard дополнительно показывает:

- активных AI сотрудников;
- очередь AI задач;
- действия на одобрение;
- AI эффективность;
- потенциальную выручку под контролем AI.

## 7. Future autonomous mode

Для включения настоящего autonomous mode нужны дополнительные guardrails:

1. Workspace-level policy: какие worker types могут действовать автономно.
2. Channel policy: email/Telegram/CRM отдельно.
3. Budget policy: лимиты кредитов и лимиты действий в час/день.
4. Human override: быстрый stop/pause all workers.
5. Audit trail: immutable журнал prompts, inputs, outputs, approvals, отправок и ошибок.
6. Rollback/compensation: безопасное восстановление CRM этапов и отмена queued actions.

До внедрения этих guardrails `autonomous_ready` остаётся режимом подготовки, а не автоотправки.

## 8. Scaling до 10/50/100 AI workers

### 10 workers

Достаточно текущей модели: workers запускаются on-demand, очередь хранится в PostgreSQL, Command Center агрегирует метрики по workspace.

### 50 workers

Рекомендуется добавить:

- background worker process;
- lease/lock для `ai_worker_queue`;
- rate limits на workspace;
- отдельные индексы по `workspace_id`, `status`, `created_at`, `worker_id`;
- batch runner для однотипных CRM анализов.

### 100 workers

Рекомендуется выделить execution layer:

- отдельный queue broker (например, Redis/BullMQ или managed queue);
- worker shards по workspace или worker type;
- idempotency keys для runs/actions;
- materialized metrics для Command Center;
- event streaming для live monitoring;
- cold storage для старых run payloads.

Такой путь сохраняет текущий API и UI, но переносит выполнение из синхронного request-response в масштабируемую асинхронную систему.
