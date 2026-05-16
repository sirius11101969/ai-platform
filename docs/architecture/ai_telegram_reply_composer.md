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

Для `telegram_reply_draft` Approval Center показывает:

- `Inbound message` — последнее сообщение клиента;
- `AI draft response` — готовый текст ответа;
- кнопки approve / edit / send через существующий поток approval.

Редактирование draft меняет `payload.text` и `payload.message`, чтобы при отправке ушёл именно подтверждённый менеджером текст.

## Sending flow

После approval менеджер нажимает send/execute:

1. Queue item переводится в `executing`.
2. Сообщение отправляется через Telegram Bot API по `telegram_chat_id` лида.
3. Outbound-сообщение сохраняется в `telegram_messages` с `direction = outbound`.
4. Создаётся timeline event `telegram_message_sent`.
5. Queue item переводится в `completed`.

Если у лида нет `telegram_chat_id`, выполнение завершается graceful error:

> Telegram не подключён для этого лида.

## Duplicate prevention

Для каждого входящего сообщения создаётся не более одного `telegram_reply_draft`: перед вставкой проверяется `ai_worker_queue` по `workspace_id`, `lead_id`, `action_type = 'telegram_reply_draft'` и `payload.telegramMessageId`.

## Deployment

```bash
cd /var/www/ai-platform
git pull
docker compose up -d --build
```
