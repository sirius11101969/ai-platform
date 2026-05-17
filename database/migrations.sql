CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 0 CHECK (credits >= 0),
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_url TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credits_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  balance_after INTEGER NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  credits_spent INTEGER NOT NULL DEFAULT 0 CHECK (credits_spent >= 0),
  result JSONB,
  task_type TEXT,
  input JSONB NOT NULL DEFAULT '{}'::jsonb,
  output JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ai_tasks ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE ai_tasks ADD COLUMN IF NOT EXISTS prompt TEXT;
ALTER TABLE ai_tasks ADD COLUMN IF NOT EXISTS credits_spent INTEGER NOT NULL DEFAULT 0;
ALTER TABLE ai_tasks ADD COLUMN IF NOT EXISTS result JSONB;
ALTER TABLE ai_tasks ADD COLUMN IF NOT EXISTS task_type TEXT;
ALTER TABLE ai_tasks ADD COLUMN IF NOT EXISTS input JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE ai_tasks ADD COLUMN IF NOT EXISTS output JSONB;
ALTER TABLE ai_tasks ADD COLUMN IF NOT EXISTS error TEXT;
ALTER TABLE ai_tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
UPDATE ai_tasks
   SET type = CASE COALESCE(NULLIF(type, ''), NULLIF(task_type, ''), 'ai_content_generation')
             WHEN 'text_generation' THEN 'ai_content_generation'
             WHEN 'sales_email' THEN 'ai_sales_reply'
             WHEN 'crm_summary' THEN 'ai_crm_follow_up'
             WHEN 'lead_follow_up' THEN 'ai_crm_follow_up'
             ELSE COALESCE(NULLIF(type, ''), NULLIF(task_type, ''), 'ai_content_generation')
           END,
       prompt = COALESCE(NULLIF(prompt, ''), input->>'prompt', ''),
       status = CASE
         WHEN status = 'queued' THEN 'pending'
         WHEN status NOT IN ('pending', 'processing', 'completed', 'failed') THEN 'failed'
         ELSE status
       END,
       result = COALESCE(result, output)
 WHERE type IS NULL
    OR prompt IS NULL
    OR status = 'queued'
    OR status NOT IN ('pending', 'processing', 'completed', 'failed')
    OR result IS NULL;
ALTER TABLE ai_tasks ALTER COLUMN type SET NOT NULL;
ALTER TABLE ai_tasks ALTER COLUMN prompt SET NOT NULL;
ALTER TABLE ai_tasks ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE ai_tasks ALTER COLUMN task_type DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ai_tasks_status_valid'
  ) THEN
    ALTER TABLE ai_tasks ADD CONSTRAINT ai_tasks_status_valid
      CHECK (status IN ('pending', 'processing', 'completed', 'failed'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ai_tasks_credits_spent_non_negative'
  ) THEN
    ALTER TABLE ai_tasks ADD CONSTRAINT ai_tasks_credits_spent_non_negative CHECK (credits_spent >= 0);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  value NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (value >= 0),
  source TEXT,
  contact TEXT,
  stage TEXT NOT NULL DEFAULT 'new',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new';
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS value NUMERIC(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS telegram_id TEXT;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS telegram_username TEXT;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS first_message TEXT;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;
ALTER TABLE crm_leads ALTER COLUMN contact DROP NOT NULL;
UPDATE crm_leads
   SET status = COALESCE(NULLIF(status, ''), NULLIF(stage, ''), 'new'),
       phone = COALESCE(phone, contact)
 WHERE status IS NULL OR status = '' OR phone IS NULL;
UPDATE crm_leads
   SET status = 'new'
 WHERE status NOT IN ('new', 'qualified', 'proposal', 'booked', 'won', 'lost');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'crm_leads_status_valid'
  ) THEN
    ALTER TABLE crm_leads ADD CONSTRAINT crm_leads_status_valid
      CHECK (status IN ('new', 'qualified', 'proposal', 'booked', 'won', 'lost'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'crm_leads_value_non_negative'
  ) THEN
    ALTER TABLE crm_leads ADD CONSTRAINT crm_leads_value_non_negative CHECK (value >= 0);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS crm_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telegram_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  message TEXT NOT NULL,
  telegram_message_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_ledger_user_id ON credits_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_user_id ON ai_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_user_id ON crm_leads(user_id);
-- Do not backfill, deduplicate, or otherwise mutate crm_leads.telegram_chat_id during startup.
-- Telegram chat ids are only connected by explicit Telegram flows; startup must preserve production links.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM crm_leads
     WHERE telegram_chat_id IS NOT NULL
     GROUP BY telegram_chat_id
    HAVING COUNT(*) > 1
  ) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_leads_unique_telegram_chat_id ON crm_leads(telegram_chat_id) WHERE telegram_chat_id IS NOT NULL;
  ELSE
    RAISE WARNING 'Skipping idx_crm_leads_unique_telegram_chat_id creation because duplicate telegram_chat_id values exist';
  END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_leads_telegram_identity ON crm_leads(user_id, telegram_id) WHERE source = 'telegram' AND telegram_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_leads_telegram_last_seen ON crm_leads(user_id, last_seen_at) WHERE source = 'telegram';
CREATE INDEX IF NOT EXISTS idx_crm_notes_lead_id ON crm_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_lead_id ON telegram_messages(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_user_id ON telegram_messages(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'sales',
  status TEXT NOT NULL DEFAULT 'active',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, type)
);

CREATE TABLE IF NOT EXISTS ai_agent_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES crm_leads(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  priority INTEGER NOT NULL DEFAULT 0,
  input_context JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_result JSONB,
  error TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  action_id UUID REFERENCES ai_agent_actions(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES crm_leads(id) ON DELETE CASCADE,
  task_type TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  priority INTEGER NOT NULL DEFAULT 0,
  input_context JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_result JSONB,
  execution_log JSONB NOT NULL DEFAULT '[]'::jsonb,
  error TEXT,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES crm_leads(id) ON DELETE CASCADE,
  action_id UUID REFERENCES ai_agent_actions(id) ON DELETE SET NULL,
  task_type TEXT NOT NULL DEFAULT 'generate_follow_up',
  status TEXT NOT NULL DEFAULT 'queued',
  priority INTEGER NOT NULL DEFAULT 0,
  input_context JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_agent_actions_status_valid') THEN
    ALTER TABLE ai_agent_actions ADD CONSTRAINT ai_agent_actions_status_valid CHECK (status IN ('queued', 'running', 'completed', 'failed'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_agent_runs_status_valid') THEN
    ALTER TABLE ai_agent_runs ADD CONSTRAINT ai_agent_runs_status_valid CHECK (status IN ('queued', 'running', 'completed', 'failed'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_followups_status_valid') THEN
    ALTER TABLE ai_followups ADD CONSTRAINT ai_followups_status_valid CHECK (status IN ('queued', 'running', 'completed', 'failed'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ai_agents_workspace_type ON ai_agents(workspace_id, type);
CREATE INDEX IF NOT EXISTS idx_ai_agent_actions_queue ON ai_agent_actions(status, priority DESC, next_retry_at, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_agent_actions_lead ON ai_agent_actions(workspace_id, lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_agent_runs_action ON ai_agent_runs(action_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_followups_lead ON ai_followups(workspace_id, lead_id, created_at DESC);

-- AI Worker System / AI Command Center
CREATE TABLE IF NOT EXISTS ai_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  mode TEXT NOT NULL DEFAULT 'suggestion_only',
  description TEXT NOT NULL DEFAULT '',
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, type)
);

CREATE TABLE IF NOT EXISTS ai_worker_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES ai_workers(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES crm_leads(id) ON DELETE SET NULL,
  input_context JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'queued',
  credits_spent INTEGER NOT NULL DEFAULT 0 CHECK (credits_spent >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_worker_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES ai_workers(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  run_id UUID REFERENCES ai_worker_runs(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES crm_leads(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_approval',
  title TEXT NOT NULL,
  recommendation TEXT NOT NULL DEFAULT '',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_workers_status_valid') THEN
    ALTER TABLE ai_workers ADD CONSTRAINT ai_workers_status_valid CHECK (status IN ('active', 'paused', 'error'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_workers_mode_valid') THEN
    ALTER TABLE ai_workers ADD CONSTRAINT ai_workers_mode_valid CHECK (mode IN ('suggestion_only', 'approval_required', 'autonomous_ready'));
  END IF;
  ALTER TABLE ai_workers DROP CONSTRAINT IF EXISTS ai_workers_type_valid;
  ALTER TABLE ai_workers ADD CONSTRAINT ai_workers_type_valid CHECK (type IN ('ai_sdr_agent', 'ai_followup_worker', 'ai_revenue_analyst', 'ai_crm_assistant', 'ai_email_assistant', 'ai_telegram_assistant', 'ai_meeting_scheduler'));
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_worker_runs_status_valid') THEN
    ALTER TABLE ai_worker_runs ADD CONSTRAINT ai_worker_runs_status_valid CHECK (status IN ('queued', 'running', 'completed', 'failed'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_worker_queue_status_valid') THEN
    ALTER TABLE ai_worker_queue ADD CONSTRAINT ai_worker_queue_status_valid CHECK (status IN ('pending_approval', 'queued', 'running', 'completed', 'failed', 'cancelled'));
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM ai_workers WHERE type = 'ai_meeting_scheduler' OFFSET 1) THEN
    UPDATE ai_worker_queue
       SET worker_id = (SELECT id FROM ai_workers WHERE type = 'ai_meeting_scheduler' ORDER BY created_at ASC, id ASC LIMIT 1)
     WHERE worker_id IN (SELECT id FROM ai_workers WHERE type = 'ai_meeting_scheduler' ORDER BY created_at ASC, id ASC OFFSET 1);
    UPDATE ai_worker_runs
       SET worker_id = (SELECT id FROM ai_workers WHERE type = 'ai_meeting_scheduler' ORDER BY created_at ASC, id ASC LIMIT 1)
     WHERE worker_id IN (SELECT id FROM ai_workers WHERE type = 'ai_meeting_scheduler' ORDER BY created_at ASC, id ASC OFFSET 1);
    DELETE FROM ai_workers
     WHERE id IN (SELECT id FROM ai_workers WHERE type = 'ai_meeting_scheduler' ORDER BY created_at ASC, id ASC OFFSET 1);
  END IF;
END $$;

DROP INDEX IF EXISTS idx_ai_workers_unique_meeting_scheduler;

CREATE INDEX IF NOT EXISTS idx_ai_workers_workspace_type ON ai_workers(workspace_id, type);
CREATE INDEX IF NOT EXISTS idx_ai_worker_runs_worker ON ai_worker_runs(workspace_id, worker_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_worker_queue_status ON ai_worker_queue(workspace_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_worker_queue_lead ON ai_worker_queue(workspace_id, lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_worker_queue_telegram_reply_draft ON ai_worker_queue(workspace_id, lead_id, ((payload->>'telegramMessageId')), status, created_at DESC) WHERE action_type = 'telegram_reply_draft';
-- Complete AI Meeting Scheduler execution workflow with durable meeting records.
CREATE TABLE IF NOT EXISTS crm_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  starts_at TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 30,
  channel TEXT DEFAULT 'telegram',
  status TEXT DEFAULT 'scheduled',
  created_by_ai BOOLEAN DEFAULT TRUE,
  ai_worker_queue_id UUID REFERENCES ai_worker_queue(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ;
ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 30;
ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'telegram';
ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled';
ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS created_by_ai BOOLEAN DEFAULT TRUE;
ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS ai_worker_queue_id UUID REFERENCES ai_worker_queue(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_crm_meetings_workspace_lead
  ON crm_meetings(workspace_id, lead_id, starts_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_meetings_unique_ai_worker_queue_id
  ON crm_meetings(ai_worker_queue_id) WHERE ai_worker_queue_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_crm_meetings_ai_worker_queue_id
  ON crm_meetings(ai_worker_queue_id);

CREATE INDEX IF NOT EXISTS idx_ai_worker_queue_source_message_dedup
  ON ai_worker_queue(workspace_id, lead_id, action_type, ((payload->>'sourceMessageId')), status, created_at DESC)
  WHERE action_type IN ('meeting_schedule_proposal', 'telegram_reply_draft', 'telegram_meeting_confirmation_draft');
CREATE INDEX IF NOT EXISTS idx_crm_meetings_google_event_id
  ON crm_meetings(workspace_id, google_event_id)
  WHERE google_event_id IS NOT NULL AND google_event_id <> '';
