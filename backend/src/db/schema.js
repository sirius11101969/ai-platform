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



    ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS telegram TEXT;
    ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS notes TEXT;
    UPDATE crm_leads SET stage = status WHERE stage IS NULL OR stage = '' OR stage <> status;

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

    CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
    CREATE INDEX IF NOT EXISTS idx_credits_ledger_user_id ON credits_ledger(user_id);
    CREATE INDEX IF NOT EXISTS idx_ai_tasks_user_id ON ai_tasks(user_id);
    CREATE INDEX IF NOT EXISTS idx_crm_leads_user_id ON crm_leads(user_id);
    CREATE INDEX IF NOT EXISTS idx_crm_notes_lead_id ON crm_notes(lead_id);
    CREATE INDEX IF NOT EXISTS idx_crm_followups_user_id ON crm_followups(user_id);
    CREATE INDEX IF NOT EXISTS idx_crm_followups_lead_id ON crm_followups(lead_id);
    CREATE INDEX IF NOT EXISTS idx_crm_activity_user_id ON crm_activity(user_id);
    CREATE INDEX IF NOT EXISTS idx_crm_activity_lead_id ON crm_activity(lead_id);
  `)
}

module.exports = { migrate }
