# AS6 AI Agent System

## Цель

AS6 расширен до AI-native CRM: AI Sales Agent работает с реальным контекстом лида, историей Telegram, заметками, email-активностью и CRM-событиями. Система не отправляет сообщения автономно: она подготавливает рекомендации, черновики и follow-up actions, которые остаются в очереди для менеджера.

## Архитектура

### Данные PostgreSQL

Новая инфраструктура хранится в четырех основных таблицах:

- `ai_agents` — экземпляры AI-агентов внутри workspace.
- `ai_agent_actions` — очередь и история AI-действий по лидам.
- `ai_agent_runs` — попытки исполнения action, execution logs, ошибки и timestamps.
- `ai_followups` — подготовленные follow-up suggestions и drafts без автоотправки.

У всех operational-сущностей есть `id`, `workspace_id`, `lead_id` (где применимо), `task_type`, `status`, `priority`, `input_context`, `output_result`, `created_at`, `updated_at`. Статусы очереди: `queued`, `running`, `completed`, `failed`.

### Backend слои

- `aiSalesAgentService` вызывает OpenAI Responses API и требует `OPENAI_API_KEY` для AI agent actions. Локальные заглушки не используются для AI recommendations.
- `aiAgentModel` собирает lead context из CRM, notes, Telegram messages, email history и activity, списывает AI credits, создает queued action, запускает run и сохраняет output.
- `aiAgentController` публикует API:
  - `GET /api/ai/agents/actions`
  - `POST /api/ai/agents/actions`
  - `GET /api/ai/agents/runs`
  - `GET /api/ai/agents/metrics`
  - `POST /api/ai/agents/followups/queue-inactive`

## AI Sales Agent capabilities

Поддерживаемые `task_type`:

- `analyze_lead` — рекомендации, next best action, urgency score, conversion probability, follow-up recommendation.
- `generate_follow_up` — персональный follow-up draft и queued follow-up action.
- `generate_commercial_offer` — черновик коммерческого предложения.
- `generate_telegram_response` — черновик ответа в Telegram.
- `generate_email_response` — черновик email ответа.

Все действия:

1. Проверяют workspace и lead ownership.
2. Собирают реальный CRM context.
3. Списывают AI credits из `workspaces.credits_pool`.
4. Пишут debit в `credits_ledger`.
5. Сохраняют action history и run logs.
6. Возвращают результат в UI через lead card/modal и timeline.

## Lifecycle AI agent action

1. Менеджер нажимает действие в AI Action Center или запускается inactive follow-up queue.
2. Backend создает `ai_agent_actions.status = queued`.
3. Worker foundation переводит action в `running` и создает `ai_agent_runs`.
4. `aiSalesAgentService` вызывает OpenAI с JSON-only инструкцией и реальным context payload.
5. Успешный output сохраняется в `ai_agent_actions.output_result` и `ai_agent_runs.output_result`.
6. CRM timeline получает событие `ai_agent_action_completed`.
7. Для `generate_follow_up` создается запись `ai_followups.status = queued`; сообщение не отправляется автоматически.
8. При ошибке action получает retry metadata: `retry_count`, `max_retries`, `next_retry_at`, `error`.

## Queue foundation

Текущая версия использует in-process worker через `setImmediate` как foundation:

- queued tasks хранятся в PostgreSQL;
- running tasks фиксируются через `ai_agent_runs`;
- failed tasks сохраняют ошибку и retry state;
- retry support подготовлен через `retry_count`, `max_retries`, `next_retry_at`;
- execution logs пишутся в `ai_agent_runs.execution_log`.

Следующий production шаг — вынести dequeue loop в отдельный worker process или BullMQ/Redis, используя те же таблицы как source of truth.

## UI flows

### Lead card/modal

CRM UI показывает:

- AI recommendations;
- next best action;
- urgency score;
- conversion probability;
- follow-up recommendation;
- AI timeline indicators;
- AI badges and glow cards.

Все тексты интерфейса вокруг CRM/AI отображаются на русском или в SaaS-action labels, понятных sales team.

### AI Action Center

В карточке лида доступны:

- Analyze lead;
- Generate follow-up;
- Generate commercial offer;
- Generate Telegram response;
- Generate email response.

На CRM странице есть автономная кнопка постановки follow-up для неактивных лидов за 24 часа. Она только создает queue/draft, без отправки.

## Metrics

Dashboard и CRM stats расширены AI SaaS метриками:

- AI actions today;
- AI-generated follow-ups;
- AI efficiency;
- conversion rate;
- AI-assisted deals.

## Safety

Система сохраняет существующие boundaries:

- JWT auth и workspace scoping обязательны на всех AI endpoints.
- Existing CRM, Telegram bot and email queue remain separate.
- AI agent drafts do not send email/Telegram automatically.
- Recommendations require OpenAI API key and real lead context; no fake recommendation fallback.

## Future scaling

- Dedicated worker service with `SELECT ... FOR UPDATE SKIP LOCKED` dequeue.
- Redis/BullMQ for delayed retries while PostgreSQL remains audit source.
- Per-workspace agent configuration and model routing.
- Human approval workflow before sending generated drafts.
- Evaluation logs for conversion uplift and A/B prompts.
