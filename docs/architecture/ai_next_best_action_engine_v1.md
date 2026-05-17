# AI Next Best Action Engine v1

## Purpose

AI Next Best Action Engine v1 is a deterministic AI worker for AS6 AI Revenue OS. It scans active CRM leads, selects at most one safe next best action per lead, and places the action into the manager approval queue. The engine never sends customer communication automatically.

## Worker

| Field | Value |
| --- | --- |
| Name | `AI Next Best Action Engine` |
| Type | `ai_next_best_action_engine` |
| Mode | `approval_required` |
| Status | `active` |

The worker is created for each workspace by the database migration and is also maintained by the default worker bootstrap in the backend.

## Run API

The engine can be started through the worker system:

- `POST /api/ai/workers/:id/run`
- `POST /api/ai-workers/run/ai_next_best_action_engine`

Both endpoints require authentication and workspace context.

## Deterministic decision rules

For every active lead (`status`/`stage` not `won` or `lost`), the engine evaluates rules in this exact priority order and creates no more than one action:

1. `stage=booked` and a non-cancelled meeting starts within 48 hours  
   → `meeting_prep_recommendation`, title `Подготовиться к demo`.
2. `stage=booked` and no meeting confirmation action exists  
   → channel-aware meeting confirmation draft: `telegram_meeting_confirmation_draft` when `telegram_chat_id` exists, `email_followup_draft` when only email exists, or `create_reminder` when no outbound channel exists.
3. `ai_risk_level` is `medium` or `high`  
   → `risk_followup_recommendation`, title `Риск потери сделки`.
4. `ai_score >= 70` and no meeting exists  
   → `meeting_schedule_proposal`.
5. No response for more than 24 hours  
   → `followup_sequence_draft`.
6. `stage=proposal`  
   → `proposal_followup_recommendation`.
7. Otherwise the lead is skipped.

## Channel selection

Before any customer-facing action is inserted, the engine calls `getBestContactChannel(lead)` and uses this priority order:

1. `telegram` when `lead.telegram_chat_id` exists.
2. `email` when Telegram is missing and `lead.email` exists.
3. `internal` when no outbound channel exists.

For Telegram leads, customer-facing next-best actions are created as Telegram drafts (`telegram_meeting_confirmation_draft` for booked confirmations or `telegram_followup` for other follow-ups). For email-only leads, they are created as `email_followup_draft` with `payload.channel = 'email'`. For booked email-only leads, the draft title is `Подтвердить demo по email`, the subject is `Подтверждение demo-созвона`, and the customer text is `Здравствуйте! Подтверждаю demo-созвон. Если время нужно изменить — просто напишите, я подстроюсь.`

If neither Telegram nor email is available, the engine creates `create_reminder` with `payload.channel = 'internal'` so the item is an internal manager reminder, not a sendable customer message.

## Deduplication

Before insert, the engine searches `ai_worker_queue` for an existing item with:

- the same `workspace_id`,
- the same `lead_id`,
- the same `action_type`,
- `payload.source = 'next_best_action_engine'`,
- the same `payload.preferredChannel` (falling back to `payload.channel` for older rows),
- status in `pending_approval` or `approved`.

If found, it logs `[next-best-action] duplicate skipped` and does not create another action.

## Queue payload

Every generated queue item includes:

```json
{
  "source": "next_best_action_engine",
  "leadId": "<lead uuid>",
  "nextBestAction": "<original next-best-action type>",
  "reason": "<manager-readable explanation>",
  "preferredChannel": "telegram|email|internal",
  "channel": "telegram|email|internal",
  "fallbackReason": "telegram_missing|telegram_missing_no_outbound_channel",
  "customerText": "<safe customer-facing text>",
  "subject": "<email subject when channel=email>",
  "internalContext": {
    "stage": "<lead stage>",
    "ai_score": 0,
    "ai_risk_level": "low",
    "ai_priority": "medium",
    "ai_scoring_reason": "manager-only context"
  },
  "confidence": 0
}
```

## Safety

Customer-facing copy is generated from fixed templates after channel selection and passed through `assertCustomerSafeText` before queue insertion. Scoring, risk, priority, and reasoning details stay inside `internalContext` and are not included in `customerText`.

The existing approval execution layer also applies copy guard checks before customer-facing drafts are sent.

## Timeline

Each created item writes a lead timeline event:

- `event_type`: `next_best_action_generated`
- `title`: `AI предложил следующее действие`
- `body`: human-readable manager explanation
- `source`: `ai`

## UI

The AI Workers page shows the `AI Next Best Action Engine` worker card with the button `Run Next Best Actions`. Generated items appear in the Approval Center. Email fallback drafts show `channel=email`, type `Черновик email follow-up`, and the send button `Отправить`, and AI Workers metrics include:

- `Next Best Actions pending`
- `Next Best Actions generated today`

## Logs

The engine emits structured logs:

- `[next-best-action] engine started`
- `[next-best-action] channel selected`
- `[next-best-action] fallback to email`
- `[next-best-action] internal reminder created`
- `[next-best-action] action created`
- `[next-best-action] duplicate skipped`
- `[next-best-action] lead skipped`
- `[next-best-action] engine completed`

## Verification checklist

- A booked lead with a soon meeting receives meeting prep.
- A booked lead with Telegram and without confirmation receives a Telegram meeting confirmation draft.
- A booked lead without Telegram but with email (for example, Дмитрий Волков) receives `email_followup_draft` with `preferredChannel=email` and no `telegram_meeting_confirmation_draft`.
- A lead with no outbound channel receives an internal `create_reminder` only.
- A high-risk lead receives a risk follow-up recommendation.
- A high-score lead without a meeting receives a meeting proposal.
- A stale lead receives a follow-up draft.
- `customerText` contains no internal scoring or risk details.
- Duplicate pending/approved next-best-action items are skipped.
