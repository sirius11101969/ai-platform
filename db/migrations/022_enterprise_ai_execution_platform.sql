CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS worker_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_name TEXT NOT NULL UNIQUE,
  node_type TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'starting',
  queues TEXT[] NOT NULL DEFAULT ARRAY['default']::TEXT[],
  max_concurrency INTEGER NOT NULL DEFAULT 4 CHECK (max_concurrency > 0),
  current_concurrency INTEGER NOT NULL DEFAULT 0 CHECK (current_concurrency >= 0),
  heartbeat_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stopped_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT worker_nodes_status_valid CHECK (status IN ('starting', 'online', 'draining', 'offline', 'failed'))
);

CREATE TABLE IF NOT EXISTS worker_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_node_id UUID REFERENCES worker_nodes(id) ON DELETE SET NULL,
  queue_name TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC(18,6) NOT NULL,
  labels JSONB NOT NULL DEFAULT '{}'::jsonb,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  task_id UUID REFERENCES ai_tasks(id) ON DELETE SET NULL,
  job_id UUID,
  workflow_id UUID,
  agent_id UUID,
  level TEXT NOT NULL DEFAULT 'info',
  event TEXT,
  message TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  trace_id TEXT,
  span_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT execution_logs_level_valid CHECK (level IN ('debug', 'info', 'warn', 'error'))
);

CREATE TABLE IF NOT EXISTS dead_letter_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  source_queue TEXT NOT NULL,
  source_job_id UUID,
  task_id UUID REFERENCES ai_tasks(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  error_message TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  failed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolution_note TEXT
);

CREATE TABLE IF NOT EXISTS ai_provider_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  task_id UUID REFERENCES ai_tasks(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  model TEXT,
  operation TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL DEFAULT 0 CHECK (prompt_tokens >= 0),
  completion_tokens INTEGER NOT NULL DEFAULT 0 CHECK (completion_tokens >= 0),
  total_tokens INTEGER NOT NULL DEFAULT 0 CHECK (total_tokens >= 0),
  provider_cost_usd NUMERIC(18,8) NOT NULL DEFAULT 0 CHECK (provider_cost_usd >= 0),
  billable_credits INTEGER NOT NULL DEFAULT 0 CHECK (billable_credits >= 0),
  latency_ms INTEGER NOT NULL DEFAULT 0 CHECK (latency_ms >= 0),
  status TEXT NOT NULL DEFAULT 'succeeded',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ai_provider_usage_status_valid CHECK (status IN ('submitted', 'succeeded', 'failed', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS task_execution_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES ai_tasks(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  previous_status TEXT,
  next_status TEXT NOT NULL,
  worker_node_id UUID REFERENCES worker_nodes(id) ON DELETE SET NULL,
  attempt INTEGER NOT NULL DEFAULT 1 CHECK (attempt > 0),
  latency_ms INTEGER CHECK (latency_ms IS NULL OR latency_ms >= 0),
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  task_id UUID REFERENCES ai_tasks(id) ON DELETE SET NULL,
  idempotency_key TEXT NOT NULL,
  entry_type TEXT NOT NULL,
  credits_delta INTEGER NOT NULL,
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  provider_cost_usd NUMERIC(18,8) NOT NULL DEFAULT 0 CHECK (provider_cost_usd >= 0),
  margin_usd NUMERIC(18,8) NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, idempotency_key),
  CONSTRAINT credit_ledger_entries_type_valid CHECK (entry_type IN ('reserve', 'capture', 'refund', 'grant', 'adjustment', 'overage'))
);

CREATE TABLE IF NOT EXISTS subscription_usage_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  included_credits INTEGER NOT NULL DEFAULT 0 CHECK (included_credits >= 0),
  used_credits INTEGER NOT NULL DEFAULT 0 CHECK (used_credits >= 0),
  overage_credits INTEGER NOT NULL DEFAULT 0 CHECK (overage_credits >= 0),
  overage_amount_usd NUMERIC(18,8) NOT NULL DEFAULT 0 CHECK (overage_amount_usd >= 0),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, period_start, period_end)
);

CREATE TABLE IF NOT EXISTS ai_execution_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  task_id UUID REFERENCES ai_tasks(id) ON DELETE SET NULL,
  queue_name TEXT NOT NULL DEFAULT 'default',
  job_type TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 100 CHECK (priority >= 0),
  status TEXT NOT NULL DEFAULT 'queued',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  result JSONB,
  error_message TEXT,
  max_attempts INTEGER NOT NULL DEFAULT 3 CHECK (max_attempts > 0),
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  run_after TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_by UUID REFERENCES worker_nodes(id) ON DELETE SET NULL,
  locked_at TIMESTAMPTZ,
  heartbeat_at TIMESTAMPTZ,
  timeout_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  idempotency_key TEXT,
  CONSTRAINT ai_execution_jobs_status_valid CHECK (status IN ('queued', 'running', 'retrying', 'completed', 'failed', 'cancelled', 'dead_lettered')),
  UNIQUE(workspace_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS orchestration_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  workflow_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  input JSONB NOT NULL DEFAULT '{}'::jsonb,
  output JSONB,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  parent_workflow_id UUID REFERENCES orchestration_workflows(id) ON DELETE SET NULL,
  trace_id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT orchestration_workflows_status_valid CHECK (status IN ('queued', 'planning', 'running', 'waiting', 'completed', 'failed', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES orchestration_workflows(id) ON DELETE CASCADE,
  sender_agent_id UUID,
  recipient_agent_id UUID,
  role TEXT NOT NULL,
  content JSONB NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT agent_messages_role_valid CHECK (role IN ('planner', 'executor', 'tool', 'system', 'user'))
);

CREATE TABLE IF NOT EXISTS agent_memory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES orchestration_workflows(id) ON DELETE CASCADE,
  agent_id UUID,
  memory_type TEXT NOT NULL,
  content JSONB NOT NULL,
  embedding JSONB,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_worker_nodes_heartbeat ON worker_nodes(status, heartbeat_at DESC);
CREATE INDEX IF NOT EXISTS idx_worker_metrics_queue_time ON worker_metrics(queue_name, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_execution_logs_trace ON execution_logs(trace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_execution_logs_workspace_time ON execution_logs(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dead_letter_queue_unresolved ON dead_letter_queue(failed_at DESC) WHERE resolved_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ai_provider_usage_workspace_time ON ai_provider_usage(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_provider_usage_provider_model ON ai_provider_usage(provider, model, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_execution_history_task ON task_execution_history(task_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_entries_workspace_time ON credit_ledger_entries(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_execution_jobs_claim ON ai_execution_jobs(queue_name, status, priority ASC, run_after ASC, created_at ASC) WHERE status IN ('queued', 'retrying');
CREATE INDEX IF NOT EXISTS idx_ai_execution_jobs_stuck ON ai_execution_jobs(status, heartbeat_at, timeout_at) WHERE status = 'running';
CREATE INDEX IF NOT EXISTS idx_orchestration_workflows_workspace_status ON orchestration_workflows(workspace_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_messages_workflow_time ON agent_messages(workflow_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_agent_memory_items_workspace ON agent_memory_items(workspace_id, memory_type, created_at DESC);
