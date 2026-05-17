-- Telegram meeting confirmation drafts after approved AI Meeting Scheduler execution.
CREATE INDEX IF NOT EXISTS idx_ai_worker_queue_telegram_meeting_confirmation_draft
  ON ai_worker_queue(workspace_id, lead_id, ((payload->>'meetingProposalQueueId')), status, created_at DESC)
  WHERE action_type = 'telegram_meeting_confirmation_draft';

CREATE INDEX IF NOT EXISTS idx_lead_timeline_events_telegram_meeting_confirmation_sent
  ON lead_timeline_events(workspace_id, lead_id, event_type, created_at DESC)
  WHERE event_type = 'telegram_meeting_confirmation_sent';
