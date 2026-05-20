CREATE TABLE IF NOT EXISTS ai_executive_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  snapshot_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  recommendation_only BOOLEAN NOT NULL DEFAULT true,
  requires_human_approval BOOLEAN NOT NULL DEFAULT true,
  no_autonomous_execution BOOLEAN NOT NULL DEFAULT true,
  no_customer_contact BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS ai_executive_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), workspace_id UUID NOT NULL, recommendation_type TEXT NOT NULL, recommendation_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  impact_estimate TEXT, confidence_score NUMERIC(5,2), urgency TEXT,
  recommendation_only BOOLEAN NOT NULL DEFAULT true, requires_human_approval BOOLEAN NOT NULL DEFAULT true, no_autonomous_execution BOOLEAN NOT NULL DEFAULT true, no_customer_contact BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS ai_executive_risk_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), workspace_id UUID NOT NULL, risk_type TEXT NOT NULL, severity TEXT NOT NULL, risk_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  recommendation_only BOOLEAN NOT NULL DEFAULT true, requires_human_approval BOOLEAN NOT NULL DEFAULT true, no_autonomous_execution BOOLEAN NOT NULL DEFAULT true, no_customer_contact BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS ai_executive_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), workspace_id UUID NOT NULL, memory_key TEXT NOT NULL, memory_payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS ai_department_coordination (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), workspace_id UUID NOT NULL, department_name TEXT NOT NULL, coordination_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  recommendation_only BOOLEAN NOT NULL DEFAULT true, requires_human_approval BOOLEAN NOT NULL DEFAULT true, no_autonomous_execution BOOLEAN NOT NULL DEFAULT true, no_customer_contact BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS ai_organizational_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), workspace_id UUID NOT NULL, health_score INTEGER NOT NULL, health_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  recommendation_only BOOLEAN NOT NULL DEFAULT true, requires_human_approval BOOLEAN NOT NULL DEFAULT true, no_autonomous_execution BOOLEAN NOT NULL DEFAULT true, no_customer_contact BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now());
