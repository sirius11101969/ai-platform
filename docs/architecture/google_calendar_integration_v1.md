# Google Calendar + Google Meet Integration v1

Google Calendar Integration v1 extends the AS6 AI CRM meeting execution flow. After an approved `meeting_schedule_proposal` is executed and a `crm_meetings` row is created, the backend tries to create a Google Calendar event with a Google Meet conference link. The existing ICS flow remains the safe fallback and is never blocked by missing Google credentials or Google API failures.

## Runtime behavior

1. AI Meeting Scheduler creates an approved `meeting_schedule_proposal`.
2. Manager executes the proposal in AI Workers / Approval Center.
3. Backend creates or reuses the `crm_meetings` row and always generates `ics_content`.
4. If Google Calendar is disabled or credentials are incomplete, the meeting remains `calendar_provider='ics'` and `calendar_status='ics_ready'`.
5. If Google Calendar is configured, the backend creates one Google Calendar event with `conferenceData.createRequest` to request a Google Meet link.
6. On success, the meeting stores `google_event_id`, `google_meet_url`, `calendar_provider='google'`, `calendar_status='synced'`, and `calendar_synced_at=now()`.
7. On failure, execution still succeeds, ICS remains available, and the meeting stores `calendar_error` with `calendar_provider='ics'` and `calendar_status='ics_ready'`.

## Environment variables

```bash
GOOGLE_CALENDAR_ENABLED=false
GOOGLE_CALENDAR_ID=
GOOGLE_CLIENT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_PROJECT_ID=
```

Notes:

- Keep `GOOGLE_CALENDAR_ENABLED=false` for the default ICS-only mode.
- `GOOGLE_PRIVATE_KEY` may be provided with escaped newlines (`\n`); the backend normalizes them before signing the service-account JWT.
- Missing values are treated as a graceful fallback, not a startup error.

## Google Cloud setup

1. Create or select a Google Cloud project.
2. Enable **Google Calendar API** in the project.
3. Create a **service account** for AS6 Calendar sync.
4. Create a JSON key for the service account.
5. Copy these JSON fields into environment variables:
   - `project_id` → `GOOGLE_PROJECT_ID`
   - `client_email` → `GOOGLE_CLIENT_EMAIL`
   - `private_key` → `GOOGLE_PRIVATE_KEY`
6. Open the target Google Calendar settings.
7. Share the target calendar with the service account email (`GOOGLE_CLIENT_EMAIL`) and grant permission to create/change events.
8. Copy the calendar id into `GOOGLE_CALENDAR_ID`.
9. Set `GOOGLE_CALENDAR_ENABLED=true` and redeploy.

## Deploy commands

```bash
# build and restart with Docker Compose
 docker compose build backend frontend
 docker compose up -d

# or backend-only restart when env vars changed outside the image
 docker compose up -d --force-recreate backend
```

## Database fields

`crm_meetings` includes the existing calendar v1 fields plus Google sync metadata:

- `calendar_provider text` — `google` or `ics`.
- `calendar_status text` — `synced`, `ics_ready`, or `pending`.
- `ics_uid text` and `ics_content text` — preserved fallback invitation.
- `google_event_id text` — Google Calendar event id.
- `google_meet_url text` — Google Meet video URL.
- `calendar_error text` — last Google sync error, when fallback was used.
- `calendar_synced_at timestamptz` — time of successful Google sync.

## Safety and idempotency

- Google sync is optional and does not crash startup or meeting execution when disabled.
- `ai_worker_queue_id` remains unique for meeting rows, so the same proposal reuses the same CRM meeting.
- If `google_event_id` already exists, the backend does not create another Google event.
- ICS content is generated before Google sync and remains downloadable from `GET /api/crm/meetings/:id/ics`.

## User-facing UI

- CRM lead modal shows provider, calendar status, Google Meet URL, Google Meet open button, ICS download button, and calendar error when present.
- AI Workers completed meeting proposal cards show CRM meeting creation, Google synced badge or ICS ready badge, Meet link when available, and ICS download.
- Telegram confirmation draft includes `Ссылка на встречу: {google_meet_url}` when Google Meet exists; otherwise it tells the manager the calendar invitation is ready separately.

## Verification

### ICS fallback

```bash
GOOGLE_CALENDAR_ENABLED=false
```

Expected:

- meeting execution completes;
- `crm_meetings.ics_content` is present;
- `calendar_provider='ics'`;
- `calendar_status='ics_ready'`;
- backend logs `[calendar] google disabled, using ics fallback`.

### Google Calendar sync

```bash
GOOGLE_CALENDAR_ENABLED=true
GOOGLE_CALENDAR_ID=your-calendar-id
GOOGLE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_PROJECT_ID=your-project-id
```

Expected:

- meeting execution completes;
- Google Calendar event is created;
- `google_event_id` is saved;
- `google_meet_url` is saved;
- `calendar_provider='google'`;
- `calendar_status='synced'`;
- Telegram confirmation draft contains the Meet link;
- backend logs `[calendar] google event created`.
