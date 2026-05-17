# AI Telegram Reply Composer

## Назначение

AI Telegram Reply Composer создаёт готовый к отправке черновик ответа в Telegram после входящего сообщения лида. Менеджер видит входящее сообщение, AI draft response, может отредактировать текст, одобрить и отправить его вручную через Approval Center.

## Trigger flow

1. Telegram webhook получает входящее текстовое сообщение.
2. Сообщение сохраняется в `telegram_messages` как inbound и привязывается к лиду по `telegram_chat_id`.
3. Создаётся timeline event `telegram_reply_received`.
4. Создаётся очередь анализа `telegram_reply_analysis` со статусом `pending_approval`.
5. Создаётся очередь черновика `telegram_reply_draft` со статусом `pending_approval`.
6. Создаётся timeline event `telegram_reply_analysis_created` для анализа и `ai_telegram_reply_drafted` для черновика.

## Draft generation context

Черновик строится из структурированного контекста:

- последнее входящее Telegram-сообщение;
- имя лида и компания;
- текущий этап CRM;
- последний AI score и прогнозные поля из `lead_ai_scores`;
- `recommended_next_step` из последнего AI score или fallback-рекомендация;
- последние timeline-события лида.

Требования к тону:

- русский язык;
- человеческий и короткий ответ;
- без спама и давления;
- 2–5 строк;
- один понятный CTA.

Если `OPENAI_API_KEY` настроен, composer использует OpenAI Responses API. Если ключ отсутствует или API временно недоступен, система создаёт безопасный deterministic draft, чтобы inbound pipeline не падал.

## Approval Center

Для `telegram_reply_draft` Approval Center показывает отдельную review card, а не только raw payload:

- имя лида;
- последнее входящее Telegram-сообщение (`payload.inboundText`, fallback `payload.inboundMessage` / `payload.customerMessage`);
- полный AI draft response (`payload.draftText`, fallback `payload.text` / `payload.message`);
- текущий статус queue item и время создания;
- channel badge `Telegram`;
- текущий CRM stage лида (`payload.leadStage` / `payload.currentStage` / `lead.status`);
- risk / forecast badge, если в payload есть `riskLevel`, `forecastCategory` или `lastAiScore`;
- badge `Изменено менеджером`, если сохранён edited draft.

Текст черновика отображается в читаемой dark card, сохраняет переносы строк (`white-space: pre-wrap`) и ограничен max-height со scroll для длинных ответов.

Редактирование открывает textarea прямо в карточке. Сохранение записывает подтверждённый текст в `payload.editedText` / `payload.edited_text` и синхронно обновляет `payload.text` / `payload.message`; оригинальный AI вариант остаётся в `payload.draftText`. При отправке backend выбирает edited text первым, поэтому в Telegram уходит именно версия менеджера.

## Sending flow

После approval менеджер нажимает send/execute:

1. Queue item переводится в `executing`.
2. Сообщение отправляется через Telegram Bot API по `telegram_chat_id` лида.
3. Outbound-сообщение сохраняется в `telegram_messages` с `direction = outbound`.
4. Создаётся timeline event `telegram_message_sent`.
5. Queue item переводится в `completed`.

Порядок выбора текста при выполнении:

1. `payload.editedText`;
2. `payload.edited_text`;
3. `payload.draftText`;
4. `payload.text` / `payload.message`;
5. `recommendation` / `title` как последний fallback.

Если у лида нет `telegram_chat_id`, выполнение завершается graceful error:

> Telegram не подключён для этого лида.

Если Telegram Bot API возвращает ошибку, item остаётся в `failed` с понятным `error_message`. Failed item можно повторно одобрить после исправления проблемы и отправить снова; кнопки Approval Center имеют независимые loading states и всегда refetch queue после approve / edit / send / reject.

## CRM lead modal and timeline

В CRM карточке лида Telegram tab показывает историю диалога и approval previews:

- inbound Telegram messages из `telegram_messages`;
- AI reply draft из `ai_worker_queue` (`telegram_reply_draft`);
- sent outbound reply из `telegram_messages`;
- timestamps для входящих, черновиков и исходящих сообщений.

Timeline отображает ключевые события reply composer:

- `ai_telegram_reply_drafted`;
- `ai_action_approved`;
- `telegram_message_sent`.

## Duplicate prevention

Для каждого входящего сообщения создаётся не более одного `telegram_reply_draft`: перед вставкой проверяется `ai_worker_queue` по `workspace_id`, `lead_id`, `action_type = 'telegram_reply_draft'` и `payload.telegramMessageId`.

## Deployment

```bash
cd /var/www/ai-platform
git pull
docker compose up -d --build
```
