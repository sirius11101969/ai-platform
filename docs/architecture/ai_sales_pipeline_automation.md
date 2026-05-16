# AI Sales Pipeline Automation

AS6 AI CRM now treats pipeline movement as an approval-controlled AI workflow. The system keeps existing outreach, Telegram, email, AI qualification, follow-ups, and the approval center intact while adding stage recommendations, inactivity detection, risk logging, and AI revenue forecasting.

## Scope and workspace safety

All data paths are scoped by `workspace_id`:

- `crm_leads` stores AI forecast fields per workspace lead.
- `ai_worker_queue` stores `stage_change_recommendation` approval items per workspace.
- `lead_timeline_events` and `crm_activity` log recommendation, approval, stage change, and risk events per workspace.
- CRM stats aggregate only leads that belong to the authenticated user's active workspace.

## Stage recommendation flow

AI may recommend the following controlled transitions:

| Current stage | Recommended stage |
| --- | --- |
| `new` | `qualified` |
| `qualified` | `proposal` |
| `proposal` | `booked` |
| `booked` | `won` or `lost` |

Recommendations are created as `ai_worker_queue.action_type = 'stage_change_recommendation'` with:

- `status = 'pending_approval'`
- `payload.currentStatus`
- `payload.nextStatus`
- `payload.reason`
- `payload.confidence`
- forecast context such as probability and expected revenue where available

Supported approval statuses are:

- `pending_approval`
- `approved`
- `rejected`
- `executing`
- `executed`
- `failed`
- `cancelled`

For stage recommendations, approval executes the stage change immediately and marks the queue item `executed`. This preserves the rule that AI cannot move CRM stages without a human approval action.

## Trigger conditions

Stage recommendations can be generated from:

- Lead replies in Telegram.
- Outreach engagement and inbound response context.
- Email activity, including sent/opened events used in AI scoring context.
- Meeting and demo signals.
- Manual notes and CRM activity.
- Positive intent (`интерес`, `демо`, `стоимость`, `договор`, etc.).
- Negative intent (`не актуально`, `нет бюджета`, `отказ`, etc.).
- AI qualification output and risk/urgency scores.
- Inactivity/risk signals from follow-up automation.

Example Russian reasons shown in CRM:

- “Клиент подтвердил интерес к демо и запросил детали внедрения.”
- “Лид не отвечает более 7 дней.”
- “Клиент согласовал встречу.”

## Approval center behavior

The approval queue supports the new action type:

```text
stage_change_recommendation
```

Approval writes timeline/audit events:

- `ai_stage_recommendation` when the recommendation is created.
- `stage_approved` when a manager approves it.
- `stage_changed` when CRM stage updates.
- `opportunity_risk_detected` when inactivity automation flags risk.

Rejected recommendations remain visible as rejected queue history and do not mutate the CRM lead stage.

## CRM lead modal

The lead detail modal displays an AI Pipeline Automation card when a pending stage recommendation exists:

- Current stage.
- AI recommended stage.
- Reason.
- Confidence.
- Approval status.
- Approve button.
- Reject button.

The generic AI Execution Center still shows outreach, materials, reminders, and other AI actions, but stage recommendations are highlighted separately to make stage movement explicit.

## Inactivity automation and risk detection

The follow-up scanner keeps existing autonomous follow-up behavior and detects:

- `no_reply_24h`
- `no_reply_3d`
- `no_reply_7d`
- `proposal_no_reply`
- `meeting_no_next_step`
- `hot_lead_inactive`

When matched, the scanner generates AI follow-up jobs with reminder/follow-up metadata. High-risk rules additionally log `opportunity_risk_detected` with escalation metadata.

Risk categories include:

- Stalled deal.
- No engagement.
- Repeated ignored follow-ups.
- Weak qualification / low score.

## Revenue forecasting

`crm_leads` now includes AI forecast fields:

- `probability_to_close`
- `estimated_revenue`
- `expected_close_date`

AI lead scoring updates these fields from `deal_probability` and current deal value. Dashboard stats calculate forecasted revenue from explicit lead forecast fields first, then fall back to latest AI score probability.

## Dashboard metrics

The dashboard exposes:

- AI forecasted revenue.
- Deals at risk.
- Inactive opportunities.
- AI stage recommendations pending.
- Pipeline health percentage.

These metrics are returned in `stats.aiMetrics` and remain workspace-scoped.

## Verification scenario

1. Create a CRM lead.
2. Approve outreach draft as before.
3. Simulate or receive a Telegram reply with positive intent, such as asking for a demo or implementation details.
4. AI creates a `stage_change_recommendation` queue item.
5. Open the lead modal and review current stage, AI recommended stage, reason, and confidence.
6. Approve the recommendation.
7. CRM updates the lead stage and marks the queue item `executed`.
8. Timeline shows recommendation, approval, and stage changed events.

## Deployment

```bash
cd /var/www/ai-platform
git pull
docker compose up -d --build
```
