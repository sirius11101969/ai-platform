# Telegram Real Lead Capture and Execution v1

## Telegram lead capture

Telegram updates enter the backend through `POST /api/telegram/webhook/:secret`. The webhook validates `TELEGRAM_WEBHOOK_SECRET`, extracts only supported user text/caption messages, and then upserts the CRM lead in a database transaction.

For every real Telegram user message the platform:

- resolves a safe CRM owner and workspace;
- creates or updates a `crm_leads` row with `source = telegram` and the initial CRM stage/status `new` (`Новый` in the UI);
- stores Telegram identity fields: `telegram_id`, `telegram_chat_id`, `telegram_username`, `telegram_first_name`, `telegram_last_name`, plus legacy `first_name` / `last_name` compatibility fields;
- writes the inbound message to `telegram_messages` with `workspace_id`, `lead_id`, `telegram_chat_id`, `role = user`, `message`, and `created_at`;
- writes CRM activity so the lead timeline and manager views have the same context.

Existing leads are not recreated when Telegram sends more messages. Matching uses the Telegram user id, chat id, stored metadata fallback, and username fallback.

## Chat ID storage

`telegram_chat_id` is the execution key for real Telegram delivery. It is stored directly on `crm_leads` and copied to every `telegram_messages` row. Legacy installs that stored `metadata.telegramChatId` are backfilled during schema migration, so existing Telegram leads keep working.

The UI distinguishes between a Telegram handle and a real chat id. A lead may have `telegram` / `telegram_username` but still be non-actionable if the bot has never received a real message from that chat. In that case CRM displays:

> У лида нет Telegram chat id. Отправка в Telegram недоступна.

## CRM reply flow

The lead detail modal shows a Telegram badge, username, chat-id status, and conversation history. For leads with a chat id, the “Ответить в Telegram” form sends the text through Telegram Bot API `sendMessage`.

After a successful send the backend saves:

- an outbound `telegram_messages` row with `role = assistant` and `telegram_chat_id`;
- `crm_activity` with type `telegram_crm_reply_sent`;
- updated lead timestamps, including `last_message_at`.

The lead timeline includes Telegram messages through the timeline union, so inbound/outbound CRM replies and AI replies remain part of the lead memory.

## Approval queue Telegram execution

AI approval queue actions are still human-gated. Nothing in the approval queue is auto-sent. A user must approve and then click “Выполнить”.

The execution path supports:

- `telegram_draft` (normalized to `telegram_followup`);
- `telegram_followup`;
- `send_demo_link`.

When executed, the backend checks the lead and sends through Telegram only when a real `telegram_chat_id` exists. Successful sends are saved as outbound Telegram messages and audited as completed AI actions. If the chat id is missing, execution is marked `failed` and stores the clear Russian error:

> У лида нет Telegram chat id. Отправка в Telegram недоступна.

`send_demo_link` prefers Telegram when the lead has a real chat id, otherwise it can fall back to the selected channel such as email or a CRM note.

## AI Telegram generation and memory

Direct Telegram bot replies continue to work independently from the approval queue. Inbound messages are saved before AI generation. The generator receives the latest Telegram conversation memory and returns a natural Russian Telegram response for questions such as “что ты умеешь”, “покажи пример”, and “отправь материалы”. The reply is sent directly by the bot, saved as an outbound Telegram message, and recorded in CRM activity/follow-up context.

Material/email workflows are handled before free-form AI generation. They still save the user request, action result, and AI reply context against the same lead.

## Workspace safety

Telegram capture never creates orphan leads. The bot resolves a CRM user from `TELEGRAM_CRM_USER_EMAIL` / `CRM_DEFAULT_USER_EMAIL` when configured, otherwise uses the oldest user. Workspace assignment uses the existing workspace model fallback: an owner workspace is selected when present, and a default owner workspace is created only if the user has no workspace. This keeps every Telegram lead tied to both `user_id` and `workspace_id`.

## Dashboard widget

CRM stats now include a small Telegram summary for the dashboard:

- `Telegram лиды` — total Telegram leads in the active workspace;
- recent Telegram messages for the last 24 hours;
- AI Telegram actions sent today.

These metrics are read from `crm_leads`, `telegram_messages`, and completed approval queue executions.

## Safety model

- Telegram direct bot replies may send immediately because the user initiated the Telegram conversation.
- Approval queue actions never auto-send; they require explicit user approval and execution.
- Missing `telegram_chat_id` blocks Telegram execution with a clear error.
- Existing auth, workspaces, CRM ownership checks, email execution, and AI workers remain in their current guarded routes and workspace scope.
