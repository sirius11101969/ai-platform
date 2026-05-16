# AI Deal Risk & Revenue Forecast Engine

AS6 AI CRM now includes a workspace-scoped predictive revenue layer that turns lead qualification, outreach, stage automation, approvals, timeline, Telegram/email, and CRM activity into deal intelligence.

## Core outputs

For every lead/opportunity the engine calculates and persists:

- `probability_to_close` — 0–100 probability stored on `crm_leads` and mirrored from latest `lead_ai_scores.deal_probability`.
- `risk_level` — `low`, `medium`, or `high` based on inactivity, negative signals, ignored proposals, and engagement decay.
- `engagement_score` — 0–100 signal score from Telegram/email/activity/CRM notes.
- `expected_revenue` — `deal_value * probability_to_close / 100` stored in `lead_ai_scores.expected_revenue`; `crm_leads.estimated_revenue` remains the CRM-level forecast amount.
- `forecast_category` — one of `committed`, `likely`, `possible`, `at_risk`, `lost_risk`.
- `next_best_action_code` — one of `schedule_demo`, `send_proposal`, `follow_up_in_telegram`, `escalate_to_manager`, `close_as_lost`, `request_budget_info`.

## Risk detection rules

The scoring service detects these risk signals from workspace-local lead context:

- `no_reply_24h`
- `no_reply_3d`
- `no_reply_7d`
- `proposal_ignored`
- `meeting_without_next_step`
- `repeated_followups_without_engagement`
- `low_activity`
- `negative_signals`

The generated reasoning is human-readable and supports Russian CRM examples, including:

- “Клиент перестал отвечать после отправки предложения.”
- “Высокий интерес к demo и внедрению.”
- “Есть Telegram engagement и быстрые ответы.”
- “Сделка без активности 8 дней.”

## Forecast categories

| Category | Rule of thumb |
| --- | --- |
| `committed` | Low risk and probability ≥ 80% |
| `likely` | Low risk and probability ≥ 60% |
| `possible` | Open opportunity without strong commitment/risk |
| `at_risk` | Medium risk or active risk signal |
| `lost_risk` | High risk, ignored proposal, 7d no reply, or lost stage |

## Timeline events

Every AI forecast recalculation writes timeline events:

- `ai_forecast_updated` — probability, forecast category, expected revenue, and metadata snapshot.
- `ai_risk_detected` — emitted when risk is not low or risk signals exist.
- `ai_next_action_generated` — captures the generated next best action.

These events are stored in `lead_timeline_events` with `workspace_id`, `lead_id`, and `source = ai`.

## AI worker queue actions

The engine adds approval-safe queue items in `ai_worker_queue`:

- `risk_review` — every forecast review creates a manager-visible risk summary.
- `pipeline_health_alert` — created for `at_risk` or `lost_risk` opportunities.
- `stale_deal_followup` — created for stale/no-reply/ignored-proposal opportunities.

Queue items are deduplicated per workspace, lead, action type, and 24-hour window.

## CRM dashboard widgets

CRM and Dashboard pages expose:

- AI Forecast Revenue
- Revenue At Risk
- High Probability Deals
- Stalled Opportunities
- AI Pipeline Health
- Forecast Distribution

The backend calculates these metrics in `getStats()` using latest `lead_ai_scores`, `crm_leads`, and activity tables filtered by `workspace_id` and current user.

## Lead card UX

Lead cards and the detail panel show:

- Probability percentage
- Glowing risk badge/highlight
- Expected revenue
- Forecast progress bar
- AI reasoning
- Next best action

## Workspace safety

All reads/writes are scoped by `workspace_id`. The engine preserves existing outreach drafts, AI stage automation, approval center, CRM timeline, Telegram/email execution, and autonomous follow-up flows.

## Verification checklist

1. Create a hot lead with deal value, company, Telegram/email, and notes mentioning demo/budget/implementation.
2. Run lead AI analysis or workspace AI recalculation.
3. Confirm the lead card shows probability, expected revenue, forecast category, AI reasoning, and next best action.
4. Simulate inactivity/no reply by using old outbound/timeline/email activity and recalculate.
5. Confirm risk signals, `ai_risk_detected`, `ai_forecast_updated`, and `ai_next_action_generated` timeline entries are created.
6. Confirm CRM dashboard metrics update: AI Forecast Revenue, Revenue At Risk, High Probability Deals, Stalled Opportunities, AI Pipeline Health, Forecast Distribution.
