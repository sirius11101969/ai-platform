# AI Autonomous Follow-up Engine v1

## Purpose

The v1 engine is semi-autonomous: it scans CRM data for leads that need a follow-up, generates an AI draft, and stores the draft for human approval. It never sends automatically.

## Detection rules

The scan endpoint `POST /api/ai/followups/run-scan` evaluates active CRM leads in the current workspace only. Closed leads in `won` or `lost` are ignored.

Rules:

- `inactive_24h` — no CRM, Telegram, email, note, or timeline activity for at least 24 hours.
- `inactive_3d` — no activity for at least 3 days.
- `inactive_7d` — no activity for at least 7 days.
- `proposal_no_reply` — lead is in the `proposal` stage and has no recent reply/activity.
- `meeting_booked_no_next_step` — lead is in the `booked` stage and no next step is visible.
- `hot_lead_no_recent_contact` — latest AI score is hot (`score >= 70` or `temperature = hot`) and there is no recent contact.

Duplicate protection: the engine skips a lead/rule pair if an `ai_followup_jobs` record was created for the same workspace, lead, and rule in the last 24 hours with `suggested`, `approved`, or `sent` status.

## Data model

Tables:

- `ai_followup_rules` stores workspace-level rule configuration and future enable/disable controls.
- `ai_followup_jobs` stores each generated approval item.
- `ai_followup_attempts` stores send attempts and failures.

Core fields are present on the rule/job/attempt records where relevant: `workspace_id`, `lead_id`, `rule_type`, `status`, `suggested_channel`, `generated_message`, `scheduled_for`, `approved_at`, `sent_at`, `created_at`, and `updated_at`.

Statuses:

- `suggested` — AI draft exists and waits for a human.
- `approved` — human approved; can now be sent.
- `rejected` — human rejected; cannot be sent.
- `sent` — the approved item was delivered or recorded as CRM reminder.
- `failed` — a send attempt failed with an honest error message.

## AI generation

For every suggested job, the engine builds context from:

- CRM lead fields and stage.
- Telegram messages.
- Email history.
- CRM notes.
- Previous completed AI recommendations.

If `OPENAI_API_KEY` is configured, the backend calls the OpenAI Responses API and stores model metadata. If OpenAI is not configured or returns an error, v1 creates a conservative fallback draft and records the reason in metadata so scans remain operational in development.

## Approval lifecycle

1. User runs `POST /api/ai/followups/run-scan` or opens the AI Follow-up Center and starts a scan.
2. Backend creates `ai_followup_jobs` with `status = suggested`.
3. User reviews the generated message in `/followups`.
4. User can:
   - `POST /api/ai/followups/:id/approve`
   - `PATCH /api/ai/followups/:id` to edit the message/channel
   - `POST /api/ai/followups/:id/reject`
5. Only approved jobs can be sent.

## Send flow

`POST /api/ai/followups/:id/send` requires `status = approved`.

Channel selection:

- Telegram when the lead has `telegram_chat_id`.
- Email when the lead has `email`.
- CRM reminder/note when no delivery channel is available.

Results:

- Telegram sends through the existing Telegram service.
- Email sends through the existing email service.
- CRM reminder writes a CRM note.
- Success updates job status to `sent`, writes an attempt record, and logs timeline event `follow_up_sent`.
- Failure updates job status to `failed`, stores the error, writes an attempt record, and logs `follow_up_failed`.

## Workspace isolation and permissions

All endpoints use existing auth and workspace middleware. Queries join back to `crm_leads` with the authenticated user and workspace, and all data writes include `workspace_id`.

## Timeline and CRM integration

Timeline events are written for:

- follow-up suggested
- approved
- rejected
- sent
- failed

Lead detail pages show pending, sent, failed, and historical follow-up jobs together with existing AI follow-up sequence history.

## Future autonomous mode

Future versions can add workspace-level policy in `ai_followup_rules.config`, for example:

- allowed autonomous channels
- max sends per lead/week
- quiet hours
- confidence thresholds
- manager escalation rules
- automatic send for low-risk reminders

Even in autonomous mode, the same job/attempt tables and timeline events should remain the audit trail.
