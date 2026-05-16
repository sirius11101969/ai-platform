# AI Deal Risk & Revenue Forecast Engine

AS6 AI CRM now includes a workspace-scoped predictive revenue layer that turns lead qualification, outreach, stage automation, approvals, timeline, Telegram/email, and CRM activity into deal intelligence.

## Core outputs

For every lead/opportunity the engine calculates and persists:

- `probability_to_close` — 0–100 probability stored on `lead_ai_scores.probability_to_close`, mirrored into `crm_leads.probability_to_close`, and kept compatible with legacy `lead_ai_scores.deal_probability`.
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

## Forecast probability bands

The scoring service maps lead temperature into bounded forecast ranges before writing revenue math:

| Temperature | Probability band |
| --- | --- |
| Hot | 70–95% |
| Warm | 40–70% |
| Cold | 10–40% |

`expected_revenue` is always calculated as `deal_value * probability_to_close / 100`.

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
- `ai_pipeline_health` — captures risk level, engagement score, forecast category, and queue actions for the pipeline-health feed.
- `ai_next_action_generated` — captures the generated next best action for manual AI analysis flows.

These events are stored in `lead_timeline_events` with `workspace_id`, `lead_id`, and `source = ai`.

## AI worker queue actions

The engine adds approval-safe queue items in `ai_worker_queue`:

- `risk_review` — manager-visible risk summary for risky, stalled, or high-value opportunities.
- `pipeline_health_alert` — created for `at_risk` or `lost_risk` opportunities.
- `stale_deal_followup` — created for stale/no-reply/ignored-proposal opportunities.

Queue items are deduplicated per workspace, lead, action type, and 24-hour window.

## CRM dashboard widgets

CRM and Dashboard pages expose:

- Forecast Revenue
- Revenue At Risk
- High Probability Deals
- Stalled Opportunities
- Pipeline Health
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
5. Confirm risk signals plus `ai_forecast_updated`, `ai_risk_detected`, and `ai_pipeline_health` timeline entries are created with readable Russian text.
6. Confirm `risk_review`, `pipeline_health_alert`, and `stale_deal_followup` queue items are created for stale/risky examples.
7. Confirm CRM dashboard metrics update: Forecast Revenue, Revenue At Risk, High Probability Deals, Stalled Opportunities, Pipeline Health, Forecast Distribution.

## AS6 Forecast/Risk UI integration

The AS6 CRM UI now surfaces the latest score fields from `lead_ai_scores` directly in the pipeline and lead modal:

- CRM lead cards show `probability_to_close`, `expected_revenue`, `forecast_category`, `risk_level`, `engagement_score`, and the AI next best action.
- Lead detail modal includes an **AI Forecast** section with `probability_to_close`, `engagement_score`, `expected_revenue`, `forecast_category`, `risk_level`, `recommended_next_step`, and the latest forecast/risk timeline event.
- When no score exists, CRM cards and the modal show: `AI прогноз появится после квалификации лида.`

The dashboard exposes dedicated KPI cards for:

- AI Forecast Revenue
- Revenue At Risk
- High Probability Deals
- At-risk Deals
- Avg Probability
- Pipeline Health

Pipeline health is workspace-scoped and excludes `won` / `lost` from active-pipeline calculations. The status is intentionally simple and explainable:

| Status | Rule |
| --- | --- |
| `healthy` | Risk revenue is ≤ 30% and only a small share of active deals are high risk. |
| `warning` | Risk revenue is > 30% or the active pipeline has a meaningful high-risk share. |
| `critical` | Risk revenue is > 50%. |

SQL projections use explicit aliases for latest-score reads, for example `scores.probability_to_close AS probability_to_close`, to avoid ambiguous column names when joining `crm_leads`, timeline data, and latest `lead_ai_scores`.
