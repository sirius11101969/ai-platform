ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS probability_to_close INTEGER NOT NULL DEFAULT 0 CHECK (probability_to_close >= 0 AND probability_to_close <= 100);
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS estimated_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (estimated_revenue >= 0);
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS expected_close_date DATE;

UPDATE crm_leads l
   SET probability_to_close = COALESCE(NULLIF(probability_to_close, 0), latest.deal_probability, 0),
       estimated_revenue = CASE WHEN estimated_revenue = 0 THEN COALESCE(l.value * latest.deal_probability / 100.0, 0) ELSE estimated_revenue END,
       expected_close_date = COALESCE(expected_close_date, (CURRENT_DATE + INTERVAL '30 days')::date)
  FROM (
    SELECT DISTINCT ON (lead_id) lead_id, deal_probability
      FROM lead_ai_scores
     ORDER BY lead_id, generated_at DESC
  ) latest
 WHERE latest.lead_id = l.id;

ALTER TABLE ai_worker_queue DROP CONSTRAINT IF EXISTS ai_worker_queue_status_valid;
ALTER TABLE ai_worker_queue ADD CONSTRAINT ai_worker_queue_status_valid
  CHECK (status IN ('pending_approval', 'approved', 'rejected', 'executing', 'completed', 'executed', 'failed', 'cancelled'));

CREATE INDEX IF NOT EXISTS idx_ai_worker_queue_stage_recommendations
  ON ai_worker_queue(workspace_id, lead_id, status, created_at DESC)
  WHERE action_type = 'stage_change_recommendation';

CREATE INDEX IF NOT EXISTS idx_crm_leads_ai_forecast
  ON crm_leads(workspace_id, status, probability_to_close, expected_close_date);
