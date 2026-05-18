CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS ai_lead_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  priority_score INTEGER NOT NULL DEFAULT 0 CHECK (priority_score BETWEEN 0 AND 100),
  close_probability INTEGER NOT NULL DEFAULT 0 CHECK (close_probability BETWEEN 0 AND 100),
  engagement_score INTEGER NOT NULL DEFAULT 0 CHECK (engagement_score BETWEEN 0 AND 100),
  churn_risk INTEGER NOT NULL DEFAULT 0 CHECK (churn_risk BETWEEN 0 AND 100),
  pipeline_health INTEGER NOT NULL DEFAULT 0 CHECK (pipeline_health BETWEEN 0 AND 100),
  recommended_action TEXT NOT NULL DEFAULT '',
  recommended_channel TEXT NOT NULL DEFAULT 'crm' CHECK (recommended_channel IN ('telegram', 'email', 'crm')),
  reasoning_summary TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT 'deterministic-revenue-brain-v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, lead_id)
);

CREATE TABLE IF NOT EXISTS ai_revenue_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  forecast_period TEXT NOT NULL,
  projected_revenue NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (projected_revenue >= 0),
  confidence_score INTEGER NOT NULL DEFAULT 0 CHECK (confidence_score BETWEEN 0 AND 100),
  active_pipeline_value NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (active_pipeline_value >= 0),
  hot_leads_count INTEGER NOT NULL DEFAULT 0 CHECK (hot_leads_count >= 0),
  stalled_leads_count INTEGER NOT NULL DEFAULT 0 CHECK (stalled_leads_count >= 0),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ai_workers DROP CONSTRAINT IF EXISTS ai_workers_type_valid;
ALTER TABLE ai_workers ADD CONSTRAINT ai_workers_type_valid CHECK (type IN ('ai_sdr_agent', 'ai_followup_worker', 'ai_revenue_analyst', 'ai_revenue_brain', 'ai_crm_assistant', 'ai_email_assistant', 'ai_telegram_assistant', 'ai_meeting_scheduler', 'ai_lead_scoring_engine', 'ai_next_best_action_engine'));

INSERT INTO ai_workers(workspace_id, name, type, status, mode, description)
SELECT w.id,
       'AI Revenue Brain',
       'ai_revenue_brain',
       'active',
       'approval_required',
       'Continuously scores lead priority, close probability, churn risk, pipeline health, next best action, and revenue forecast.'
  FROM workspaces w
ON CONFLICT (workspace_id, type) DO UPDATE
   SET name = EXCLUDED.name,
       status = 'active',
       mode = EXCLUDED.mode,
       description = EXCLUDED.description,
       updated_at = NOW();

CREATE INDEX IF NOT EXISTS idx_ai_lead_scores_workspace_priority
  ON ai_lead_scores(workspace_id, priority_score DESC, close_probability DESC, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_lead_scores_risk
  ON ai_lead_scores(workspace_id, churn_risk DESC, pipeline_health ASC, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_revenue_forecasts_workspace_period
  ON ai_revenue_forecasts(workspace_id, forecast_period, generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_execution_jobs_revenue_brain
  ON ai_execution_jobs(workspace_id, job_type, status, run_after, created_at DESC)
  WHERE job_type IN ('lead_intelligence_analysis', 'revenue_forecast_generation');

CREATE INDEX IF NOT EXISTS idx_ai_worker_queue_revenue_next_best_action
  ON ai_worker_queue(workspace_id, lead_id, status, created_at DESC)
  WHERE action_type = 'revenue_next_best_action';

CREATE INDEX IF NOT EXISTS idx_lead_timeline_events_revenue_intelligence
  ON lead_timeline_events(workspace_id, lead_id, event_type, created_at DESC)
  WHERE event_type = 'ai_revenue_intelligence_updated';
