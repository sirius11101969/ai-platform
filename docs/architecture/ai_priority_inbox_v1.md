# AI Priority Inbox v1

## Purpose

AI Priority Inbox v1 is a dedicated sales cockpit for AS6 AI CRM. It turns existing AI lead scoring, follow-up, meeting, Telegram, email, and approval data into a compact manager queue that answers three questions:

1. **Who should be contacted now?**
2. **Why does this lead matter?**
3. **What should the manager do next?**

The first version is deterministic: it does not call an LLM at request time. It uses existing CRM and AI fields to produce explainable `next_best_action` values.

## Frontend

### Route

- `/priority-inbox`
- Navigation label: **AI Priority Inbox**

### Page structure

The page includes:

- Metric widgets:
  - Urgent Leads
  - Priority Leads
  - At-Risk Deals
  - Meetings Pending
  - Follow-ups Needed
- Filters:
  - All
  - Urgent
  - Priority
  - At Risk
  - Needs Follow-up
  - Meetings
  - No Response >3d
- Compact lead cards showing:
  - lead name
  - company/email/Telegram fallback
  - CRM stage
  - `ai_score`
  - `ai_priority`
  - `ai_temperature`
  - `ai_risk_level`
  - `ai_scoring_reason`
  - last activity summary
  - deterministic next suggested action
- Action buttons:
  - Telegram
  - Email
  - Create Follow-up
  - Schedule Demo
  - Open CRM Lead

### CRM integration

The page routes CRM-specific actions to the lead detail modal through `/crm?leadId=<id>` with optional `focus` hints. `Create Follow-up` directly calls the existing CRM follow-up endpoint so the lead is immediately enriched with an AI follow-up draft/note when possible.

## Backend

### Endpoint

```http
GET /api/ai/priority-inbox
```

Authentication and workspace scoping use the same middleware as other `/api/ai` routes.

### Response shape

```json
{
  "leads": [
    {
      "leadId": "uuid",
      "name": "Lead name",
      "company": "Company",
      "email": "lead@example.com",
      "stage": "Предложение",
      "status": "proposal",
      "ai_score": 82,
      "ai_priority": "high",
      "ai_temperature": "hot",
      "ai_risk_level": "medium",
      "ai_scoring_reason": "Reason from scoring engine",
      "lastActivityAt": "2026-05-17T10:00:00.000Z",
      "lastActivitySummary": "Последний входящий контакт в Telegram",
      "next_best_action": "Риск потери сделки",
      "nextBestActionReason": "Сделка на этапе предложения имеет средний или высокий AI risk.",
      "nextBestActionCode": "deal_loss_risk",
      "actionUrls": {
        "telegram": "/crm?leadId=<id>&focus=telegram",
        "email": "/crm?leadId=<id>&focus=email",
        "followup": "/crm?leadId=<id>&focus=followup",
        "demo": "/crm?leadId=<id>&focus=meeting",
        "lead": "/crm?leadId=<id>"
      }
    }
  ],
  "metrics": {
    "urgentLeads": 0,
    "priorityLeads": 0,
    "atRiskDeals": 0,
    "meetingsPending": 0,
    "followUpsNeeded": 0
  },
  "generatedAt": "2026-05-17T10:00:00.000Z"
}
```

## Deterministic suggested action engine

Priority order:

1. `booked` + pending meeting/calendar confirmation → **Подтвердить встречу**
2. `hot` + no fresh activity for 3+ days → **Сделать срочный follow-up**
3. `proposal` + medium/high risk → **Риск потери сделки**
4. pricing/budget interest + no demo/meeting → **Назначить demo**
5. warm lead + recent inbound activity → **Ответить сегодня**
6. urgent priority → **Связаться сегодня**
7. proposal without stronger signal → **Отправить pricing**
8. high score/high priority → **Связаться сегодня**
9. no fresh activity for 3+ days → **Сделать follow-up**
10. fallback → **Сделать follow-up**

## Sorting

Default backend sorting is stable and explainable:

1. urgent leads first
2. high-risk deals
3. booked/proposal stages
4. highest AI score
5. newest activity

## Timeline and logging

Each inbox request logs:

```text
[priority-inbox] inbox requested
```

Each generated next action logs:

```text
[priority-inbox] action generated
```

For returned leads, the backend writes timeline events:

- `ai_priority_inbox_viewed`
- `ai_next_action_generated`

Timeline event writes are best-effort and do not fail the inbox response if a timeline insert fails.

## Customer-facing copy guard

Outbound customer copy is protected by a reusable backend guard, `assertCustomerSafeText(text)`, before any customer-reachable execution path sends or queues text. The guard is intentionally conservative for AI-generated drafts and blocks internal scoring/debug context such as:

- `Контекст:`, `Плюсы:`, `Минусы:`, `Итог:`
- `ai_score`, `ai_priority`, `ai_risk_level`
- `score`, `intent`, `priority`, `urgent`, `risk`, `confidence`
- numeric scoring deltas like `+8` or `+18`

The guard runs for Priority Inbox and approval-queue customer draft execution including `telegram_reply_draft`, `email_followup_draft`, `followup_sequence_draft`, and Telegram meeting confirmation drafts. It also protects direct Telegram/email service send paths.

If unsafe copy is detected during queue execution, the send is not attempted. The queue item is marked `failed`, `error_message` is set to `Blocked by copy guard: internal AI context leak`, and the backend emits:

```text
[copy-guard] blocked internal context leak
```

Permanent regression coverage lives in the backend copy guard test suite and can be run with:

```bash
npm run test:copy-guard
```

## Verification checklist

- `/priority-inbox` loads for authenticated users.
- Urgent leads sort before non-urgent leads.
- Suggested actions match the deterministic rules above.
- Filters update the visible card set without reloading.
- Metric widgets are computed from the same normalized inbox items as the cards.
- Card buttons route to the CRM lead or call the existing follow-up workflow.

## Focus Mode v2

Focus Mode v2 turns the overloaded Priority Inbox into the default executive sales cockpit. The default route still uses `/priority-inbox`, but the page now requests the focused API mode by default:

```http
GET /api/ai/priority-inbox?mode=focus
```

Supported modes are:

- `focus`
- `urgent`
- `risk`
- `meetings`
- `followups`
- `all`

### Default Focus rules

`focus` mode includes only leads that satisfy at least one executive signal:

1. `ai_priority IN ('priority', 'urgent')`
2. `ai_risk_level IN ('medium', 'high')`
3. `stage/status IN ('proposal', 'booked')` with `ai_score >= 65`

Generic noisy leads such as `ai_priority='high'`, `ai_score < 70`, and low/no risk are intentionally excluded from Focus Mode. They remain visible only in **All Leads**.

### Tabs

The frontend replaces the broader v1 filters with API-backed tabs:

- **Focus** — default selected mode.
- **Urgent** — urgent leads and urgent follow-up actions.
- **At Risk** — medium/high risk deals.
- **Meetings** — leads with pending/today/known meetings or booked stage.
- **Follow-ups** — leads that need a follow-up or have 3+ days without response.
- **All Leads** — all active CRM leads, including generic high/hot 51–59 leads.

### Metrics recalibration

Top widgets now show executive attention metrics computed from all active normalized inbox items, not from the currently selected tab:

- `urgentLeads` — urgent action count.
- `focusLeads` — count of leads matching Focus rules; generic high leads are not counted.
- `atRiskDeals` — medium/high risk deals and risk action recommendations.
- `meetingsToday` — meetings scheduled for today.
- `followUpsNeeded` — follow-up actions or 3+ no-response days.

### Focus sorting

Focus Mode sorts for attention rather than raw volume:

1. urgent
2. at-risk `proposal`/`booked` deals
3. meetings pending/today/booked
4. priority leads
5. remaining risk/focus signals
6. score and latest activity as tie-breakers

The expected result is usually a compact set of 3–8 highly actionable cards such as Telegram Connect Test, Дмитрий Волков, Алексей Морозов, and Мария Кузнецова, while generic score 51–59 leads disappear from the default page.

### Visual hierarchy

The UI applies stronger executive emphasis to the highest-signal cards:

- urgent cards receive the strongest border, glow, and larger next-action emphasis;
- risk cards receive a warning border/background;
- meeting cards receive a calendar accent and `MEETING` badge.

### Next-best-action updates

The deterministic action engine now avoids repetitive `Назначить demo` recommendations. It prefers context-aware actions such as:

- `Подтвердить встречу`
- `Подготовиться к встрече`
- `Сделать follow-up сегодня`
- `Риск потери сделки`
- `Отправить pricing`
- `Согласовать demo`
- `Оставить в nurture` for low-signal leads visible only in All Leads

If `stage/status=booked`, or a meeting already exists, the engine does not suggest `Назначить demo`; it suggests confirmation, preparation, alignment, or follow-up instead.

### Logging

When the default mode is applied, the backend emits:

```text
[priority-inbox] focus mode applied
```
