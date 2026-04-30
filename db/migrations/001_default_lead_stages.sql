-- Sprint 1 CRM MVP seed data
-- Idempotently creates the default CRM pipeline stages.

BEGIN;

INSERT INTO lead_stages (name, position, is_terminal)
VALUES
  ('New', 1, FALSE),
  ('Qualified', 2, FALSE),
  ('Proposal Sent', 3, FALSE),
  ('Booked', 4, FALSE),
  ('Closed Won', 5, TRUE),
  ('Closed Lost', 6, TRUE)
ON CONFLICT (name) DO UPDATE
SET
  position = EXCLUDED.position,
  is_terminal = EXCLUDED.is_terminal,
  updated_at = NOW();

COMMIT;
