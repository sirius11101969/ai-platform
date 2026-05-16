ALTER TABLE lead_ai_scores ADD COLUMN IF NOT EXISTS urgency TEXT NOT NULL DEFAULT 'low';
ALTER TABLE lead_ai_scores ADD COLUMN IF NOT EXISTS budget_probability INTEGER NOT NULL DEFAULT 0 CHECK (budget_probability >= 0 AND budget_probability <= 100);
ALTER TABLE lead_ai_scores ADD COLUMN IF NOT EXISTS intent_summary TEXT NOT NULL DEFAULT '';
ALTER TABLE lead_ai_scores ADD COLUMN IF NOT EXISTS recommended_next_step TEXT NOT NULL DEFAULT '';
ALTER TABLE lead_ai_scores ADD COLUMN IF NOT EXISTS confidence INTEGER NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100);
ALTER TABLE lead_ai_scores ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE lead_ai_scores
   SET urgency = COALESCE(NULLIF(urgency, ''), urgency_level, 'low'),
       intent_summary = COALESCE(NULLIF(intent_summary, ''), ai_summary, ''),
       recommended_next_step = COALESCE(NULLIF(recommended_next_step, ''), next_best_action, ''),
       confidence = CASE WHEN confidence = 0 THEN LEAST(100, GREATEST(0, score)) ELSE confidence END,
       created_at = COALESCE(created_at, generated_at, NOW());

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lead_ai_scores_urgency_alias_valid') THEN
    ALTER TABLE lead_ai_scores ADD CONSTRAINT lead_ai_scores_urgency_alias_valid CHECK (urgency IN ('low', 'medium', 'high'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lead_ai_scores_channel_valid') THEN
    ALTER TABLE lead_ai_scores ADD CONSTRAINT lead_ai_scores_channel_valid CHECK (recommended_channel IS NULL OR recommended_channel IN ('telegram', 'email', 'phone', 'crm_task', 'Telegram', 'Email', 'Задача менеджеру'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_lead_ai_scores_priority_dashboard ON lead_ai_scores(workspace_id, temperature, score DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_worker_queue_lead_prioritization ON ai_worker_queue(workspace_id, action_type, status, created_at DESC) WHERE action_type = 'lead_prioritization';
