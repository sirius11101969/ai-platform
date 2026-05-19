CREATE TABLE IF NOT EXISTS ai_live_stream_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES crm_leads(id) ON DELETE SET NULL,
  realtime_voice_session_id UUID REFERENCES ai_realtime_voice_sessions(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'starting',
  stream_mode TEXT NOT NULL DEFAULT 'sse',
  simulation_safety JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_live_stream_sessions_workspace_created ON ai_live_stream_sessions(workspace_id, created_at DESC);

CREATE TABLE IF NOT EXISTS ai_live_stream_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ai_live_stream_sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_live_stream_events_session_created ON ai_live_stream_events(session_id, created_at ASC);
