import assert from 'node:assert/strict'
import { buildMockVoiceCallPayload, buildVoiceCallDetail, buildVoiceDashboard, VOICE_SAFETY_LABELS } from '../src/utils/aiVoiceOutreach.js'

const calls = [
  { id: 'queued', leadName: 'Queued Lead', phoneNumber: '+100', provider: 'mock_provider', status: 'queued', createdAt: '2026-05-18T10:00:00Z' },
  { id: 'active', leadName: 'Active Lead', phone_number: '+101', provider: 'mock_provider', status: 'active', created_at: '2026-05-18T10:01:00Z' },
  { id: 'done', lead_name: 'Acme', phone_number: '+102', provider: 'mock_provider', status: 'completed', sentiment: 'positive', outcome: 'qualified_demo_interest', next_action: 'Schedule demo', duration_seconds: 44, metadata: { qualificationLevel: 'qualified' }, created_at: '2026-05-18T10:02:00Z' },
  { id: 'failed', leadName: 'Failed Lead', status: 'failed', sentiment: 'negative', outcome: 'rejected' },
]

const dashboard = buildVoiceDashboard(calls)
assert.equal(dashboard.stats.queued, 1, 'dashboard rendering includes queued calls')
assert.equal(dashboard.stats.active, 1, 'dashboard rendering includes active calls')
assert.equal(dashboard.stats.completed, 1, 'dashboard rendering includes completed calls')
assert.equal(dashboard.stats.positive, 1, 'dashboard rendering includes positive sentiment')
assert.equal(dashboard.stats.failed, 1, 'dashboard rendering includes failed calls')
assert.deepEqual(dashboard.safetyLabels, VOICE_SAFETY_LABELS)
assert.equal(dashboard.recommended[0].nextAction, 'Schedule demo')

const detail = buildVoiceCallDetail({
  ...calls[2],
  transcript: 'AI: Hello. Lead: Yes, send pricing and demo times.',
  summary: 'Acme is interested in a demo.',
  events: [{ id: 'e1', event_type: 'queued', payload: { mockMode: true }, created_at: '2026-05-18T10:02:01Z' }],
})
assert.equal(detail.leadName, 'Acme', 'call detail rendering normalizes lead name')
assert.equal(detail.qualificationLevel, 'qualified', 'call detail rendering includes qualification level')
assert.equal(detail.timeline.length, 1, 'call detail rendering includes timeline events')
assert.equal(detail.metadataEntries.find((entry) => entry.key === 'qualificationLevel').value, 'qualified')

const payload = buildMockVoiceCallPayload({ leadId: 'lead-1', phoneNumber: '+15551234567' })
assert.deepEqual(payload, { autoComplete: true, leadId: 'lead-1', phoneNumber: '+15551234567' }, 'mock call creation payload targets existing API')

const empty = buildVoiceDashboard([])
assert.equal(empty.isEmpty, true, 'empty states are explicit')
assert.equal(empty.recommended.length, 0, 'empty states do not render recommendations')

console.log('ai voice outreach tests passed')
