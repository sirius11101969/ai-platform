INSERT INTO lead_stages (name, position)
VALUES
  ('New', 1),
  ('Qualified', 2),
  ('Proposal Sent', 3),
  ('Booked', 4),
  ('Closed Won', 5),
  ('Closed Lost', 6)
ON CONFLICT DO NOTHING;
