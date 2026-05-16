ALTER TABLE ai_worker_queue ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ai_worker_queue ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE ai_worker_queue ADD COLUMN IF NOT EXISTS executed_at TIMESTAMPTZ;
ALTER TABLE ai_worker_queue ADD COLUMN IF NOT EXISTS error_message TEXT;

UPDATE ai_worker_queue SET status = 'executing' WHERE status IN ('queued', 'running');

ALTER TABLE ai_worker_queue DROP CONSTRAINT IF EXISTS ai_worker_queue_status_valid;
ALTER TABLE ai_worker_queue ADD CONSTRAINT ai_worker_queue_status_valid
  CHECK (status IN ('pending_approval', 'approved', 'rejected', 'executing', 'completed', 'failed', 'cancelled'));

CREATE INDEX IF NOT EXISTS idx_ai_worker_queue_approval_metrics
  ON ai_worker_queue(workspace_id, status, approved_at, executed_at, updated_at);
