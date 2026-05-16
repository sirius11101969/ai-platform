ALTER TABLE ai_followup_jobs DROP CONSTRAINT IF EXISTS ai_followup_jobs_status_valid;
ALTER TABLE ai_followup_jobs ADD CONSTRAINT ai_followup_jobs_status_valid
  CHECK (status IN ('suggested', 'approved', 'rejected', 'sent', 'failed', 'replied'));

ALTER TABLE ai_followup_attempts DROP CONSTRAINT IF EXISTS ai_followup_attempts_status_valid;
ALTER TABLE ai_followup_attempts ADD CONSTRAINT ai_followup_attempts_status_valid
  CHECK (status IN ('suggested', 'approved', 'rejected', 'sent', 'failed', 'replied'));

CREATE INDEX IF NOT EXISTS idx_ai_worker_queue_real_comm_actions
  ON ai_worker_queue(workspace_id, lead_id, action_type, status, created_at DESC)
  WHERE action_type IN ('telegram_draft', 'email_draft', 'followup_24h', 'followup_3d', 'demo_offer', 'meeting_request', 'move_lead_stage');

CREATE INDEX IF NOT EXISTS idx_lead_timeline_events_real_comm
  ON lead_timeline_events(workspace_id, lead_id, event_type, created_at DESC)
  WHERE event_type IN ('ai_draft_created', 'ai_draft_approved', 'telegram_sent', 'email_sent', 'send_failed', 'lead_replied', 'ai_stage_suggested');
