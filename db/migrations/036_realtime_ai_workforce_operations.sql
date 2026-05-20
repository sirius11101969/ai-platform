CREATE TABLE IF NOT EXISTS ai_workforce_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  worker_id UUID,
  collaboration_id UUID,
  execution_plan_id UUID,
  severity TEXT NOT NULL DEFAULT 'info',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_workforce_events_workspace_published
  ON ai_workforce_events (workspace_id, published_at DESC);

CREATE TABLE IF NOT EXISTS ai_workforce_activity_stream (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES ai_workforce_events(id) ON DELETE CASCADE,
  stream_type TEXT NOT NULL DEFAULT 'workforce_event',
  summary TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_workforce_activity_stream_workspace_created
  ON ai_workforce_activity_stream (workspace_id, created_at DESC);

CREATE TABLE IF NOT EXISTS ai_workforce_realtime_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  metrics JSONB NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_workforce_realtime_metrics_workspace_computed
  ON ai_workforce_realtime_metrics (workspace_id, computed_at DESC);
