# AI Pipeline Copilot v1

## Purpose

AI Pipeline Copilot v1 is the AS6 AI Revenue OS daily sales cockpit. It gives a manager one compact page for:

- what to do today;
- which leads need attention;
- which meetings are upcoming;
- which deals are at risk;
- which AI actions are waiting for approval;
- which failed AI actions need a fix.

The page is intentionally **command-center only**. It does not send Telegram messages, emails, or any other customer-facing communication.

## Route and API

- Frontend route: `/pipeline-copilot`
- Backend endpoint: `GET /api/ai/pipeline-copilot`
- Sidebar navigation label: `AI Pipeline Copilot`

The endpoint returns:

```json
{
  "summary": {},
  "todayActions": [],
  "focusLeads": [],
  "riskDeals": [],
  "upcomingMeetings": [],
  "pendingApprovals": [],
  "failedActions": [],
  "revenueSnapshot": {}
}
```

## Data sources

The backend composes deterministic cockpit data from existing AS6 AI Revenue OS tables and engines:

- CRM leads (`crm_leads`) for focus leads, risk deals, AI scores, priority, stage, and revenue values.
- AI Priority Inbox / Next Best Action outputs via `ai_worker_queue` items and lead AI fields.
- AI Workers Approval Center via `ai_worker_queue` statuses:
  - `pending_approval`
  - `approved`
  - `failed`
- Meeting proposals and created meetings via `crm_meetings`.
- Workspace audit/activity via `crm_activity`.

## Summary block

The top summary exposes manager-readable Russian strings:

- `Сегодня нужно сделать X действий`
- `Y сделок в риске`
- `Z встреч требуют подготовки`
- `N AI задач ждут approval`

Top metrics are:

- Actions Today
- Focus Leads
- Risk Deals
- Meetings Next 24h
- Pending Approvals
- Failed Actions

## Today Actions generation

`todayActions` is generated deterministically from:

1. failed/blocked AI worker queue items;
2. meetings within the next 24 hours;
3. high/medium risk deals;
4. urgent/priority/high focus leads;
5. pending approvals;
6. remaining focus leads.

Each action includes:

- `leadName`
- `actionTitle`
- `reason`
- `priority`
- `dueLabel`
- `ctaRoute`
- `ctas` for:
  - Open Lead
  - Open AI Workers
  - Open Priority Inbox
  - Create Follow-up
  - Schedule Meeting

## Sorting

The sorted order is intentionally fixed and does not depend on LLM randomness:

1. failed/blocked fixes;
2. meetings within 24h;
3. high/medium risk;
4. urgent priority;
5. pending approvals;
6. other actions.

Within a bucket, urgency priority is used first, then lead name for stable ordering.

## Safety

Pipeline Copilot v1 never executes customer-facing sends. It only links the manager to existing pages:

- CRM lead card / action context;
- AI Workers Approval Center;
- AI Priority Inbox.

Draft/customer copy bodies are not surfaced in the Pipeline Copilot API response. The page displays action titles, internal recommendations, reasons, status, and routing context only.

## Timeline / audit event

Every successful page request attempts to write a workspace-level activity event:

- `type = pipeline_copilot_viewed`
- `title = AI Pipeline Copilot viewed`

This avoids noisy per-lead timeline events while keeping a workspace-level audit trail.

## Logs

The backend service emits these logs:

- `[pipeline-copilot] requested`
- `[pipeline-copilot] summary generated`
- `[pipeline-copilot] action generated`

## UI/UX

The page is styled as an executive sales cockpit:

- compact top metrics;
- clear urgency badges;
- high-signal action cards;
- responsive two/three-column section layouts;
- mobile single-column fallback;
- explicit safety banner.

## Verification checklist

After seeding/using the demo pipeline, verify:

- `/pipeline-copilot` opens.
- Дмитрий email fallback completed appears through completed/failed historical AI action context when present in queue data.
- Мария meeting created appears in upcoming meetings when present in `crm_meetings`.
- Алексей risk action completed appears through risk/focus context when AI risk fields identify him.
- Дмитрий Telegram issue appears as a failed/old failed item when present in `ai_worker_queue` with `failed` status.
- Pending approvals are visible in Waiting for Approval.
- No unsafe customer copy is displayed or sent from this page.

## v2 clean executive cockpit

Pipeline Copilot v2 keeps the same route (`/pipeline-copilot`) and API shape, but tightens the cockpit for manager-facing daily execution:

- The UI must never render raw AI scoring context such as `ai_scoring_reason`, `internalContext`, `Плюсы:`, `Минусы:`, `Итог:`, scoring weights like `+8` / `+18`, or raw score explanations.
- Backend responses use `sanitizeManagerReason(text)` before a reason, title, error, recommendation, meeting title, or lead summary can reach Pipeline Copilot sections.
- Manager-facing reasons are short operational summaries, for example:
  - `Лид проявил высокий интерес к demo`
  - `Сделка требует follow-up сегодня`
  - `Есть риск потери из-за паузы в коммуникации`
  - `Встреча запланирована, нужно подготовить agenda`
- The default Today’s Sales Actions view is capped at 10 visible actions and prioritizes:
  1. unresolved failed customer-facing actions;
  2. meetings within 24 hours;
  3. high/medium risk deals;
  4. urgent/priority focus leads;
  5. actionable approvals from the next-best-action engine;
  6. actionable high-value email, Telegram, follow-up, and meeting approvals.
- Generic 51–59 or low-signal high-priority leads are excluded from the default action set.
- Focus Leads only includes leads where:
  - `ai_priority IN ('urgent','priority')`; or
  - `ai_risk_level IN ('medium','high')`; or
  - `stage IN ('booked','proposal') AND ai_score >= 65`.
- Focus Leads excludes `ai_priority='high'` leads below score 70 when they do not have elevated risk.
- Failed Actions counts only unresolved failed customer-facing actions. A failed item is treated as resolved when the same lead has a newer completed/executed customer-facing fallback/action, so old Telegram failures resolved by newer email fallbacks do not appear as urgent sales work.
- Pending Approvals counts only actionable sales approvals: Telegram/email/follow-up/meeting/next-best-action items with `pending_approval` or `approved` status. It excludes stale lead scoring updates, noisy legacy actions, and generic low-signal `lead_priority_recommendation` items below score 70.
- Default UI sections remain compact:
  - Today’s Sales Actions: 10 visible by default;
  - Focus Leads: 6 visible by default;
  - Waiting for Approval: 6 visible by default;
  - Failed / Needs Fix: 5 unresolved visible by default.
- Overflow sections expose a `Show all` / collapse control instead of expanding noisy lists by default.
- The viewed timeline event is created only when the workspace-level `crm_activity` insert supports `lead_id = NULL`; otherwise the service skips safely and logs `[pipeline-copilot] workspace event skipped`.

Additional v2 logs:

- `[pipeline-copilot] manager reason sanitized`
- `[pipeline-copilot] unresolved failed filtered`
- `[pipeline-copilot] focus mode applied`
