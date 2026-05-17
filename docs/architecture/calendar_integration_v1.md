# Calendar Integration v1

## Purpose

Calendar Integration v1 makes AS6 AI CRM meetings calendar-ready when an approved `meeting_schedule_proposal` is executed. It does **not** require Google OAuth and does **not** auto-send calendar files to leads.

## Scope

When the AI Meeting Scheduler execution creates or updates a `crm_meetings` record, the backend now also generates an internal ICS event and stores it on that meeting.

The v1 flow is:

1. Manager approves and executes a `meeting_schedule_proposal`.
2. Backend creates/updates `crm_meetings` with the scheduled time, duration, lead context, and calendar fields.
3. Backend generates RFC5545-style ICS content with `STATUS:CONFIRMED` and `TZID:Europe/Moscow`.
4. Backend stores the content in `crm_meetings.ics_content` and marks `calendar_status='ics_ready'`, `calendar_provider='ics'`.
5. CRM timeline receives `calendar_ics_created`.
6. Telegram confirmation draft remains a text draft only and includes a note that the calendar invitation is ready for separate manager handling.
7. UI exposes a “Скачать .ics” button in CRM lead meeting details and AI Workers completed proposal cards.

## Data model

`crm_meetings` has the calendar v1 fields:

- `description text`
- `location text`
- `meeting_url text`
- `calendar_status text default 'pending'`
- `calendar_provider text default 'internal'`
- `ics_uid text`
- `ics_content text`
- `timezone text default 'Europe/Moscow'`

Calendar v1 stores the file body directly in Postgres so downloads are deterministic and do not depend on external storage.

## ICS generation

The generated event uses:

- `SUMMARY` from the meeting/proposal title.
- `DTSTART;TZID=Europe/Moscow` from the proposal start time.
- `DTEND;TZID=Europe/Moscow` from start time plus `duration_minutes`.
- `DESCRIPTION` containing lead name, channel, and source inbound message.
- Stable UID: workspace + AI queue id based, under the configured ICS UID domain.
- `STATUS:CONFIRMED`.
- A simple Moscow `VTIMEZONE` block.

## API

`GET /api/crm/meetings/:id/ics`

Response headers:

- `Content-Type: text/calendar; charset=utf-8`
- `Content-Disposition: attachment; filename="as6-demo-meeting.ics"`

The endpoint uses existing CRM auth/workspace middleware and only returns a meeting if the current user owns the lead in the active workspace.

## UI behavior

### CRM lead modal

The meeting section shows:

- scheduled meeting title;
- start time;
- duration;
- meeting/calendar status;
- “Скачать .ics” button when ICS content exists;
- “Google Calendar скоро” placeholder.

### AI Workers

Completed `meeting_schedule_proposal` cards show:

- CRM meeting created;
- ICS ready badge;
- “Скачать .ics” button.

## Safety constraints

- Google OAuth is not required.
- Telegram confirmation still uses approval/send flow.
- ICS files are not auto-sent to Telegram or email.
- Managers download and send calendar files manually if needed.

## Future work

- Google Calendar OAuth connection.
- External calendar event IDs and sync status.
- Optional manager-controlled attachment sending.
- Regeneration UI for edited meeting time or duration.
