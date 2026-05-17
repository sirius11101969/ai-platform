# AI Meeting Scheduler v1

## Goal

AI Meeting Scheduler v1 detects meeting/demo scheduling intent in inbound Telegram/email conversations and creates a safe approval-gated proposal for the manager. It never schedules a meeting or sends a confirmation automatically.

## Trigger signals

The v1 detector is rules-based and watches inbound text for Russian scheduling phrases:

- `сегодня`, `завтра`, `послезавтра`
- `в 15`, `в 15:00`, `в 3 дня`
- `созвон`, `демо`, `demo`, `удобно`, `давайте`, `встреча`
- Russian weekdays: `понедельник`, `вторник`, `среда/среду`, `четверг`, `пятница/пятницу`, `суббота`, `воскресенье`

Telegram inbound sync calls the detector after the inbound message is stored in CRM/timeline. The scheduler service is channel-aware and accepts `telegram` or `email`, so future inbound email processing can call the same `createMeetingScheduleProposal` function.

## Queue action

When intent is detected, the backend creates an `ai_worker_queue` item:

- `action_type`: `meeting_schedule_proposal`
- `status`: `pending_approval`
- `title`: `Запланировать встречу — {lead.name}`
- `recommendation`: `Клиент согласился на demo-созвон. Рекомендуется назначить встречу и перевести сделку в Booked.`

The payload stores:

```json
{
  "leadId": "uuid",
  "detectedDateText": "завтра",
  "detectedTimeText": "в 15:00",
  "proposedTitle": "Demo-созвон — Lead Name",
  "proposedStartTime": "2026-05-18T12:00:00.000Z",
  "durationMinutes": 30,
  "channel": "telegram",
  "sourceMessageId": "42",
  "confidence": 95,
  "calendar": {
    "provider": null,
    "externalEventId": null,
    "connectLater": true
  }
}
```

## Time parsing

The parser supports simple Russian relative dates and times. It uses `APP_TIMEZONE` when configured; default is `Europe/Moscow`, with `UTC` fallback if the configured timezone is invalid. Parsed times are stored as ISO UTC strings in `proposedStartTime`.

Examples:

- `Да, завтра в 15:00 удобно` in `Europe/Moscow` → next day at `15:00 MSK` (`12:00 UTC`)
- `Давайте послезавтра в 3 дня` → day after tomorrow at `15:00` local timezone

If a date/time is not fully parseable, the proposal is still created with the detected text and a null `proposedStartTime`, so the manager can edit the time before approval/execution.

## Approval Center UX

The AI Approval Center renders `meeting_schedule_proposal` with:

- lead name
- inbound message
- detected date/time text
- proposed start time
- proposed meeting title
- duration
- confidence
- channel
- approve/reject/execute controls
- edit time via manager prompt before execution

## Execution behavior

Execution is available only after manager approval.

When executed, the backend:

1. Optionally creates a CRM meeting/task record if `crm_meetings` or `crm_tasks` exists.
2. Updates the lead to stage/status `booked`.
3. Updates `crm_leads.next_step` to `Demo scheduled`.
4. Writes a `meeting_scheduled` timeline/activity event.
5. Marks the queue item `completed`.
6. Creates a separate `telegram_reply_draft` confirmation when the proposal came from Telegram:
   `Отлично, зафиксировал demo-созвон на {date/time}. До встречи!`

The confirmation is only a draft and still requires manager approval before sending.

## Dashboard metrics

Two metrics are exposed through approval/CRM stats and displayed in dashboard surfaces:

- `Meetings scheduled by AI`
- `Pending meeting proposals`

## Safety guarantees

- No auto-scheduling without manager approval.
- No auto-send confirmation without manager approval.
- Calendar integration is a placeholder only; payload reserves `calendar.provider` and `calendar.externalEventId` for a later Google Calendar connector.
