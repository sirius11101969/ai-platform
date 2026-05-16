CREATE TABLE IF NOT EXISTS ai_followup_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  suggested_channel TEXT,
  generated_message TEXT NOT NULL DEFAULT '',
  scheduled_for TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, rule_type)
);

CREATE TABLE IF NOT EXISTS ai_followup_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'approved', 'rejected', 'sent', 'failed')),
  suggested_channel TEXT NOT NULL DEFAULT 'crm' CHECK (suggested_channel IN ('telegram', 'email', 'crm')),
  generated_message TEXT NOT NULL DEFAULT '',
  scheduled_for TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  reason TEXT NOT NULL DEFAULT '',
  urgency TEXT NOT NULL DEFAULT 'medium',
  error TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_followup_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  job_id UUID REFERENCES ai_followup_jobs(id) ON DELETE SET NULL,
  rule_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'approved', 'rejected', 'sent', 'failed')),
  suggested_channel TEXT NOT NULL DEFAULT 'crm' CHECK (suggested_channel IN ('telegram', 'email', 'crm')),
  generated_message TEXT NOT NULL DEFAULT '',
  scheduled_for TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  error TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


DELETE FROM ai_followup_rules r
 USING (
   SELECT ctid, ROW_NUMBER() OVER (PARTITION BY workspace_id, rule_type ORDER BY created_at ASC, id ASC) AS row_number
     FROM ai_followup_rules
 ) duplicates
 WHERE r.ctid = duplicates.ctid AND duplicates.row_number > 1;

DO $$
DECLARE
  workspace_id_attnum SMALLINT;
  rule_type_attnum SMALLINT;
BEGIN
  SELECT attnum INTO workspace_id_attnum FROM pg_attribute WHERE attrelid = 'ai_followup_rules'::regclass AND attname = 'workspace_id';
  SELECT attnum INTO rule_type_attnum FROM pg_attribute WHERE attrelid = 'ai_followup_rules'::regclass AND attname = 'rule_type';

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conrelid = 'ai_followup_rules'::regclass
       AND contype = 'u'
       AND conkey = ARRAY[workspace_id_attnum, rule_type_attnum]
  ) THEN
    ALTER TABLE ai_followup_rules ADD CONSTRAINT ai_followup_rules_workspace_rule_type_key UNIQUE (workspace_id, rule_type);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_followup_rules_channel_valid') THEN
    ALTER TABLE ai_followup_rules ADD CONSTRAINT ai_followup_rules_channel_valid CHECK (suggested_channel IS NULL OR suggested_channel IN ('telegram', 'email', 'crm'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ai_followup_rules_workspace ON ai_followup_rules(workspace_id, rule_type);
CREATE INDEX IF NOT EXISTS idx_ai_followup_jobs_status ON ai_followup_jobs(workspace_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_followup_jobs_dedup ON ai_followup_jobs(workspace_id, lead_id, rule_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_followup_attempts_lead ON ai_followup_attempts(workspace_id, lead_id, created_at DESC);
