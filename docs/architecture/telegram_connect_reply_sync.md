# Telegram Connect + Real Reply Sync

## Цель

CRM может хранить `telegram_username` у лидов с лендинга, но Telegram Bot API не позволяет писать пользователю без `chat_id`. Deep-link связывает существующего CRM-лида с реальным Telegram-чатом: клиент открывает ссылку бота, нажимает **Start**, backend сохраняет `telegram_chat_id`, после чего менеджер и approved AI-drafts могут отправлять Telegram-сообщения.

## Environment

```env
TELEGRAM_BOT_TOKEN=<bot token from BotFather>
TELEGRAM_BOT_USERNAME=<bot username without or with @>
PUBLIC_BASE_URL=https://www.as6.ru
```

Старый защищённый webhook `/api/telegram/webhook/:secret` сохранён. Новый production endpoint для интеграции:

```text
POST /api/integrations/telegram/webhook
```

## Как установить webhook

```bash
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.as6.ru/api/integrations/telegram/webhook"}'
```

Проверка:

```bash
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo"
```

## Как работают deep links

Для лида, у которого есть `telegram_username`/`telegram`, но нет `telegram_chat_id`, API отдаёт поле:

```text
telegramConnectLink = https://t.me/{TELEGRAM_BOT_USERNAME}?start=lead_{leadId}
```

В карточке лида CRM показывает:

- статус **«Telegram не подключён»**;
- поле **«Ссылка подключения»**;
- кнопку копирования;
- кнопку открытия Telegram;
- объяснение клиентского действия: клиент должен открыть ссылку и нажать **Start**.

## Webhook `/start lead_<lead_id>`

Когда Telegram присылает `/start lead_<lead_id>`:

1. backend проверяет, что lead существует;
2. проверяет, что `message.chat.id` не привязан к другому активному лиду в workspace;
3. сохраняет в `crm_leads`:
   - `telegram_chat_id = message.chat.id`;
   - `telegram_id = message.from.id`, если ещё не заполнен;
   - `telegram_username = @username`, если Telegram его передал;
   - `metadata.telegramChatId`, `metadata.telegramUserId`, `metadata.telegramConnectedAt`;
4. пишет CRM/timeline событие `telegram_connected`;
5. отвечает клиенту: «Telegram подключён. Теперь менеджер сможет отправлять материалы и отвечать по вашей заявке.»

Если payload некорректный или lead не найден, бот отвечает безопасным fallback без раскрытия внутренних деталей. Если chat_id уже привязан к другому активному лиду, бот просит связаться с менеджером для переподключения.

## Inbound reply sync

Любое входящее Telegram-сообщение после подключения находится по `telegram_chat_id` даже если lead пришёл не из Telegram. Backend:

1. сохраняет запись в `telegram_messages`:
   - `role = user`;
   - `direction = inbound`;
   - `message/body = text`;
   - `telegram_chat_id`, `telegram_message_id`, `created_at`;
2. обновляет `crm_leads.last_message_at` и `last_seen_at`;
3. пишет timeline `telegram_reply_received`;
4. создаёт AI queue item `telegram_reply_analysis` со статусом `pending_approval` и русской рекомендацией следующего шага;
5. сохраняет существующий flow AI draft/stage suggestion, чтобы не ломать outreach и follow-up автоматизацию.

## Outbound sending

Если у лида есть `telegram_chat_id`, approved `telegram_draft` выполняется через Bot API, запись сохраняется в `telegram_messages` как outbound (`role = assistant`, `direction = outbound`), а в CRM/timeline пишется `telegram_message_sent`.

Если `telegram_chat_id` отсутствует, отправка остаётся заблокированной: менеджеру нужно отправить клиенту connect-link.

## Как тестировать вручную

1. Создать или найти лида с `telegram_username` и пустым `telegram_chat_id`.
2. Открыть карточку лида в CRM и проверить наличие connect-link.
3. Открыть ссылку в Telegram и нажать **Start**.
4. Проверить в БД:

```sql
SELECT id, telegram_username, telegram_chat_id, metadata->>'telegramConnectedAt'
FROM crm_leads
WHERE id = '<lead_id>';
```

5. Написать любое сообщение боту от клиента.
6. Проверить, что сообщение появилось в карточке лида и в таблице:

```sql
SELECT direction, role, message, telegram_chat_id, created_at
FROM telegram_messages
WHERE lead_id = '<lead_id>'
ORDER BY created_at DESC;
```

7. Проверить AI queue:

```sql
SELECT action_type, status, title, recommendation
FROM ai_worker_queue
WHERE lead_id = '<lead_id>'
ORDER BY created_at DESC;
```

8. Одобрить Telegram draft в CRM и нажать send/execute. Сообщение должно уйти в Telegram и появиться в истории как outbound.

## Production deploy

```bash
cd /var/www/ai-platform
git pull
docker compose up -d --build
```
