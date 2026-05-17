# AI Lead Scoring Engine v1

AI Lead Scoring Engine v1 turns the CRM scoring layer into a deterministic AI Revenue Operating System component. It calculates a 0–100 lead score, priority, temperature, risk level, reasoning, timeline events, and approval-center recommendations from CRM, Telegram, email, meetings, follow-ups, notes, and activity history.

## Data model

`crm_leads` now stores the latest scoring snapshot:

- `ai_score INTEGER DEFAULT 0` — normalized 0–100 score.
- `ai_priority VARCHAR(20) DEFAULT 'medium'` — `low`, `medium`, `high`, `priority`, or `urgent`.
- `ai_risk_level VARCHAR(20) DEFAULT 'low'` — `low`, `medium`, or `high`.
- `ai_temperature VARCHAR(20) DEFAULT 'warm'` — `cold`, `warm`, `hot`, or `priority`.
- `ai_last_scored_at TIMESTAMPTZ` — latest scoring timestamp.
- `ai_scoring_reason TEXT` — deterministic explanation shown on lead cards.

The engine also appends a compatible historical row into `lead_ai_scores` for existing forecast/dashboard flows.

## Score interpretation

| Score | Temperature | Meaning |
| --- | --- | --- |
| 0–25 | `cold` | Weak intent or negative signals dominate. |
| 26–50 | `warm` | Some fit or engagement, but not yet ready. |
| 51–75 | `hot` | Strong buying intent or active next step. |
| 76–100 | `priority` | High-priority revenue opportunity. |

## Deterministic scoring factors

Positive weighted factors:

- recent inbound reply;
- pricing/budget question;
- demo or meeting intent;
- meeting booked / booked stage;
- team, company, department, or CRM intent;
- multiple inbound Telegram messages;
- urgency wording such as “today”, “urgent”, “срочно”;
- active Telegram identity or chat.

Negative weighted factors:

- inactivity for more than 7 days;
- no response after multiple follow-ups;
- declined/cancelled meeting or “not interested” language;
- closed lost status;
- bounced/undeliverable email signals;
- repeated no-reply follow-ups.

## Risk detection

The engine detects and records risk codes for:

- `ghosting_risk` — multiple follow-ups/outbound messages without inbound response;
- `meeting_no_show_risk` — scheduled meeting passed without outcome signals;
- `deal_stalled` — proposal/stage stalled or explicit decline;
- `inactive_lead` — no activity for more than 7 days or unreachable channel.

Medium/high risks create a `lead_risk_detected` timeline event and can create an approval-center recommendation.

## Worker and queue actions

The worker is registered as:

- name: `AI Lead Scoring Engine`;
- type: `ai_lead_scoring_engine`;
- mode: `approval_required`.

Each scoring run writes an `ai_worker_queue` audit item with:

- `action_type = 'lead_scoring_update'`;
- status `completed`;
- score, priority, temperature, risk, and reasoning in payload.

If a lead becomes high priority or high risk, the Approval Center receives:

- `action_type = 'lead_priority_recommendation'`;
- examples: “Высокий шанс сделки”, “Риск потери лида”, “Рекомендуется срочный follow-up”, “Lead готов к demo”.

## Manual execution

The CRM page has a **“Запустить scoring”** button. It calls `POST /crm/lead-scoring/run`, scans active leads (`status NOT IN ('won','lost')`), and recalculates scores.

Single-lead scoring is available through `POST /crm/leads/:id/lead-scoring` and is used by the lead detail scoring button.

## Automatic triggers

Scores recalculate on:

- inbound Telegram message;
- outbound Telegram reply from CRM;
- meeting booked by the approval workflow;
- CRM follow-up generation/sent flow;
- stage changes.

Each trigger passes a `source` value into the scoring payload for auditability.

## CRM UI and dashboard

Lead cards show:

- AI score;
- priority badge;
- temperature;
- risk badge;
- AI reasoning.

Dashboard/CRM widgets expose:

- Priority Leads;
- At-risk Deals;
- Hot Leads;
- Leads needing follow-up.

## Timeline and logging

Timeline events:

- `lead_scored`;
- `lead_risk_detected`.

Server logs:

- `[lead-scoring] scoring started`;
- `[lead-scoring] lead updated`;
- `[lead-scoring] risk detected`.

## Verification scenarios

- Inbound pricing question adds pricing intent and should increase score.
- Meeting booked adds a strong positive factor and should move the lead to hot/priority.
- Inactive lead older than 7 days should lower score and create risk detection.
- Dashboard counters should update after scoring.
- Lead cards and detail modal should render latest score, priority, temperature, risk, and reasoning.
