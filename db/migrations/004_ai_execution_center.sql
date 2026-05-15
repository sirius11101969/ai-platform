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

    CREATE INDEX IF NOT EXISTS idx_ai_action_queue_workspace_status ON ai_action_queue(workspace_id, status, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_ai_action_queue_lead ON ai_action_queue(workspace_id, lead_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_lead_timeline_events_lead ON lead_timeline_events(workspace_id, lead_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_lead_attachments_lead ON lead_attachments(workspace_id, lead_id, created_at DESC);
