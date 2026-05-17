-- AI Lead Scoring Engine v1: deterministic lead scoring fields, worker, queue action indexes.

ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS ai_score INTEGER DEFAULT 0;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS ai_priority VARCHAR(20) DEFAULT 'medium';
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS ai_risk_level VARCHAR(20) DEFAULT 'low';
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS ai_temperature VARCHAR(20) DEFAULT 'warm';
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS ai_last_scored_at TIMESTAMPTZ;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS ai_scoring_reason TEXT;

UPDATE crm_leads
   SET ai_score = COALESCE(ai_score, 0),
       ai_priority = COALESCE(NULLIF(ai_priority, ''), 'medium'),
       ai_risk_level = COALESCE(NULLIF(ai_risk_level, ''), 'low'),
       ai_temperature = COALESCE(NULLIF(ai_temperature, ''), 'warm');

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'crm_leads_ai_score_range') THEN
    ALTER TABLE crm_leads ADD CONSTRAINT crm_leads_ai_score_range CHECK (ai_score >= 0 AND ai_score <= 100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'crm_leads_ai_priority_valid') THEN
    ALTER TABLE crm_leads ADD CONSTRAINT crm_leads_ai_priority_valid CHECK (ai_priority IN ('low', 'medium', 'high', 'priority', 'urgent'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'crm_leads_ai_risk_level_valid') THEN
    ALTER TABLE crm_leads ADD CONSTRAINT crm_leads_ai_risk_level_valid CHECK (ai_risk_level IN ('low', 'medium', 'high'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'crm_leads_ai_temperature_valid') THEN
    ALTER TABLE crm_leads ADD CONSTRAINT crm_leads_ai_temperature_valid CHECK (ai_temperature IN ('cold', 'warm', 'hot', 'priority'));
  END IF;
END $$;

ALTER TABLE ai_workers DROP CONSTRAINT IF EXISTS ai_workers_type_valid;
ALTER TABLE ai_workers ADD CONSTRAINT ai_workers_type_valid CHECK (type IN ('ai_sdr_agent', 'ai_followup_worker', 'ai_revenue_analyst', 'ai_crm_assistant', 'ai_email_assistant', 'ai_telegram_assistant', 'ai_meeting_scheduler', 'ai_lead_scoring_engine'));

INSERT INTO ai_workers(workspace_id, name, type, status, mode, description)
SELECT w.id,
       'AI Lead Scoring Engine',
       'ai_lead_scoring_engine',
       'active',
       'approval_required',
       'Детерминированно пересчитывает AI score, priority, temperature и risk для CRM лидов.'
  FROM workspaces w
ON CONFLICT (workspace_id, type) DO UPDATE
   SET name = EXCLUDED.name,
       status = 'active',
       mode = EXCLUDED.mode,
       description = EXCLUDED.description,
       updated_at = NOW();

CREATE INDEX IF NOT EXISTS idx_crm_leads_ai_lead_scoring_dashboard
  ON crm_leads(workspace_id, ai_priority, ai_risk_level, ai_temperature, ai_score DESC, ai_last_scored_at DESC)
  WHERE status NOT IN ('won', 'lost');

CREATE INDEX IF NOT EXISTS idx_ai_worker_queue_lead_scoring_update
  ON ai_worker_queue(workspace_id, lead_id, status, created_at DESC)
  WHERE action_type = 'lead_scoring_update';

CREATE INDEX IF NOT EXISTS idx_ai_worker_queue_lead_priority_recommendation
  ON ai_worker_queue(workspace_id, lead_id, status, created_at DESC)
  WHERE action_type = 'lead_priority_recommendation';

CREATE INDEX IF NOT EXISTS idx_lead_timeline_events_lead_scoring
  ON lead_timeline_events(workspace_id, lead_id, event_type, created_at DESC)
  WHERE event_type IN ('lead_scored', 'lead_risk_detected');
