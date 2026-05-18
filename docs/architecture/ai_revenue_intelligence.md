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

## Dedicated UI route

AI Revenue Intelligence is available as a protected full-page workspace route at `/ai-revenue-intelligence`. The sidebar links to this route near AI Workers and AI Voice Outreach so managers can open Revenue Brain, forecast, pipeline health, next-best-action, and latest lead-score views without hunting inside `/dashboard`. The existing dashboard command-center preview remains in place and links to the full page.

## UI workflow: AI Revenue Command Center

The production UI now exposes an **AI Revenue Intelligence** dashboard section in the main dashboard and CRM workspace. The section is intentionally executive and compact:

1. A manager opens the dashboard or CRM.
2. The frontend calls `getRevenueIntelligence()` using the existing authenticated workspace headers.
3. The command center renders six safe summary cards from `ai_lead_scores` and `ai_revenue_forecasts`:
   - Forecasted Revenue;
   - Hot Leads;
   - Stalled Leads;
   - High Churn Risk;
   - Pipeline Health;
   - AI Recommendations.
4. The Revenue Forecast Widget shows projected revenue, confidence score, active pipeline value, hot lead count, stalled lead count, and a lightweight trend indicator.
5. The **AI Next Best Actions** queue lists safe manager actions such as `Schedule demo`, `Follow up via Telegram`, `Pause outreach`, and `Escalate to manager`.
6. The manager can click **Run Revenue Analysis Now**. The UI calls `triggerRevenueAnalysis()`, which enqueues `lead_intelligence_analysis`, enqueues/generates the current forecast path, shows a loading state, and then displays a success or error toast.

The UI only renders normalized manager summaries. It does not expose prompts, internal chain-of-thought, raw OpenAI responses, or unfiltered provider payloads.

## CRM lead card workflow

Every CRM lead detail card can show a Revenue Intelligence panel when an `ai_lead_scores` row exists for that lead:

- AI Priority Score;
- Close Probability;
- Engagement Score;
- Churn Risk;
- Pipeline Health;
- AI Recommendation;
- Recommended Channel;
- Last AI Analysis Time.

Badges and progress meters keep the view scannable while preserving the existing CRM, AI Sequence, AI Worker, Telegram, email, meeting, and approval-queue controls. Empty states explain that the Revenue Brain should be run before scores are available.

## Lead list workflow

CRM lead lists keep the existing kanban stages but add Revenue Intelligence controls above the board:

- sortable columns/signals: AI Priority, Close Probability, and Churn Risk;
- filters: Hot Leads, High Probability, Stalled, and At Risk.

Filtering and sorting are frontend-only views over the existing lead payload and do not mutate lead stage, ownership, sequence state, follow-up state, or autonomous execution state.

## Command center architecture

```text
Dashboard / CRM UI
  ├─ getRevenueIntelligence()
  │    └─ GET /api/ai/revenue-intelligence
  │         └─ reads ai_lead_scores + latest ai_revenue_forecasts
  ├─ getLeadScores()
  │    └─ GET /api/ai/revenue-intelligence/lead-scores
  │         └─ returns sanitized, sortable lead score summaries
  └─ triggerRevenueAnalysis()
       ├─ POST /api/ai/revenue-intelligence/schedule
       │    └─ enqueues workspace-scoped lead_intelligence_analysis and forecast jobs
       └─ POST /api/ai/revenue-intelligence/forecast
            └─ writes a fresh ai_revenue_forecasts snapshot
```

Manual trigger scheduling is workspace-scoped so one workspace cannot enqueue Revenue Brain work for another workspace. It reuses the existing auth middleware, workspace middleware, `ai_execution_jobs`, Redis-backed execution runner path, and existing OpenAI execution safety boundaries.

## Executive dashboard roadmap

Near-term dashboard enhancements:

1. Add historical forecast trend lines from multiple `ai_revenue_forecasts` snapshots.
2. Add forecast deltas by stage and owner.
3. Show recommendation acceptance rate split by action type and channel.
4. Add board-level revenue at risk by stage.
5. Add calibration views comparing predicted close probability with won/lost outcomes.

Longer-term executive roadmap:

1. Per-workspace forecast calibration based on historical conversion.
2. Revenue impact attribution for AI Sequences, AI Workers, and approved follow-ups.
3. Alert routing for stalled high-value opportunities.
4. Segment-specific next best action policies.
5. Board-ready export views for weekly pipeline review.
