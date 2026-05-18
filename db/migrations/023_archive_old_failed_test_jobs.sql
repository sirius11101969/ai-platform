BEGIN;

ALTER TABLE ai_execution_jobs
  DROP CONSTRAINT IF EXISTS ai_execution_jobs_status_valid;

ALTER TABLE ai_execution_jobs
  ADD CONSTRAINT ai_execution_jobs_status_valid
  CHECK (status IN ('queued', 'running', 'retrying', 'completed', 'failed', 'cancelled', 'dead_lettered', 'archived', 'rejected'));

-- Archive already terminal internal test jobs from pre-production smoke tests.
-- The one-day guard avoids changing freshly failed jobs that may still be under investigation.
UPDATE ai_execution_jobs
   SET status = 'archived',
       locked_by = NULL,
       locked_at = NULL,
       heartbeat_at = NULL,
       timeout_at = NULL,
       error_message = COALESCE(error_message, 'Archived old failed internal execution test job'),
       updated_at = NOW()
 WHERE job_type = 'internal_test_execution'
   AND status IN ('failed', 'dead_lettered')
   AND created_at < NOW() - INTERVAL '1 day';

-- Reject stale non-terminal internal test jobs so production workers do not claim obsolete smoke jobs.
-- The seven-day guard keeps recent diagnostics available for normal runner retries.
UPDATE ai_execution_jobs
   SET status = 'rejected',
       locked_by = NULL,
       locked_at = NULL,
       heartbeat_at = NULL,
       timeout_at = NULL,
       error_message = COALESCE(error_message, 'Rejected stale internal execution test job'),
       updated_at = NOW()
 WHERE job_type = 'internal_test_execution'
   AND status IN ('queued', 'retrying', 'running')
   AND created_at < NOW() - INTERVAL '7 days';

COMMIT;
