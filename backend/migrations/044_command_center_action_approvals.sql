ALTER TABLE ai_command_center_actions
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by text,
  ADD COLUMN IF NOT EXISTS review_note text;

CREATE TABLE IF NOT EXISTS ai_command_center_action_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  action_id uuid NOT NULL REFERENCES ai_command_center_actions(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_cc_action_audit_workspace_created
  ON ai_command_center_action_audit_log(workspace_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_cc_action_audit_action_created
  ON ai_command_center_action_audit_log(action_id, created_at DESC);
