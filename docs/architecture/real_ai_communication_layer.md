# Real AI Communication Layer v1

## Цель

Real AI Communication Layer v1 переводит AS6 AI CRM от рекомендаций к управляемой AI-assisted коммуникации:

Landing/Telegram lead → AI qualification → AI outreach draft → manager approval → Telegram/email send → reply save → CRM timeline update → next follow-up.

## Главный принцип безопасности

AI не отправляет сообщения самостоятельно. Любой AI-сгенерированный текст сначала попадает в approval queue, где менеджер может:

- проверить и изменить текст;
- одобрить;
- отправить;
- отклонить.

Прямая отправка доступна только для уже одобренных элементов очереди. Если действие не в статусе `approved`, backend возвращает ошибку на русском: сначала нужно одобрить AI действие.

## Исполняемые action types

Approval queue поддерживает исполняемые коммуникационные действия:

- `telegram_draft` — черновик Telegram-сообщения;
- `email_draft` — черновик email;
- `followup_24h` — follow-up через 24 часа;
- `followup_3d` — follow-up через 3 дня;
- `demo_offer` — предложение demo;
- `meeting_request` — запрос встречи;
- `move_lead_stage` — AI-предложение смены этапа, тоже только через approval.

Для совместимости старые типы `telegram_followup`, `email_followup`, `send_demo_link`, `send_presentation`, `create_reminder` сохраняются.

## Данные и аудит

### Lead

`crm_leads.last_message_at` обновляется при исходящей отправке Telegram/email и при входящем Telegram-сообщении. Это поле используется в CRM modal как «последний контакт».

### Telegram

При отправке одобренного Telegram draft:

1. проверяется `telegram_chat_id`;
2. сообщение отправляется через Telegram Bot API;
3. outbound сохраняется в `telegram_messages` с ролью `assistant`;
4. обновляется `last_message_at`;
5. создаётся timeline event `telegram_sent`.

Если chat id отсутствует, пользователь видит ошибку:

> У лида нет Telegram chat id. Можно отправить email или написать вручную.

### Email

При отправке одобренного email draft:

1. проверяется email лида или `payload.to`;
2. создаётся `email_messages`;
3. выполняется SMTP/Gmail delivery;
4. пишется `email_logs`;
5. обновляется `last_message_at`;
6. создаётся timeline event `email_sent`.

Если email отсутствует, пользователь видит ошибку:

> У лида нет email для отправки.

### Timeline events

Коммуникационный слой пишет события:

- `ai_draft_created` — AI создал черновик;
- `ai_draft_approved` — менеджер одобрил черновик;
- `telegram_sent` — Telegram отправлен;
- `email_sent` — email отправлен;
- `send_failed` — отправка не выполнена;
- `lead_replied` — лид ответил;
- `ai_stage_suggested` — AI предложил смену этапа.

## Reply tracking

Когда приходит входящее Telegram-сообщение:

1. Telegram update привязывается к существующему лиду по `telegram_id`, `telegram_chat_id` или username либо создаёт нового лида.
2. Входящее сообщение сохраняется в `telegram_messages` с ролью `user`.
3. `last_message_at` и `last_seen_at` обновляются.
4. Pending follow-up jobs в окне ближайших касаний получают статус `replied`.
5. Создаётся новый `telegram_draft` с рекомендованным ответом на входящее сообщение.
6. При признаках прогресса сделки создаётся `move_lead_stage` suggestion (`new → qualified`, `qualified → proposal`, `proposal → booked`).

AI reply не отправляется автоматически: менеджер должен открыть очередь, одобрить и нажать отправку.

## Duplicate prevention

Для AI outreach drafts действует защита от дублей: одинаковый lead + action type + message intent (`payload.outreachType`) не создаётся повторно в течение 24 часов, если уже есть активный/выполненный элемент очереди.

То же правило применяется для inbound Telegram reply draft и stage suggestion.

## CRM modal

Карточка лида показывает:

- AI drafted messages;
- approve/send buttons с loading по конкретному action id;
- коммуникационную историю Telegram/email;
- last contact time;
- next recommended action;
- timeline memory с событиями отправки, approval, ошибок и ответов.

После approve/send/refetch UI обновляет CRM, action center, email/Telegram history и dashboard metadata.

## Dashboard metrics

Dashboard показывает Real AI Communication Layer metrics:

- AI messages drafted today;
- AI messages sent today;
- replies received today;
- pending approvals.

Метрики строятся из `ai_worker_queue`, `telegram_messages`, `email_messages` и CRM stats.

## Verification checklist

1. Создать landing lead.
2. Дождаться AI qualification.
3. Проверить появление `telegram_draft`/`email_draft` в карточке лида.
4. Одобрить draft.
5. Отправить email — проверить `email_messages`, `email_logs`, `last_message_at`, timeline `email_sent`.
6. Для лида с `telegram_chat_id` отправить approved Telegram draft — проверить `telegram_messages`, `last_message_at`, timeline `telegram_sent`.
7. Отправить inbound Telegram reply — проверить привязку к лиду, `lead_replied`, статус pending follow-up `replied`, новый AI draft и возможный stage suggestion в approval queue.
