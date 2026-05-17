-- AI Meeting Scheduler v1: meeting proposals, lead next step, and dashboard indexes.
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS next_step TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_ai_worker_queue_meeting_scheduler
  ON ai_worker_queue(workspace_id, lead_id, status, created_at DESC)
  WHERE action_type = 'meeting_schedule_proposal';

CREATE INDEX IF NOT EXISTS idx_lead_timeline_events_meeting_scheduler
  ON lead_timeline_events(workspace_id, lead_id, event_type, created_at DESC)
  WHERE event_type IN ('ai_meeting_schedule_proposed', 'meeting_scheduled');
