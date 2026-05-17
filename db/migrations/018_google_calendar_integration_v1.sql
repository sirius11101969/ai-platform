-- Google Calendar + Google Meet Integration v1.
ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS google_event_id TEXT;
ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS google_meet_url TEXT;
ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS calendar_error TEXT;
ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS calendar_synced_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_crm_meetings_google_event_id
  ON crm_meetings(workspace_id, google_event_id)
  WHERE google_event_id IS NOT NULL AND google_event_id <> '';
