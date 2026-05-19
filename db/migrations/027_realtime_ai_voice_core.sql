CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS ai_realtime_voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  call_id UUID REFERENCES ai_voice_calls(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'initializing',
  transport TEXT NOT NULL DEFAULT 'mock_stream',
  provider TEXT NOT NULL DEFAULT 'mock_realtime_provider',
  session_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  latency_ms INTEGER CHECK (latency_ms IS NULL OR latency_ms >= 0),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ai_realtime_voice_sessions_status_valid CHECK (status IN ('initializing', 'listening', 'speaking', 'interrupted', 'completed', 'failed'))
);

CREATE TABLE IF NOT EXISTS ai_realtime_voice_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ai_realtime_voice_sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_realtime_voice_sessions_workspace_status
  ON ai_realtime_voice_sessions(workspace_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_realtime_voice_sessions_lead
  ON ai_realtime_voice_sessions(workspace_id, lead_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_realtime_voice_events_session
  ON ai_realtime_voice_events(session_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_ai_realtime_voice_events_type
  ON ai_realtime_voice_events(event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lead_timeline_events_realtime_voice
  ON lead_timeline_events(workspace_id, lead_id, event_type, created_at DESC)
  WHERE event_type IN ('realtime_voice_started', 'realtime_voice_interrupted', 'realtime_voice_completed');
