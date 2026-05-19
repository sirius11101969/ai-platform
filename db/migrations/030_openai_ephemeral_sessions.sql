CREATE TABLE IF NOT EXISTS ai_openai_realtime_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  signed_session_id TEXT NOT NULL UNIQUE,
  browser_token_hash TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'session_created',
  transport TEXT NOT NULL DEFAULT 'webrtc',
  reconnect_count INTEGER NOT NULL DEFAULT 0,
  refresh_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  session_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_openai_realtime_session_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ai_openai_realtime_sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_openai_realtime_sessions_workspace_created ON ai_openai_realtime_sessions(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_openai_realtime_session_events_session_created ON ai_openai_realtime_session_events(session_id, created_at ASC);
