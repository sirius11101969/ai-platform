ALTER TABLE telegram_messages ADD COLUMN IF NOT EXISTS direction TEXT;
ALTER TABLE telegram_messages ADD COLUMN IF NOT EXISTS body TEXT;

UPDATE telegram_messages
   SET direction = COALESCE(direction, CASE WHEN role = 'user' THEN 'inbound' ELSE 'outbound' END),
       body = COALESCE(body, message)
 WHERE direction IS NULL OR body IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'telegram_messages_direction_valid') THEN
    ALTER TABLE telegram_messages ADD CONSTRAINT telegram_messages_direction_valid CHECK (direction IS NULL OR direction IN ('inbound', 'outbound'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_crm_leads_active_telegram_chat_id
  ON crm_leads(workspace_id, telegram_chat_id, status)
  WHERE telegram_chat_id IS NOT NULL AND status <> 'lost';

CREATE INDEX IF NOT EXISTS idx_ai_worker_queue_telegram_reply_analysis
  ON ai_worker_queue(workspace_id, lead_id, status, created_at DESC)
  WHERE action_type = 'telegram_reply_analysis';

CREATE INDEX IF NOT EXISTS idx_lead_timeline_events_telegram_connect_reply
  ON lead_timeline_events(workspace_id, lead_id, event_type, created_at DESC)
  WHERE event_type IN ('telegram_connected', 'telegram_reply_received', 'telegram_message_sent');
