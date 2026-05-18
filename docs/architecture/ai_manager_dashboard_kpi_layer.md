# AI Manager Dashboard KPI Layer

## Purpose

`/ai-manager-dashboard` is the manager-facing KPI layer for the AI Sales Operating System. It proves two things at the same time:

1. **Business value** — AI prepares, routes, and completes sales actions that are tied to pipeline and revenue opportunities.
2. **Operational safety** — approval, cooldown, duplicate prevention, copy guard, fallback, and failure visibility remain measurable.

The page uses the same visual language as AI Workers: `app-panel`, `stat-card`, compact KPI cards, timeline-style recent events, loading/error states, and a safe empty state.

## Route and API

- Frontend route: `GET /ai-manager-dashboard`
- Backend endpoint: `GET /api/ai/manager-dashboard?range=today|7d|30d`
- Default range: `7d` / Last 7 days
- Workspace scope: every query is constrained by `req.workspace.id`; the endpoint is protected by `requireAuth` and `requireWorkspace`.

## Response contract

```json
{
  "actionFunnel": {},
  "communicationOutcomes": {},
  "workloadReduction": {},
  "pipelineHealth": {},
  "revenueAttribution": {},
  "recentWins": [],
  "safetyEvents": {}
}
```

## Data sources

The KPI layer intentionally reuses production tables rather than introducing a reporting store:

- `ai_worker_queue` — AI action funnel, approval state, completion state, failed unresolved actions, copy guard blocks, revenue-linked actions.
- `crm_leads` — priority, urgency, risk, value, probability, and pipeline monitoring totals.
- `lead_timeline_events` — cooldown audit events, duplicate-prevention/fallback/route-highlight safety events where tracked, and safety timeline items.
- `telegram_messages` — outbound Telegram messages sent.
- `email_messages` — sent emails and recent wins such as “Email sent to Дмитрий Волков”.
- `crm_meetings` — meetings scheduled by AI.
- `lead_ai_scores` — latest forecast category, risk level, expected revenue, and forecast updates today.

## KPI sections

### A. AI Action Funnel

Counts AI actions in the selected date range:

- AI actions generated
- pending approval
- approved
- sent/completed
- rejected
- failed unresolved
- blocked by safety/copy guard

Copy guard blocks are detected from failed queue items and safety-test/copy-guard text in `error_message`, `title`, `recommendation`, or `payload`.

### B. Communication Outcomes

Shows communication and safety outcomes:

- emails sent
- telegram messages sent
- followups sent
- cooldown skips
- duplicate followups prevented
- unsafe copy blocked

Cooldown skips use durable `lead_timeline_events.event_type = 'ai_followup_skipped_cooldown'`, which makes checks such as “Telegram Connect Test cooldown” visible without reading logs.

### C. Manager Workload Reduction

Shows the manager-effort story:

- actions prepared by AI
- actions requiring manager decision
- completed after approval
- estimated minutes saved

Formula placeholder:

```text
minutes_saved = completed_customer_facing_actions * 7
```

### D. Pipeline Health

Summarizes active pipeline condition:

- urgent leads
- priority leads
- high risk / medium risk / low risk
- committed forecast amount
- AI-generated forecast updates today

Risk and forecast prefer latest `lead_ai_scores` values and fall back to `crm_leads` AI fields where needed.

### E. Revenue Attribution

Shows early attribution from AI activity to opportunities:

- total pipeline value under AI monitoring
- expected revenue from committed leads
- actions linked to revenue opportunities
- meetings scheduled by AI

## Recent wins

The dashboard builds a manager-readable feed from durable events, for example:

- `Email sent to Дмитрий Волков`
- `Follow-up cooldown prevented duplicate for Telegram Connect Test`
- `Copy guard blocked unsafe draft`
- `Meeting scheduled by AI`

## Safety section

The safety section includes summary counters and recent event items for:

- copy guard blocks
- cooldown skips
- failed unresolved
- fallback-to-email events
- route-highlight recoveries if tracked

## Empty, loading, and error states

The frontend never assumes that KPI data exists. It renders:

- loading copy while the API request is active;
- a non-crashing error panel if the API fails;
- safe empty copy when no KPI signals exist:

```text
AI ещё не накопил достаточно действий для KPI.
```

## Verification checklist

1. Open `/ai-manager-dashboard` in an authenticated workspace.
2. Confirm `GET /api/ai/manager-dashboard?range=7d` returns `200`.
3. Confirm KPI cards render and show non-zero values when demo or production data exists.
4. Confirm “Дмитрий Волков” email sends appear in recent wins when `email_messages` contains the sent demo email.
5. Confirm “Telegram Connect Test” cooldown audit appears when `lead_timeline_events` contains `ai_followup_skipped_cooldown` metadata/title for that lead.
6. Confirm unsafe copy guard tests appear in safety events when queue items are blocked by copy guard.
7. Confirm no console `TypeError` and no black screen on loading, error, or empty data.
