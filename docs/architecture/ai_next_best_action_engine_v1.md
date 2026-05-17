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
   → `telegram_meeting_confirmation_draft`.
3. `ai_risk_level` is `medium` or `high`  
   → `risk_followup_recommendation`, title `Риск потери сделки`.
4. `ai_score >= 70` and no meeting exists  
   → `meeting_schedule_proposal`.
5. No response for more than 24 hours  
   → `followup_sequence_draft`.
6. `stage=proposal`  
   → `proposal_followup_recommendation`.
7. Otherwise the lead is skipped.

## Deduplication

Before insert, the engine searches `ai_worker_queue` for an existing item with:

- the same `workspace_id`,
- the same `lead_id`,
- the same `action_type`,
- `payload.source = 'next_best_action_engine'`,
- status in `pending_approval` or `approved`.

If found, it logs `[next-best-action] duplicate skipped` and does not create another action.

## Queue payload

Every generated queue item includes:

```json
{
  "source": "next_best_action_engine",
  "leadId": "<lead uuid>",
  "nextBestAction": "<action type>",
  "reason": "<manager-readable explanation>",
  "customerText": "<safe customer-facing text>",
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

Customer-facing copy is generated from fixed templates and passed through `assertCustomerSafeText` before queue insertion. Scoring, risk, priority, and reasoning details stay inside `internalContext` and are not included in `customerText`.

The existing approval execution layer also applies copy guard checks before customer-facing drafts are sent.

## Timeline

Each created item writes a lead timeline event:

- `event_type`: `next_best_action_generated`
- `title`: `AI предложил следующее действие`
- `body`: human-readable manager explanation
- `source`: `ai`

## UI

The AI Workers page shows the `AI Next Best Action Engine` worker card with the button `Run Next Best Actions`. Generated items appear in the Approval Center, and AI Workers metrics include:

- `Next Best Actions pending`
- `Next Best Actions generated today`

## Logs

The engine emits structured logs:

- `[next-best-action] engine started`
- `[next-best-action] action created`
- `[next-best-action] duplicate skipped`
- `[next-best-action] lead skipped`
- `[next-best-action] engine completed`

## Verification checklist

- A booked lead with a soon meeting receives meeting prep.
- A booked lead without confirmation receives a Telegram meeting confirmation draft.
- A high-risk lead receives a risk follow-up recommendation.
- A high-score lead without a meeting receives a meeting proposal.
- A stale lead receives a follow-up draft.
- `customerText` contains no internal scoring or risk details.
- Duplicate pending/approved next-best-action items are skipped.
