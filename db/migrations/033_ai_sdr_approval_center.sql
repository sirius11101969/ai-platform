CREATE TABLE IF NOT EXISTS ai_approval_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  originating_session_id text,
  lead_id uuid REFERENCES crm_leads(id) ON DELETE SET NULL,
  recommendation_type text NOT NULL,
  recommendation_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  confidence_score numeric(5,2) NOT NULL DEFAULT 0,
  urgency text NOT NULL DEFAULT 'normal',
  approval_status text NOT NULL DEFAULT 'pending_approval',
  assigned_manager_id uuid REFERENCES users(id) ON DELETE SET NULL,
  snoozed_until timestamptz,
  escalated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_approval_queue_workspace_status ON ai_approval_queue(workspace_id, approval_status, created_at DESC);

CREATE TABLE IF NOT EXISTS ai_approval_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  queue_id uuid NOT NULL REFERENCES ai_approval_queue(id) ON DELETE CASCADE,
  actor_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL,
  reason text,
  previous_status text NOT NULL,
  new_status text NOT NULL,
  snooze_until timestamptz,
  assigned_manager_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_approval_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  queue_id uuid NOT NULL REFERENCES ai_approval_queue(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  reason text,
  previous_status text,
  new_status text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
