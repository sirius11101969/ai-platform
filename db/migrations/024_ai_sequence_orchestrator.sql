CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS ai_sequence_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  channel TEXT NOT NULL DEFAULT 'telegram',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, name)
);

CREATE TABLE IF NOT EXISTS ai_sequence_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES ai_sequence_templates(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL CHECK (step_order > 0),
  delay_hours INTEGER NOT NULL DEFAULT 0 CHECK (delay_hours >= 0),
  goal TEXT NOT NULL,
  tone TEXT NOT NULL DEFAULT 'professional',
  instructions TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(template_id, step_order)
);

CREATE TABLE IF NOT EXISTS ai_lead_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES ai_sequence_templates(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  current_step INTEGER NOT NULL DEFAULT 0 CHECK (current_step >= 0),
  next_run_at TIMESTAMPTZ,
  last_generated_at TIMESTAMPTZ,
  stop_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ai_lead_sequences_status_valid CHECK (status IN ('active', 'paused', 'completed', 'stopped'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_lead_sequences_one_active
  ON ai_lead_sequences(lead_id, template_id)
  WHERE status IN ('active', 'paused');

CREATE INDEX IF NOT EXISTS idx_ai_lead_sequences_due
  ON ai_lead_sequences(status, next_run_at, updated_at)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_ai_lead_sequences_lead
  ON ai_lead_sequences(lead_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_worker_queue_sequence_steps
  ON ai_worker_queue(workspace_id, lead_id, ((payload->>'leadSequenceId')), ((payload->>'step')), status, created_at DESC)
  WHERE payload->>'source' = 'sales_sequence_step_generation';

CREATE INDEX IF NOT EXISTS idx_lead_timeline_events_ai_sequences
  ON lead_timeline_events(workspace_id, lead_id, event_type, created_at DESC)
  WHERE event_type IN ('ai_sequence_started','ai_sequence_step_generated','ai_sequence_paused','ai_sequence_completed','ai_sequence_stopped');

INSERT INTO ai_sequence_templates(workspace_id, name, description, channel, is_active)
SELECT w.id,
       'Enterprise Demo Follow-up',
       'Default multi-step enterprise demo follow-up sequence.',
       'telegram',
       TRUE
  FROM workspaces w
ON CONFLICT (workspace_id, name) DO UPDATE
   SET description = EXCLUDED.description,
       channel = EXCLUDED.channel,
       is_active = TRUE;

WITH templates AS (
  SELECT id FROM ai_sequence_templates WHERE name = 'Enterprise Demo Follow-up'
), seed_steps(step_order, delay_hours, goal, tone, instructions) AS (
  VALUES
    (1, 0, 'Friendly reconnect', 'friendly', 'Reconnect warmly and reference the prior interest without pressure.'),
    (2, 24, 'Demo proposal', 'professional', 'Suggest a short demo and make it easy to choose a convenient time.'),
    (3, 48, 'Business value reminder', 'consultative', 'Briefly remind the lead of relevant business value without inventing ROI or promises.'),
    (4, 72, 'Gentle final follow-up', 'gentle', 'Send a polite final check-in and leave the door open for later.')
)
INSERT INTO ai_sequence_steps(template_id, step_order, delay_hours, goal, tone, instructions)
SELECT t.id, s.step_order, s.delay_hours, s.goal, s.tone, s.instructions
  FROM templates t
 CROSS JOIN seed_steps s
ON CONFLICT (template_id, step_order) DO UPDATE
   SET delay_hours = EXCLUDED.delay_hours,
       goal = EXCLUDED.goal,
       tone = EXCLUDED.tone,
       instructions = EXCLUDED.instructions;
