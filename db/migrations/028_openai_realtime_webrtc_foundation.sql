CREATE TABLE IF NOT EXISTS ai_realtime_transport_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  realtime_session_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  transport TEXT NOT NULL,
  state TEXT NOT NULL,
  connection_quality TEXT,
  latency_ms INTEGER CHECK (latency_ms IS NULL OR latency_ms >= 0),
  session_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_realtime_transport_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transport_session_id UUID NOT NULL REFERENCES ai_realtime_transport_sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_realtime_transport_sessions_workspace_state
  ON ai_realtime_transport_sessions(workspace_id, state, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_realtime_transport_events_session
  ON ai_realtime_transport_events(transport_session_id, created_at ASC);
