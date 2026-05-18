CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS ai_voice_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  sequence_id UUID REFERENCES ai_lead_sequences(id) ON DELETE SET NULL,
  provider TEXT NOT NULL DEFAULT 'mock_provider',
  status TEXT NOT NULL DEFAULT 'queued',
  phone_number TEXT NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  transcript TEXT,
  summary TEXT,
  sentiment TEXT,
  outcome TEXT,
  next_action TEXT,
  recording_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ai_voice_calls_status_valid CHECK (status IN ('queued', 'dialing', 'active', 'completed', 'failed', 'rejected'))
);

CREATE TABLE IF NOT EXISTS ai_voice_call_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES ai_voice_calls(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ai_lead_scores DROP CONSTRAINT IF EXISTS ai_lead_scores_recommended_channel_check;
ALTER TABLE ai_lead_scores ADD CONSTRAINT ai_lead_scores_recommended_channel_check CHECK (recommended_channel IN ('telegram', 'email', 'crm', 'voice'));

ALTER TABLE ai_workers DROP CONSTRAINT IF EXISTS ai_workers_type_valid;
ALTER TABLE ai_workers ADD CONSTRAINT ai_workers_type_valid CHECK (type IN ('ai_sdr_agent', 'ai_followup_worker', 'ai_revenue_analyst', 'ai_revenue_brain', 'ai_voice_worker', 'ai_crm_assistant', 'ai_email_assistant', 'ai_telegram_assistant', 'ai_meeting_scheduler', 'ai_lead_scoring_engine', 'ai_next_best_action_engine'));

CREATE INDEX IF NOT EXISTS idx_ai_voice_calls_workspace_status
  ON ai_voice_calls(workspace_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_voice_calls_lead
  ON ai_voice_calls(workspace_id, lead_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_voice_call_events_call
  ON ai_voice_call_events(call_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_ai_execution_jobs_voice_outreach
  ON ai_execution_jobs(workspace_id, job_type, status, run_after, created_at DESC)
  WHERE job_type IN ('voice_outreach_call', 'voice_call_analysis');

CREATE INDEX IF NOT EXISTS idx_lead_timeline_events_ai_voice
  ON lead_timeline_events(workspace_id, lead_id, event_type, created_at DESC)
  WHERE event_type IN ('ai_voice_call_started', 'ai_voice_call_completed', 'ai_voice_call_failed', 'ai_voice_followup_recommended');
