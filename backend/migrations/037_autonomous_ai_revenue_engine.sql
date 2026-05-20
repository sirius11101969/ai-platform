CREATE TABLE IF NOT EXISTS ai_revenue_engine_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  snapshot_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_revenue_strategy_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  snapshot_id UUID NOT NULL REFERENCES ai_revenue_engine_snapshots(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL,
  impact_estimate TEXT NOT NULL,
  confidence_score NUMERIC(5,2) NOT NULL,
  urgency TEXT NOT NULL,
  requires_human_approval BOOLEAN NOT NULL DEFAULT TRUE,
  no_autonomous_execution BOOLEAN NOT NULL DEFAULT TRUE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_revenue_risk_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  snapshot_id UUID NOT NULL REFERENCES ai_revenue_engine_snapshots(id) ON DELETE CASCADE,
  risk_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  requires_human_approval BOOLEAN NOT NULL DEFAULT TRUE,
  no_autonomous_execution BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_revenue_optimization_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  memory_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
