-- AI Next Best Action Engine v1: deterministic manager-approved next best actions.

ALTER TABLE ai_workers DROP CONSTRAINT IF EXISTS ai_workers_type_valid;
ALTER TABLE ai_workers ADD CONSTRAINT ai_workers_type_valid CHECK (type IN ('ai_sdr_agent', 'ai_followup_worker', 'ai_revenue_analyst', 'ai_crm_assistant', 'ai_email_assistant', 'ai_telegram_assistant', 'ai_meeting_scheduler', 'ai_lead_scoring_engine', 'ai_next_best_action_engine'));

INSERT INTO ai_workers(workspace_id, name, type, status, mode, description)
SELECT w.id,
       'AI Next Best Action Engine',
       'ai_next_best_action_engine',
       'active',
       'approval_required',
       'Детерминированно выбирает безопасное следующее действие по каждому активному лиду и ставит его на approval менеджеру.'
  FROM workspaces w
ON CONFLICT (workspace_id, type) DO UPDATE
   SET name = EXCLUDED.name,
       status = 'active',
       mode = EXCLUDED.mode,
       description = EXCLUDED.description,
       updated_at = NOW();

CREATE INDEX IF NOT EXISTS idx_ai_worker_queue_next_best_action_dedup
  ON ai_worker_queue(workspace_id, lead_id, action_type, status, ((payload->>'source')), created_at DESC)
  WHERE payload->>'source' = 'next_best_action_engine'
    AND status IN ('pending_approval', 'approved');

CREATE INDEX IF NOT EXISTS idx_ai_worker_queue_next_best_action_metrics
  ON ai_worker_queue(workspace_id, status, created_at DESC)
  WHERE payload->>'source' = 'next_best_action_engine';

CREATE INDEX IF NOT EXISTS idx_lead_timeline_events_next_best_action
  ON lead_timeline_events(workspace_id, lead_id, event_type, created_at DESC)
  WHERE event_type = 'next_best_action_generated';
