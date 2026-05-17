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
