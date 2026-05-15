ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS telegram_id TEXT;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS telegram_username TEXT;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS first_message TEXT;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS telegram_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  message TEXT NOT NULL,
  telegram_message_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_leads_telegram_identity
  ON crm_leads(user_id, telegram_id)
  WHERE source = 'telegram' AND telegram_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_crm_leads_telegram_last_seen
  ON crm_leads(user_id, last_seen_at)
  WHERE source = 'telegram';

CREATE INDEX IF NOT EXISTS idx_telegram_messages_lead_id
  ON telegram_messages(lead_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_telegram_messages_user_id
  ON telegram_messages(user_id, created_at DESC);
