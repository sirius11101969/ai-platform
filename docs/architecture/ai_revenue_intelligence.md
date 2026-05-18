# AI Revenue Intelligence Engine

## Purpose

The AI Revenue Intelligence layer is the Revenue Brain above CRM, AI Workers, AI Sequences, the autonomous execution loop, Redis orchestration, OpenAI execution, and the approval queue. It continuously converts available sales signals into probabilistic revenue guidance without auto-sending customer communication.

The engine computes:

- lead priority;
- close probability;
- revenue forecast;
- next best action;
- churn risk;
- pipeline health.

## Database model

### `ai_lead_scores`

One current score row per workspace/lead stores the latest Revenue Brain view:

- `priority_score` and `close_probability` are bounded 0-100 values.
- `engagement_score`, `churn_risk`, and `pipeline_health` are bounded 0-100 support metrics.
- `recommended_action`, `recommended_channel`, and `reasoning_summary` are customer-safe manager guidance.
- `model` identifies either the deterministic scoring model or the OpenAI model used for recommendation enrichment.

### `ai_revenue_forecasts`

Forecast snapshots store a weighted pipeline view:

- `projected_revenue` is calculated only from known pipeline value multiplied by probability.
- `confidence_score` is a bounded aggregate confidence/health score, not a certainty claim.
- `active_pipeline_value`, `hot_leads_count`, and `stalled_leads_count` explain the forecast basis.

## Scoring model

The deterministic scoring layer uses only existing CRM and engagement data:

- recent replies from Telegram and email;
- AI sequence activity and current step progression;
- meetings booked or confirmed;
- lead stage;
- inactivity duration and silent/stalled thresholds;
- engagement history;
- previous follow-up or timeline success signals;
- timeline activity.

The scorer produces probabilistic outputs. It never promises certainty, never invents revenue, and never treats missing data as a positive buying signal.

## AI reasoning

OpenAI is used only to refine manager-facing text fields:

- `reasoning_summary`;
- `recommended_action`;
- `recommended_channel`.

The OpenAI output is constrained to approved action/channel values, such as:

- `Schedule demo`;
- `Send pricing follow-up`;
- `Pause outreach`;
- `Escalate to manager`;
- `Send value follow-up`.

Revenue and numeric probability are still computed by deterministic code from stored CRM data. This prevents hallucinated pipeline value or fabricated certainty.

## Orchestration flow

1. The autonomous execution loop acquires the existing Redis/Postgres lock path.
2. The Revenue Brain scheduler finds active leads whose `ai_lead_scores` row is stale.
3. It enqueues `lead_intelligence_analysis` jobs in `ai_execution_jobs` with idempotency keys.
4. It also enqueues `revenue_forecast_generation` jobs for workspaces missing a fresh forecast.
5. The existing AI execution runner claims jobs, executes the Revenue Brain service, records worker metrics, and persists job results.
6. Lead analysis updates `ai_lead_scores`, CRM AI fields, timeline events, and a completed `revenue_next_best_action` queue record for auditability.
7. Forecast generation writes an immutable `ai_revenue_forecasts` snapshot.
8. CRM, lead card, and dashboard UI read the current Revenue Brain dashboard API.

## Forecast logic

Forecasted revenue is weighted expected value:

```text
projected_revenue = SUM(active_lead.value * close_probability / 100)
```

The engine does not invent deal size. If lead value is absent, that lead contributes zero revenue until CRM contains a real value. Confidence is an aggregate pipeline-health score, not a guarantee.

## Metrics

The dashboard API exposes:

- analysis latency from completed AI execution jobs;
- forecast generation count;
- scoring coverage across active leads;
- recommendation acceptance/audit counts.

UI widgets show:

- forecasted revenue;
- hot leads count;
- AI pipeline health;
- engagement trend;
- AI recommendations queue.

## Safety guarantees

The Revenue Brain must never:

- hallucinate revenue;
- promise certainty;
- expose internal prompts;
- auto-send outreach.

All manager-facing guidance uses probabilistic language and remains compatible with the approval queue.

## Compatibility

The layer reuses current platform primitives and does not replace:

- AI Sequences;
- AI Workers;
- CRM;
- autonomous execution loop;
- Redis orchestration;
- OpenAI execution;
- approval queue.

## Future reinforcement learning roadmap

Future versions can learn from accepted/rejected recommendations and won/lost outcomes:

1. Capture recommendation acceptance, edits, sends, replies, meetings, and outcomes as training signals.
2. Weight scoring features by workspace-specific historical conversion patterns.
3. Add exploration safeguards that keep recommendations within approved action/channel policies.
4. Train per-segment calibration models for probability-to-close.
5. Continuously evaluate calibration drift before promoting model weights to production.
