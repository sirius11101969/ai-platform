-- Sprint 1 CRM MVP schema
-- Purpose: first working lead-to-CRM pipeline.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'manager',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT users_email_not_blank CHECK (length(trim(email)) > 0),
  CONSTRAINT users_full_name_not_blank CHECK (length(trim(full_name)) > 0),
  CONSTRAINT users_role_valid CHECK (role IN ('owner', 'manager', 'operator', 'admin'))
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_uidx
  ON users (lower(email));

CREATE TABLE IF NOT EXISTS lead_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  position INTEGER NOT NULL UNIQUE,
  is_terminal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT lead_stages_name_not_blank CHECK (length(trim(name)) > 0),
  CONSTRAINT lead_stages_position_positive CHECK (position > 0)
);

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID NOT NULL REFERENCES lead_stages(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  assigned_manager_id UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  company_name TEXT,
  service_type TEXT,
  source TEXT NOT NULL DEFAULT 'landing',
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT leads_customer_name_not_blank CHECK (length(trim(customer_name)) > 0),
  CONSTRAINT leads_phone_or_email_required CHECK (
    phone IS NOT NULL
    OR email IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS leads_stage_id_idx
  ON leads(stage_id);

CREATE INDEX IF NOT EXISTS leads_assigned_manager_id_idx
  ON leads(assigned_manager_id);

CREATE TABLE IF NOT EXISTS lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON UPDATE CASCADE ON DELETE CASCADE,
  author_user_id UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT lead_notes_note_not_blank CHECK (length(trim(note)) > 0)
);

CREATE INDEX IF NOT EXISTS lead_notes_lead_id_idx
  ON lead_notes(lead_id);

CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON UPDATE CASCADE ON DELETE CASCADE,
  actor_user_id UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT activity_log_type_not_blank CHECK (length(trim(activity_type)) > 0),
  CONSTRAINT activity_log_payload_is_object CHECK (jsonb_typeof(payload) = 'object')
);

CREATE INDEX IF NOT EXISTS activity_log_lead_id_idx
  ON activity_log(lead_id);

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER lead_stages_set_updated_at
  BEFORE UPDATE ON lead_stages
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER leads_set_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER lead_notes_set_updated_at
  BEFORE UPDATE ON lead_notes
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER activity_log_set_updated_at
  BEFORE UPDATE ON activity_log
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

COMMIT;
