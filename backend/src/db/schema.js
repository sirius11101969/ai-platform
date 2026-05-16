const pool = require('./pool')

async function migrate() {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      credits INTEGER NOT NULL DEFAULT 0 CHECK (credits >= 0),
      plan TEXT NOT NULL DEFAULT 'free',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS workspaces (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan TEXT NOT NULL DEFAULT 'free',
      credits_pool INTEGER NOT NULL DEFAULT 0 CHECK (credits_pool >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workspaces_plan_valid') THEN
        ALTER TABLE workspaces ADD CONSTRAINT workspaces_plan_valid
          CHECK (plan IN ('free', 'starter', 'pro', 'business', 'enterprise'));
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS workspace_members (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'viewer',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(workspace_id, user_id)
    );

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workspace_members_role_valid') THEN
        ALTER TABLE workspace_members ADD CONSTRAINT workspace_members_role_valid
          CHECK (role IN ('owner', 'admin', 'sales', 'viewer'));
      END IF;
    END $$;

    INSERT INTO workspaces(name, owner_user_id, plan, credits_pool, created_at, updated_at)
    SELECT split_part(email, '@', 1) || ' workspace', id, plan, credits, created_at, NOW()
      FROM users u
     WHERE NOT EXISTS (SELECT 1 FROM workspaces w WHERE w.owner_user_id = u.id);

    INSERT INTO workspace_members(workspace_id, user_id, role, created_at)
    SELECT w.id, w.owner_user_id, 'owner', w.created_at
      FROM workspaces w
     WHERE NOT EXISTS (
       SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = w.id AND wm.user_id = w.owner_user_id
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

    ALTER TABLE ai_tasks ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;
    UPDATE ai_tasks t
       SET workspace_id = wm.workspace_id
      FROM workspace_members wm
     WHERE t.workspace_id IS NULL AND wm.user_id = t.user_id AND wm.role = 'owner';
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


    CREATE TABLE IF NOT EXISTS crm_stages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
      status TEXT NOT NULL,
      title TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(workspace_id, status)
    );

    ALTER TABLE crm_stages DROP CONSTRAINT IF EXISTS crm_stages_user_id_status_key;
    ALTER TABLE crm_stages ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
    UPDATE crm_stages s
       SET workspace_id = wm.workspace_id
      FROM workspace_members wm
     WHERE s.workspace_id IS NULL AND wm.user_id = s.user_id AND wm.role = 'owner';

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'crm_stages_status_valid'
      ) THEN
        ALTER TABLE crm_stages ADD CONSTRAINT crm_stages_status_valid
          CHECK (status IN ('new', 'qualified', 'proposal', 'booked', 'won', 'lost'));
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

    ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;
    UPDATE crm_leads l
       SET workspace_id = wm.workspace_id
      FROM workspace_members wm
     WHERE l.workspace_id IS NULL AND wm.user_id = l.user_id AND wm.role = 'owner';
    ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS email TEXT;
    ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS phone TEXT;
    ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS company TEXT;
    ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new';
    ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS value NUMERIC(12, 2) NOT NULL DEFAULT 0;
    ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS telegram_id TEXT;
    ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;
    ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS telegram_username TEXT;
    ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS telegram_first_name TEXT;
    ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS telegram_last_name TEXT;
    ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS first_name TEXT;
    ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS last_name TEXT;
    ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS first_message TEXT;
    ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ;
    ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;
    UPDATE crm_leads
       SET telegram_chat_id = COALESCE(telegram_chat_id, metadata->>'telegramChatId'),
           telegram_first_name = COALESCE(telegram_first_name, first_name),
           telegram_last_name = COALESCE(telegram_last_name, last_name)
     WHERE source = 'telegram' OR metadata ? 'telegramChatId';
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
      workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );



    ALTER TABLE crm_notes ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
    UPDATE crm_notes n SET workspace_id = l.workspace_id FROM crm_leads l WHERE n.workspace_id IS NULL AND n.lead_id = l.id;

    ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS telegram TEXT;
    ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS notes TEXT;
    UPDATE crm_leads SET stage = status WHERE stage IS NULL OR stage = '' OR stage <> status;



    CREATE TABLE IF NOT EXISTS email_attachments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lead_id UUID REFERENCES crm_leads(id) ON DELETE SET NULL,
      file_name TEXT NOT NULL,
      mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
      size_bytes INTEGER NOT NULL DEFAULT 0 CHECK (size_bytes >= 0),
      storage_path TEXT NOT NULL,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS email_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lead_id UUID REFERENCES crm_leads(id) ON DELETE SET NULL,
      to_email TEXT NOT NULL,
      from_email TEXT,
      subject TEXT NOT NULL,
      text_body TEXT NOT NULL DEFAULT '',
      html_body TEXT NOT NULL DEFAULT '',
      template TEXT,
      status TEXT NOT NULL DEFAULT 'queued',
      provider TEXT NOT NULL DEFAULT 'smtp',
      retry_count INTEGER NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
      max_retries INTEGER NOT NULL DEFAULT 3 CHECK (max_retries >= 0),
      error TEXT,
      tracking_token TEXT UNIQUE,
      opened_at TIMESTAMPTZ,
      scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      next_retry_at TIMESTAMPTZ,
      sent_at TIMESTAMPTZ,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'email_messages_status_valid') THEN
        ALTER TABLE email_messages ADD CONSTRAINT email_messages_status_valid CHECK (status IN ('queued', 'sending', 'sent', 'failed'));
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS email_message_attachments (
      email_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
      attachment_id UUID NOT NULL REFERENCES email_attachments(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY(email_id, attachment_id)
    );

    CREATE TABLE IF NOT EXISTS email_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      email_id UUID REFERENCES email_messages(id) ON DELETE SET NULL,
      recipient TEXT NOT NULL,
      subject TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('queued', 'sending', 'sent', 'failed')),
      error TEXT,
      lead_id UUID REFERENCES crm_leads(id) ON DELETE SET NULL,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_email_messages_queue ON email_messages(status, scheduled_at, next_retry_at);
    CREATE INDEX IF NOT EXISTS idx_email_messages_lead ON email_messages(user_id, lead_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_email_attachments_user ON email_attachments(user_id, lead_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_email_logs_lead ON email_logs(lead_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_email_logs_user ON email_logs(user_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS telegram_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
      message TEXT NOT NULL,
      telegram_chat_id TEXT,
      telegram_message_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS crm_followups (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      model TEXT NOT NULL,
      prompt JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS crm_activity (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lead_id UUID REFERENCES crm_leads(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );


    ALTER TABLE credits_ledger ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;
    UPDATE credits_ledger c SET workspace_id = wm.workspace_id FROM workspace_members wm WHERE c.workspace_id IS NULL AND wm.user_id = c.user_id AND wm.role = 'owner';
    ALTER TABLE email_attachments ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;
    UPDATE email_attachments e SET workspace_id = l.workspace_id FROM crm_leads l WHERE e.workspace_id IS NULL AND e.lead_id = l.id;
    UPDATE email_attachments e SET workspace_id = wm.workspace_id FROM workspace_members wm WHERE e.workspace_id IS NULL AND wm.user_id = e.user_id AND wm.role = 'owner';
    ALTER TABLE email_messages ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;
    UPDATE email_messages e SET workspace_id = l.workspace_id FROM crm_leads l WHERE e.workspace_id IS NULL AND e.lead_id = l.id;
    UPDATE email_messages e SET workspace_id = wm.workspace_id FROM workspace_members wm WHERE e.workspace_id IS NULL AND wm.user_id = e.user_id AND wm.role = 'owner';
    ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;
    UPDATE email_logs e SET workspace_id = l.workspace_id FROM crm_leads l WHERE e.workspace_id IS NULL AND e.lead_id = l.id;
    UPDATE email_logs e SET workspace_id = wm.workspace_id FROM workspace_members wm WHERE e.workspace_id IS NULL AND wm.user_id = e.user_id AND wm.role = 'owner';
    ALTER TABLE telegram_messages ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;
    ALTER TABLE telegram_messages ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;
    UPDATE telegram_messages t SET workspace_id = l.workspace_id FROM crm_leads l WHERE t.workspace_id IS NULL AND t.lead_id = l.id;
    UPDATE telegram_messages t SET telegram_chat_id = COALESCE(l.telegram_chat_id, l.metadata->>'telegramChatId') FROM crm_leads l WHERE t.telegram_chat_id IS NULL AND t.lead_id = l.id;
    ALTER TABLE crm_followups ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
    UPDATE crm_followups f SET workspace_id = l.workspace_id FROM crm_leads l WHERE f.workspace_id IS NULL AND f.lead_id = l.id;
    ALTER TABLE crm_activity ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
    UPDATE crm_activity a SET workspace_id = l.workspace_id FROM crm_leads l WHERE a.workspace_id IS NULL AND a.lead_id = l.id;





    CREATE TABLE IF NOT EXISTS lead_ai_scores (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
      score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
      temperature TEXT NOT NULL DEFAULT 'cold',
      deal_probability INTEGER NOT NULL DEFAULT 0 CHECK (deal_probability >= 0 AND deal_probability <= 100),
      urgency_level TEXT NOT NULL DEFAULT 'low',
      engagement_level TEXT NOT NULL DEFAULT 'cold',
      ai_summary TEXT NOT NULL DEFAULT '',
      next_best_action TEXT NOT NULL DEFAULT '',
      risk_level TEXT NOT NULL DEFAULT 'medium',
      ideal_contact_timing TEXT,
      objections_detected JSONB NOT NULL DEFAULT '[]'::jsonb,
      recommended_cta TEXT,
      recommended_channel TEXT,
      urgency TEXT NOT NULL DEFAULT 'low',
      budget_probability INTEGER NOT NULL DEFAULT 0 CHECK (budget_probability >= 0 AND budget_probability <= 100),
      intent_summary TEXT NOT NULL DEFAULT '',
      recommended_next_step TEXT NOT NULL DEFAULT '',
      confidence INTEGER NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
      generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

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

    CREATE TABLE IF NOT EXISTS ai_followup_sequences (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'draft',
      followup_type TEXT NOT NULL DEFAULT 'telegram',
      generated_message TEXT NOT NULL,
      recommended_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      scheduled_for TIMESTAMPTZ,
      approved_by_user UUID REFERENCES users(id) ON DELETE SET NULL,
      sent_at TIMESTAMPTZ,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb
    );

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lead_ai_scores_temperature_valid') THEN
        ALTER TABLE lead_ai_scores ADD CONSTRAINT lead_ai_scores_temperature_valid CHECK (temperature IN ('cold', 'warm', 'hot'));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lead_ai_scores_urgency_valid') THEN
        ALTER TABLE lead_ai_scores ADD CONSTRAINT lead_ai_scores_urgency_valid CHECK (urgency_level IN ('low', 'medium', 'high'));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lead_ai_scores_engagement_valid') THEN
        ALTER TABLE lead_ai_scores ADD CONSTRAINT lead_ai_scores_engagement_valid CHECK (engagement_level IN ('cold', 'warm', 'hot'));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lead_ai_scores_urgency_alias_valid') THEN
        ALTER TABLE lead_ai_scores ADD CONSTRAINT lead_ai_scores_urgency_alias_valid CHECK (urgency IN ('low', 'medium', 'high'));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lead_ai_scores_channel_valid') THEN
        ALTER TABLE lead_ai_scores ADD CONSTRAINT lead_ai_scores_channel_valid CHECK (recommended_channel IS NULL OR recommended_channel IN ('telegram', 'email', 'phone', 'crm_task', 'Telegram', 'Email', 'Задача менеджеру'));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lead_ai_scores_risk_valid') THEN
        ALTER TABLE lead_ai_scores ADD CONSTRAINT lead_ai_scores_risk_valid CHECK (risk_level IN ('low', 'medium', 'high'));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_followup_sequences_status_valid') THEN
        ALTER TABLE ai_followup_sequences ADD CONSTRAINT ai_followup_sequences_status_valid CHECK (status IN ('draft', 'queued', 'approved', 'sent', 'skipped'));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_followup_sequences_type_valid') THEN
        ALTER TABLE ai_followup_sequences ADD CONSTRAINT ai_followup_sequences_type_valid CHECK (followup_type IN ('telegram', 'email', 'reminder_task'));
      END IF;
    END $$;

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

    CREATE TABLE IF NOT EXISTS ai_followup_rules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      rule_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
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
      status TEXT NOT NULL DEFAULT 'suggested',
      suggested_channel TEXT NOT NULL DEFAULT 'crm',
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
      status TEXT NOT NULL DEFAULT 'suggested',
      suggested_channel TEXT NOT NULL DEFAULT 'crm',
      generated_message TEXT NOT NULL DEFAULT '',
      scheduled_for TIMESTAMPTZ,
      approved_at TIMESTAMPTZ,
      sent_at TIMESTAMPTZ,
      error TEXT,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE ai_followup_jobs ADD COLUMN IF NOT EXISTS reason TEXT NOT NULL DEFAULT '';
    ALTER TABLE ai_followup_jobs ADD COLUMN IF NOT EXISTS urgency TEXT NOT NULL DEFAULT 'medium';
    ALTER TABLE ai_followup_jobs ADD COLUMN IF NOT EXISTS error TEXT;
    ALTER TABLE ai_followup_jobs ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

    ALTER TABLE ai_followup_jobs DROP CONSTRAINT IF EXISTS ai_followup_jobs_status_valid;
    ALTER TABLE ai_followup_attempts DROP CONSTRAINT IF EXISTS ai_followup_attempts_status_valid;

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
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_followup_rules_status_valid') THEN
        ALTER TABLE ai_followup_rules ADD CONSTRAINT ai_followup_rules_status_valid CHECK (status IN ('active', 'paused', 'archived'));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_followup_jobs_status_valid') THEN
        ALTER TABLE ai_followup_jobs ADD CONSTRAINT ai_followup_jobs_status_valid CHECK (status IN ('suggested', 'approved', 'rejected', 'sent', 'failed', 'replied'));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_followup_attempts_status_valid') THEN
        ALTER TABLE ai_followup_attempts ADD CONSTRAINT ai_followup_attempts_status_valid CHECK (status IN ('suggested', 'approved', 'rejected', 'sent', 'failed', 'replied'));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_followup_jobs_channel_valid') THEN
        ALTER TABLE ai_followup_jobs ADD CONSTRAINT ai_followup_jobs_channel_valid CHECK (suggested_channel IN ('telegram', 'email', 'crm'));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_followup_attempts_channel_valid') THEN
        ALTER TABLE ai_followup_attempts ADD CONSTRAINT ai_followup_attempts_channel_valid CHECK (suggested_channel IN ('telegram', 'email', 'crm'));
      END IF;
    END $$;


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
      approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
      approved_at TIMESTAMPTZ,
      executed_at TIMESTAMPTZ,
      error_message TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE ai_worker_queue ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id) ON DELETE SET NULL;
    ALTER TABLE ai_worker_queue ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
    ALTER TABLE ai_worker_queue ADD COLUMN IF NOT EXISTS executed_at TIMESTAMPTZ;
    ALTER TABLE ai_worker_queue ADD COLUMN IF NOT EXISTS error_message TEXT;

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_workers_status_valid') THEN
        ALTER TABLE ai_workers ADD CONSTRAINT ai_workers_status_valid CHECK (status IN ('active', 'paused', 'error'));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_workers_mode_valid') THEN
        ALTER TABLE ai_workers ADD CONSTRAINT ai_workers_mode_valid CHECK (mode IN ('suggestion_only', 'approval_required', 'autonomous_ready'));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_workers_type_valid') THEN
        ALTER TABLE ai_workers ADD CONSTRAINT ai_workers_type_valid CHECK (type IN ('ai_sdr_agent', 'ai_followup_worker', 'ai_revenue_analyst', 'ai_crm_assistant', 'ai_email_assistant', 'ai_telegram_assistant'));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_worker_runs_status_valid') THEN
        ALTER TABLE ai_worker_runs ADD CONSTRAINT ai_worker_runs_status_valid CHECK (status IN ('queued', 'running', 'completed', 'failed'));
      END IF;
      UPDATE ai_worker_queue SET status = 'executing' WHERE status IN ('queued', 'running');
      ALTER TABLE ai_worker_queue DROP CONSTRAINT IF EXISTS ai_worker_queue_status_valid;
      ALTER TABLE ai_worker_queue ADD CONSTRAINT ai_worker_queue_status_valid CHECK (status IN ('pending_approval', 'approved', 'rejected', 'executing', 'completed', 'failed', 'cancelled'));
    END $$;


    CREATE TABLE IF NOT EXISTS ai_action_queue (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      action_type TEXT NOT NULL,
      channel TEXT NOT NULL DEFAULT 'crm',
      status TEXT NOT NULL DEFAULT 'draft',
      title TEXT NOT NULL,
      generated_text TEXT NOT NULL DEFAULT '',
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      approved_by_user UUID REFERENCES users(id) ON DELETE SET NULL,
      approved_at TIMESTAMPTZ,
      sent_at TIMESTAMPTZ,
      error TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS lead_timeline_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      event_type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT,
      source TEXT NOT NULL DEFAULT 'crm',
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS lead_attachments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      material_key TEXT NOT NULL,
      file_name TEXT NOT NULL,
      mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
      file_type TEXT NOT NULL DEFAULT 'document',
      channel TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      storage_path TEXT,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      sent_at TIMESTAMPTZ,
      error TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_action_queue_status_valid') THEN
        ALTER TABLE ai_action_queue ADD CONSTRAINT ai_action_queue_status_valid CHECK (status IN ('draft', 'pending_approval', 'approved', 'sent', 'failed', 'cancelled'));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_action_queue_action_type_valid') THEN
        ALTER TABLE ai_action_queue ADD CONSTRAINT ai_action_queue_action_type_valid CHECK (action_type IN ('telegram_follow_up', 'email_follow_up', 'commercial_offer', 'send_presentation', 'send_screenshots', 'send_demo_link', 'move_lead_stage', 'create_reminder'));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_action_queue_channel_valid') THEN
        ALTER TABLE ai_action_queue ADD CONSTRAINT ai_action_queue_channel_valid CHECK (channel IN ('telegram', 'email', 'crm'));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lead_attachments_status_valid') THEN
        ALTER TABLE lead_attachments ADD CONSTRAINT lead_attachments_status_valid CHECK (status IN ('draft', 'sent', 'failed'));
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS idx_ai_workers_workspace_type ON ai_workers(workspace_id, type);
    CREATE INDEX IF NOT EXISTS idx_ai_worker_runs_worker ON ai_worker_runs(workspace_id, worker_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_ai_worker_queue_status ON ai_worker_queue(workspace_id, status, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_ai_worker_queue_lead ON ai_worker_queue(workspace_id, lead_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_ai_action_queue_workspace_status ON ai_action_queue(workspace_id, status, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_ai_action_queue_lead ON ai_action_queue(workspace_id, lead_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_lead_timeline_events_lead ON lead_timeline_events(workspace_id, lead_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_lead_attachments_lead ON lead_attachments(workspace_id, lead_id, created_at DESC);


    CREATE INDEX IF NOT EXISTS idx_workspaces_owner_user_id ON workspaces(owner_user_id);
    CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);
    CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_crm_leads_workspace_id ON crm_leads(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_ai_tasks_workspace_id ON ai_tasks(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_credits_ledger_workspace_id ON credits_ledger(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_email_messages_workspace_id ON email_messages(workspace_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_telegram_messages_workspace_id ON telegram_messages(workspace_id, created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
    CREATE INDEX IF NOT EXISTS idx_credits_ledger_user_id ON credits_ledger(user_id);
    CREATE INDEX IF NOT EXISTS idx_ai_tasks_user_id ON ai_tasks(user_id);
    CREATE INDEX IF NOT EXISTS idx_crm_stages_user_id ON crm_stages(user_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_stages_workspace_status ON crm_stages(workspace_id, status);
    CREATE INDEX IF NOT EXISTS idx_crm_leads_user_id ON crm_leads(user_id);
    DROP INDEX IF EXISTS idx_crm_leads_telegram_identity;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_leads_telegram_identity ON crm_leads(workspace_id, telegram_id) WHERE source = 'telegram' AND telegram_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_crm_leads_telegram_last_seen ON crm_leads(workspace_id, last_seen_at) WHERE source = 'telegram';
    CREATE INDEX IF NOT EXISTS idx_crm_notes_lead_id ON crm_notes(lead_id);
    CREATE INDEX IF NOT EXISTS idx_telegram_messages_lead_id ON telegram_messages(lead_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_telegram_messages_user_id ON telegram_messages(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_crm_leads_telegram_chat_id ON crm_leads(workspace_id, telegram_chat_id);
    CREATE INDEX IF NOT EXISTS idx_telegram_messages_chat_id ON telegram_messages(workspace_id, telegram_chat_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_crm_followups_user_id ON crm_followups(user_id);
    CREATE INDEX IF NOT EXISTS idx_crm_followups_lead_id ON crm_followups(lead_id);
    CREATE INDEX IF NOT EXISTS idx_crm_activity_user_id ON crm_activity(user_id);
    CREATE INDEX IF NOT EXISTS idx_crm_activity_lead_id ON crm_activity(lead_id);
    CREATE INDEX IF NOT EXISTS idx_lead_ai_scores_latest ON lead_ai_scores(workspace_id, lead_id, generated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_lead_ai_scores_priority_dashboard ON lead_ai_scores(workspace_id, temperature, score DESC, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_ai_worker_queue_lead_prioritization ON ai_worker_queue(workspace_id, action_type, status, created_at DESC) WHERE action_type = 'lead_prioritization';
    CREATE INDEX IF NOT EXISTS idx_ai_followup_sequences_pending ON ai_followup_sequences(workspace_id, status, scheduled_for DESC);
    CREATE INDEX IF NOT EXISTS idx_ai_agents_workspace_type ON ai_agents(workspace_id, type);
    CREATE INDEX IF NOT EXISTS idx_ai_agent_actions_queue ON ai_agent_actions(status, priority DESC, next_retry_at, created_at);
    CREATE INDEX IF NOT EXISTS idx_ai_agent_actions_lead ON ai_agent_actions(workspace_id, lead_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_ai_agent_runs_action ON ai_agent_runs(action_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_ai_followups_lead ON ai_followups(workspace_id, lead_id, created_at DESC);

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
    CREATE INDEX IF NOT EXISTS idx_ai_worker_queue_outreach_dedup ON ai_worker_queue(workspace_id, lead_id, action_type, ((payload->>'outreachType')), created_at DESC) WHERE action_type IN ('telegram_draft', 'email_draft');
    CREATE INDEX IF NOT EXISTS idx_ai_worker_queue_outreach_dashboard ON ai_worker_queue(workspace_id, action_type, status, created_at DESC) WHERE action_type IN ('telegram_draft', 'email_draft');
    CREATE INDEX IF NOT EXISTS idx_ai_followup_attempts_lead ON ai_followup_attempts(workspace_id, lead_id, created_at DESC);

  `)
}

module.exports = { migrate }
