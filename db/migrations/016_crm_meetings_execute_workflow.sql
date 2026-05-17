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

-- Meeting scheduler workers are unique per workspace through ai_workers(workspace_id, type).
DROP INDEX IF EXISTS idx_ai_workers_unique_meeting_scheduler;
