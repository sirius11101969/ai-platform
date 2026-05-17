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


## v2 calibration (May 2026)

The v2 calibration keeps the v1 data model and worker, but changes the scoring distribution so the sales queue is not flooded with 84–100 scores. The score is now an opportunity score, risk is tracked separately, and operational priority combines score with strong buying signals and risk.

### Calibrated score bands

| Score | Sales category | `ai_priority` | `ai_temperature` |
| --- | --- | --- | --- |
| 0–24 | cold | `low` | `cold` |
| 25–49 | warm | `medium` | `warm` |
| 50–69 | hot | `high` | `hot` |
| 70–84 | priority | `priority` | `hot` |
| 85–100 | urgent / top priority only | `urgent` only when there is a strong buying signal or high risk, otherwise `priority` | `priority` |

### Calibrated factor weights

Generic words no longer create inflated scores by themselves. Pricing intent alone adds `+10`, demo intent alone adds `+10`, and pricing plus demo together adds `+18`. Additional calibrated signals include meeting booked `+18`, explicit company/team context `+8`, enterprise/team size above 20 people `+12`, recent inbound `+8`, multiple inbound messages `+8`, Telegram connected `+5`, booked stage `+12`, and proposal stage `+14`.

Inactivity penalties are tiered and skipped when a meeting is already booked: inactive for more than 3 days applies `-10`, more than 7 days applies `-20`, and more than 14 days applies `-35`. Closed-lost leads are capped at 20, forced to `ai_priority='low'`, and forced to `ai_temperature='cold'`. Closed-won leads keep their analytics score but are forced to `ai_priority='low'` so they do not pollute the active priority queue.

### Risk and recommendations

Risk no longer automatically boosts the opportunity score. `ai_risk_level` is `high` when a hot/proposal/booked-stage deal is inactive for more than 7 days, `medium` when any active lead is inactive for more than 3 days, and `low` otherwise. Other risk signals such as ghosting, bounced email, stalled deal, or no meeting outcome can still mark the lead as medium/high risk without increasing the score.

The Approval Center now creates `lead_priority_recommendation` items only when `ai_priority` is `priority`/`urgent` or `ai_risk_level` is `medium`/`high`; won/lost leads are skipped. Reasoning text is compacted under 500 characters and lists positive signals, negative penalties, risks, and the final score/category.

### Dashboard counting

Priority Leads count only active leads whose latest `crm_leads.ai_priority` is `priority` or `urgent`; won/lost leads are excluded. At-risk Deals count both `medium` and `high` risk levels. This keeps won/lost deals and merely warm leads out of the priority dashboard while still surfacing stalled deals that need operational follow-up.

## Manual execution

The CRM page has a **“Запустить scoring”** button. It calls `POST /crm/lead-scoring/run`, scans active leads (`status NOT IN ('won','lost','closed_won','closed_lost')`), and recalculates scores.

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
