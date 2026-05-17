-- Autonomous Follow-up Engine v1: queue-backed human-approved stale conversation drafts.

INSERT INTO ai_workers(workspace_id, name, type, status, mode, description)
SELECT w.id,
       'AI Follow-up Engine',
       'ai_followup_worker',
       'active',
       'approval_required',
       'Находит stale conversations и готовит безопасные follow-up drafts без автоотправки.'
  FROM workspaces w
ON CONFLICT (workspace_id, type) DO UPDATE
   SET name = 'AI Follow-up Engine',
       mode = 'approval_required',
       description = EXCLUDED.description,
       updated_at = NOW();

CREATE INDEX IF NOT EXISTS idx_ai_worker_queue_followup_sequence_dedup
  ON ai_worker_queue(workspace_id, lead_id, ((payload->>'sequenceStep')), status, created_at DESC)
  WHERE action_type = 'followup_sequence_draft';

CREATE INDEX IF NOT EXISTS idx_ai_worker_queue_followup_sequence_dashboard
  ON ai_worker_queue(workspace_id, action_type, status, executed_at, created_at DESC)
  WHERE action_type = 'followup_sequence_draft';
