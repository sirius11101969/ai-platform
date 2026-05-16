# Центр одобрения AI Queue Approval Center

## Назначение

AI Queue Approval Center переводит рекомендации AI сотрудников AS6 AI CRM Platform в контролируемые действия: менеджер видит рекомендацию, при необходимости редактирует, одобряет, затем вручную нажимает «Выполнить» или «Отправить». Автоотправка в текущем режиме запрещена.

## Хранилище и жизненный цикл

Основная очередь использует таблицу `ai_worker_queue`. Каждый элемент хранит `workspace_id`, `lead_id`, `worker_id`, `action_type`, `title`, `recommendation`, `payload`, `status`, `approved_by`, `approved_at`, `executed_at`, `error_message`, `created_at`, `updated_at`.

Статусы жизненного цикла:

1. `pending_approval` — AI сотрудник создал рекомендацию, действие ещё не разрешено.
2. `approved` — пользователь workspace одобрил действие.
3. `rejected` — пользователь отклонил рекомендацию.
4. `executing` — backend начал выполнение после ручного нажатия.
5. `completed` — действие успешно выполнено, сохранены timeline и activity события.
6. `failed` — выполнение завершилось ошибкой, ошибка сохранена в `error_message`, событие добавлено в timeline.
7. `cancelled` — резервный статус для будущей отмены выполнения.

## API и изоляция workspace

Защищённые endpoints:

- `GET /api/ai/approval-queue`
- `POST /api/ai/approval-queue/:id/approve`
- `POST /api/ai/approval-queue/:id/reject`
- `PATCH /api/ai/approval-queue/:id`
- `POST /api/ai/approval-queue/:id/execute`

Все endpoints требуют JWT, активный workspace и membership пользователя. Запросы фильтруются по `workspace_id`; доступ к чужой очереди невозможен. Ошибки возвращаются на русском языке, чтобы UI мог показывать понятное состояние менеджеру.

## Правила выполнения

Поддерживаемые первые типы выполнения:

- `telegram_followup` — отправка через существующий Telegram Bot API.
- `email_followup` — отправка через существующий SMTP/Gmail email subsystem.
- `send_demo_link` — отправка или запись ссылки `https://www.as6.ru`.
- `send_presentation` — отправка материалов из backend `assets/materials`, если файл доступен.
- `create_reminder` — создание CRM заметки/напоминания и timeline события.
- `move_lead_stage` — обновление этапа CRM лида.

Выполнение доступно только из статуса `approved`. Если пользователь нажал «Выполнить» без одобрения, API возвращает русскую ошибку и ничего не отправляет.

## Safety model

- AI никогда не отправляет сообщения автоматически.
- Генерация рекомендации и выполнение разделены двумя явными человеческими действиями: «Одобрить» и «Выполнить».
- Перед выполнением пользователь может редактировать `title`, `recommendation`, `payload`, `actionType`.
- Успешное выполнение фиксируется в `lead_timeline_events` и `crm_activity`.
- Ошибка выполнения переводит элемент в `failed`, сохраняет `error_message`, добавляет audit/timeline событие и остаётся видимой в UI.

## Telegram и email execution

Telegram follow-up использует существующий `sendTelegramMessageToLead`, который проверяет наличие Telegram chat id у лида и сохраняет исходящее сообщение в CRM истории.

Email follow-up использует `sendEmailNow`, который создаёт email запись, отправляет через SMTP/Gmail и сохраняет статус отправки. Если SMTP не настроен или у лида нет email, очередь получает `failed` и понятное сообщение об ошибке.

Отправка презентации использует material delivery слой. Для Telegram отправляются файлы из `assets/materials`; для email файлы регистрируются как вложения и отправляются через email subsystem.

## UI

Страница `/ai-workers` содержит раздел «Центр одобрения AI» с карточками/таблицей: название действия, лид, AI сотрудник, канал, preview рекомендации, статус и время создания. Доступны действия «Одобрить», «Изменить», «Отклонить», «Выполнить».

В модальном окне лида показываются pending/approved/failed AI действия по этому лиду; оттуда можно одобрить и выполнить действие. Выполненные и ошибочные AI события отображаются в timeline лида.

Dashboard показывает widget метрик: ожидают одобрения, одобрено сегодня, выполнено сегодня, ошибок сегодня и success rate.

## Future autonomous mode

Будущий автономный режим должен быть отдельным workspace-level feature flag с granular permissions. Даже в автономном режиме рекомендуем сохранить guardrails: лимиты по каналу, allowlist типов действий, denylist фраз, дневные лимиты отправки, audit trail, dry-run режим и быстрый kill switch. До включения такого режима текущая архитектура остаётся human-in-the-loop.
