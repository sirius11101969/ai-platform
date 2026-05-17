-- Calendar Integration v1: internal ICS calendar records for AI scheduled meetings.
ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS meeting_url TEXT;
ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS calendar_status TEXT DEFAULT 'pending';
ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS calendar_provider TEXT DEFAULT 'internal';
ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS ics_uid TEXT;
ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS ics_content TEXT;
ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/Moscow';

CREATE INDEX IF NOT EXISTS idx_crm_meetings_calendar_status
  ON crm_meetings(workspace_id, calendar_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lead_timeline_events_calendar_ics_created
  ON lead_timeline_events(workspace_id, lead_id, event_type, created_at DESC)
  WHERE event_type = 'calendar_ics_created';
