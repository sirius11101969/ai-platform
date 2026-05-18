export const VOICE_SAFETY_LABELS = ['Mock Mode', 'No real telephony traffic']

export function normalizeVoiceCall(call = {}) {
  const metadata = call.metadata || {}
  return {
    id: call.id || '',
    leadId: call.leadId || call.lead_id || '',
    leadName: call.leadName || call.lead_name || call.lead?.name || call.leadId || call.lead_id || 'Lead',
    phoneNumber: call.phoneNumber || call.phone_number || call.phone || '—',
    provider: call.provider || 'mock_provider',
    status: call.status || 'queued',
    sentiment: call.sentiment || '—',
    outcome: call.outcome || '—',
    nextAction: call.nextAction || call.next_action || metadata.nextAction || '—',
    durationSeconds: call.durationSeconds ?? call.duration_seconds ?? null,
    transcript: call.transcript || '',
    summary: call.summary || '',
    qualificationLevel: call.qualificationLevel || call.qualification_level || metadata.qualificationLevel || metadata.qualification_level || '—',
    metadata,
    createdAt: call.createdAt || call.created_at || null,
    completedAt: call.completedAt || call.completed_at || null,
    startedAt: call.startedAt || call.started_at || null,
    events: Array.isArray(call.events) ? call.events.map(normalizeVoiceEvent) : [],
  }
}

export function normalizeVoiceEvent(event = {}) {
  return {
    id: event.id || `${event.eventType || event.event_type || 'event'}-${event.createdAt || event.created_at || ''}`,
    eventType: event.eventType || event.event_type || 'event',
    payload: event.payload || {},
    createdAt: event.createdAt || event.created_at || null,
  }
}

export function buildVoiceDashboard(calls = []) {
  const normalized = calls.map(normalizeVoiceCall)
  const recommended = normalized
    .filter((call) => call.nextAction && call.nextAction !== '—')
    .slice(0, 5)
    .map((call) => ({ id: call.id, leadName: call.leadName, nextAction: call.nextAction, sentiment: call.sentiment, outcome: call.outcome }))

  return {
    calls: normalized,
    stats: {
      queued: normalized.filter((call) => call.status === 'queued').length,
      active: normalized.filter((call) => ['dialing', 'active'].includes(call.status)).length,
      completed: normalized.filter((call) => call.status === 'completed').length,
      positive: normalized.filter((call) => call.sentiment === 'positive').length,
      failed: normalized.filter((call) => ['failed', 'rejected'].includes(call.status)).length,
    },
    recommended,
    isEmpty: normalized.length === 0,
    safetyLabels: VOICE_SAFETY_LABELS,
  }
}

export function buildVoiceCallDetail(call = {}) {
  const normalized = normalizeVoiceCall(call)
  return {
    ...normalized,
    transcript: normalized.transcript || 'Transcript will appear after the mock call completes.',
    summary: normalized.summary || 'AI summary will appear after analysis.',
    qualificationLevel: normalized.qualificationLevel || '—',
    nextAction: normalized.nextAction || '—',
    metadataEntries: Object.entries(normalized.metadata || {}).map(([key, value]) => ({ key, value: typeof value === 'object' ? JSON.stringify(value) : String(value) })),
    timeline: normalized.events,
    safetyLabels: VOICE_SAFETY_LABELS,
  }
}

export function buildMockVoiceCallPayload({ leadId, phoneNumber } = {}) {
  const payload = { autoComplete: true }
  if (leadId) payload.leadId = leadId
  if (phoneNumber) payload.phoneNumber = phoneNumber
  return payload
}
