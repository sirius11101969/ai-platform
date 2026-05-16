CREATE INDEX IF NOT EXISTS idx_ai_worker_queue_outreach_dedup
  ON ai_worker_queue(workspace_id, lead_id, action_type, ((payload->>'outreachType')), created_at DESC)
  WHERE action_type IN ('telegram_draft', 'email_draft');

CREATE INDEX IF NOT EXISTS idx_ai_worker_queue_outreach_dashboard
  ON ai_worker_queue(workspace_id, action_type, status, created_at DESC)
  WHERE action_type IN ('telegram_draft', 'email_draft');
