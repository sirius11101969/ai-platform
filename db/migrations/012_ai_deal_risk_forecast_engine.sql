ALTER TABLE lead_ai_scores ADD COLUMN IF NOT EXISTS engagement_score INTEGER NOT NULL DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100);
ALTER TABLE lead_ai_scores ADD COLUMN IF NOT EXISTS expected_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (expected_revenue >= 0);
ALTER TABLE lead_ai_scores ADD COLUMN IF NOT EXISTS forecast_category TEXT NOT NULL DEFAULT 'possible';
ALTER TABLE lead_ai_scores ADD COLUMN IF NOT EXISTS risk_signals JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE lead_ai_scores ADD COLUMN IF NOT EXISTS ai_reasoning TEXT NOT NULL DEFAULT '';
ALTER TABLE lead_ai_scores ADD COLUMN IF NOT EXISTS next_best_action_code TEXT NOT NULL DEFAULT 'schedule_demo';

UPDATE lead_ai_scores s
   SET engagement_score = CASE WHEN s.engagement_score = 0 THEN s.score ELSE s.engagement_score END,
       expected_revenue = CASE WHEN s.expected_revenue = 0 THEN COALESCE(l.value * s.deal_probability / 100.0, 0) ELSE s.expected_revenue END,
       forecast_category = CASE
         WHEN s.risk_level = 'high' THEN 'lost_risk'
         WHEN s.risk_level = 'medium' THEN 'at_risk'
         WHEN s.deal_probability >= 80 THEN 'committed'
         WHEN s.deal_probability >= 60 THEN 'likely'
         ELSE 'possible'
       END,
       ai_reasoning = COALESCE(NULLIF(s.ai_reasoning, ''), s.ai_summary, ''),
       next_best_action_code = CASE
         WHEN s.next_best_action ILIKE '%proposal%' OR s.next_best_action ILIKE '%предлож%' THEN 'send_proposal'
         WHEN s.next_best_action ILIKE '%telegram%' THEN 'follow_up_in_telegram'
         WHEN s.next_best_action ILIKE '%budget%' OR s.next_best_action ILIKE '%бюджет%' THEN 'request_budget_info'
         ELSE 'schedule_demo'
       END
  FROM crm_leads l
 WHERE l.id = s.lead_id;

ALTER TABLE lead_ai_scores DROP CONSTRAINT IF EXISTS lead_ai_scores_forecast_category_valid;
ALTER TABLE lead_ai_scores ADD CONSTRAINT lead_ai_scores_forecast_category_valid
  CHECK (forecast_category IN ('committed', 'likely', 'possible', 'at_risk', 'lost_risk'));

ALTER TABLE lead_ai_scores DROP CONSTRAINT IF EXISTS lead_ai_scores_next_best_action_valid;
ALTER TABLE lead_ai_scores ADD CONSTRAINT lead_ai_scores_next_best_action_valid
  CHECK (next_best_action_code IN ('schedule_demo', 'send_proposal', 'follow_up_in_telegram', 'escalate_to_manager', 'close_as_lost', 'request_budget_info'));

CREATE INDEX IF NOT EXISTS idx_lead_ai_scores_forecast
  ON lead_ai_scores(workspace_id, forecast_category, risk_level, generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_worker_queue_deal_intelligence
  ON ai_worker_queue(workspace_id, action_type, status, created_at DESC)
  WHERE action_type IN ('risk_review', 'pipeline_health_alert', 'stale_deal_followup');
