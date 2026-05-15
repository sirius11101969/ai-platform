# AI Execution Center

## Purpose

AI Execution Center converts AI recommendations into controlled, auditable sales actions. The system never auto-sends generated content: every action starts as a draft or pending approval item, a user reviews it, approves it, and then explicitly sends it.

## Action lifecycle

`ai_action_queue` stores executable AI actions per workspace and lead. Supported statuses:

1. `draft` — generated but not ready for approval.
2. `pending_approval` — waiting for a human decision.
3. `approved` — approved by a user and ready to send.
4. `sent` — successfully executed through Telegram, SMTP/email, or CRM update.
5. `failed` — attempted execution failed; the real error is shown to the user.
6. `cancelled` — user rejected the action.

Supported action types include Telegram follow-up, email follow-up, commercial offer, presentation, screenshots, demo link, lead stage movement, and reminder creation.

## Approve / Send system

The lead modal contains the AI Execution Center. Users can preview generated text and use Russian-only controls:

- `Одобрить`
- `Отправить`
- `Изменить`
- `Отклонить`

The safety rule is strict: AI copy must not claim that something was sent unless the queue status is `sent`. Failed sends are stored as `failed` with the actual error.

## Timeline memory

`lead_timeline_events` is the durable timeline table. The timeline view also merges existing CRM activity, Telegram messages, email delivery state, AI score updates, follow-up drafts, sent follow-ups, stage changes, notes, and attachment delivery records.

Every timeline event includes:

- `workspace_id`
- `lead_id`
- `user_id` when relevant
- event type, source, body, metadata, timestamp

This gives the AI and CRM UI real memory of what happened, not just recommendations.

## Attachment flow

`lead_attachments` records material delivery attempts and successful sends. Production files are manually uploaded to `backend/assets/materials/` and are never committed to Git.

Expected production file names:

- `presentation.pdf`
- `demo.mp4`
- `screenshot-1.png`
- `screenshot-2.png`

Endpoints:

- `GET /api/materials` lists expected files and whether each one exists on the server.
- `POST /api/leads/:id/attachments/send` sends selected materials to Telegram or email.

Telegram uses Bot API file methods: PDFs through `sendDocument`, screenshots through `sendPhoto`, and video through `sendVideo`. Email uses SMTP/Gmail delivery with selected files attached when available. Missing files return `Материал пока не загружен на сервер`.

## Multi-tenant safety

All new tables include `workspace_id` and `lead_id`, plus `user_id` where relevant. API queries validate the authenticated user and active workspace before returning or mutating data.

## Future autonomous mode

A future mode can allow policy-based auto-send for low-risk actions, but only after explicit workspace configuration. The current implementation intentionally requires human approval and a separate send action.
