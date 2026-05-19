CREATE TABLE IF NOT EXISTS ai_sdr_lead_states (
  id BIGSERIAL PRIMARY KEY,
  workspace_id UUID NOT NULL,
  lead_id UUID,
  session_id UUID,
  lead_state TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ai_next_best_actions (
  id BIGSERIAL PRIMARY KEY,
  workspace_id UUID NOT NULL,
  lead_id UUID,
  session_id UUID,
  actions TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ai_followup_strategies (
  id BIGSERIAL PRIMARY KEY,
  workspace_id UUID NOT NULL,
  lead_id UUID,
  session_id UUID,
  urgency_level TEXT NOT NULL,
  suggested_timing TEXT NOT NULL,
  recommended_channel TEXT NOT NULL,
  messaging_style TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ai_handoff_recommendations (
  id BIGSERIAL PRIMARY KEY,
  workspace_id UUID NOT NULL,
  lead_id UUID,
  session_id UUID,
  priority TEXT NOT NULL,
  owner_role TEXT NOT NULL,
  reasons TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
