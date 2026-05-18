const pool = require('../db/pool')
const { createVoiceProvider } = require('../providers/voice')
const { addTimelineEvent } = require('./timelineService')
const { sanitizeAiActionPayload, sanitizeAiCopy } = require('../utils/aiCopySanitizer')
const aiRevenueIntelligenceService = require('./aiRevenueIntelligenceService')

const VOICE_OUTREACH_CALL_JOB_TYPE = 'voice_outreach_call'
const VOICE_CALL_ANALYSIS_JOB_TYPE = 'voice_call_analysis'
const AI_VOICE_WORKER_TYPE = 'ai_voice_worker'
const DEFAULT_PROVIDER = 'mock_provider'
const ALLOWED_STATUSES = new Set(['queued', 'dialing', 'active', 'completed', 'failed', 'rejected'])

function safeJsonb(value) {
  return JSON.stringify(value ?? {})
}

function normalizeCall(row = {}) {
  if (!row) return null
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    leadId: row.lead_id,
    sequenceId: row.sequence_id,
    provider: row.provider,
    status: row.status,
    phoneNumber: row.phone_number,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    durationSeconds: row.duration_seconds === null || row.duration_seconds === undefined ? null : Number(row.duration_seconds),
    transcript: row.transcript,
    summary: row.summary,
    sentiment: row.sentiment,
    outcome: row.outcome,
    nextAction: row.next_action,
    recordingUrl: row.recording_url,
    metadata: row.metadata || {},
    createdAt: row.created_at,
  }
}

function normalizeEvent(row = {}) {
  return row ? { id: row.id, callId: row.call_id, eventType: row.event_type, payload: row.payload || {}, createdAt: row.created_at } : null
}

function extractPhoneNumber({ phoneNumber, lead = {} }) {
  return String(phoneNumber || lead.phone || lead.phone_number || lead.contact || '').trim()
}

function analyzeTranscript({ transcript = '', lead = {} } = {}) {
  const text = String(transcript || '')
  const lower = text.toLowerCase()
  const positive = ['demo', 'pricing', 'useful', 'yes', 'interested', 'evaluating'].some((word) => lower.includes(word))
  const negative = ['not interested', 'do not call', 'wrong number', 'stop calling'].some((word) => lower.includes(word))
  const sentiment = negative ? 'negative' : positive ? 'positive' : 'neutral'
  const qualificationLevel = negative ? 'disqualified' : positive ? 'qualified' : 'nurture'
  const outcome = negative ? 'rejected' : positive ? 'qualified_demo_interest' : 'needs_nurture'
  const nextAction = negative ? 'Respect opt-out and pause voice outreach' : positive ? 'Schedule demo and send pricing context' : 'Send value follow-up before another call'
  const summary = sanitizeAiCopy(`${lead.name || 'Lead'} completed a mock AI voice qualification call. Sentiment appears ${sentiment}; qualification level is ${qualificationLevel}. Recommended next action: ${nextAction}.`)
  return { summary, sentiment, qualificationLevel, outcome, nextAction }
}

async function insertCallEvent(client, { callId, eventType, payload = {} }) {
  const result = await client.query(
    `INSERT INTO ai_voice_call_events(call_id, event_type, payload)
     VALUES($1::uuid, $2::text, $3::jsonb)
     RETURNING *`,
    [callId, eventType, safeJsonb(payload)]
  )
  return normalizeEvent(result.rows[0])
}

async function ensureVoiceWorker(client, workspaceId) {
  const result = await client.query(
    `INSERT INTO ai_workers(workspace_id, name, type, status, mode, description)
     VALUES($1::uuid, 'AI Voice Worker', $2::text, 'active', 'approval_required', 'Runs mock-mode voice outreach calls and stores transcripts, summaries, outcomes, and next actions.')
     ON CONFLICT (workspace_id, type) DO UPDATE
       SET name = EXCLUDED.name, status = 'active', mode = EXCLUDED.mode, description = EXCLUDED.description, updated_at = NOW()
     RETURNING id`,
    [workspaceId, AI_VOICE_WORKER_TYPE]
  )
  return result.rows[0]
}

async function createCallRecord(client, { workspaceId, leadId, sequenceId = null, provider = DEFAULT_PROVIDER, phoneNumber, metadata = {} }) {
  const result = await client.query(
    `INSERT INTO ai_voice_calls(workspace_id, lead_id, sequence_id, provider, status, phone_number, metadata)
     VALUES($1::uuid, $2::uuid, $3::uuid, $4::text, 'queued', $5::text, $6::jsonb)
     RETURNING *`,
    [workspaceId, leadId, sequenceId, provider, phoneNumber, safeJsonb({ ...metadata, mockMode: true, telephonyTrafficSent: false })]
  )
  await insertCallEvent(client, { callId: result.rows[0].id, eventType: 'queued', payload: { provider, mockMode: true } })
  return result.rows[0]
}

async function updateCallStatus(client, { callId, status, payload = {} }) {
  if (!ALLOWED_STATUSES.has(status)) throw Object.assign(new Error('Invalid voice call status'), { statusCode: 400 })
  const result = await client.query(
    `UPDATE ai_voice_calls
        SET status = $2::text,
            started_at = CASE WHEN $2::text IN ('dialing','active') AND started_at IS NULL THEN NOW() ELSE started_at END,
            completed_at = CASE WHEN $2::text IN ('completed','failed','rejected') THEN NOW() ELSE completed_at END,
            metadata = metadata || $3::jsonb
      WHERE id = $1::uuid
      RETURNING *`,
    [callId, status, safeJsonb(payload)]
  )
  await insertCallEvent(client, { callId, eventType: status, payload })
  return result.rows[0]
}

async function loadLead(client, workspaceId, leadId) {
  const result = await client.query('SELECT * FROM crm_leads WHERE workspace_id = $1::uuid AND id = $2::uuid LIMIT 1', [workspaceId, leadId])
  return result.rows[0] || null
}

async function completeMockCall(client, { call, lead, userId = null, context = {} }) {
  await updateCallStatus(client, { callId: call.id, status: 'dialing', payload: { mockMode: true } })
  await addTimelineEvent(client, { workspaceId: call.workspace_id, leadId: call.lead_id, userId, eventType: 'ai_voice_call_started', title: 'AI voice call started', body: 'Mock-mode AI voice outreach call started. No real telephony traffic was sent.', source: 'ai', metadata: { callId: call.id, provider: call.provider, mockMode: true } })
  await updateCallStatus(client, { callId: call.id, status: 'active', payload: { mockMode: true } })
  let completed
  let analysis
  let providerResult
  try {
    const provider = createVoiceProvider(call.provider || DEFAULT_PROVIDER)
    providerResult = await provider.startCall({ lead, phoneNumber: call.phone_number, context })
    analysis = analyzeTranscript({ transcript: providerResult.transcript, lead })
    const result = await client.query(
      `UPDATE ai_voice_calls
          SET status = 'completed', completed_at = NOW(), duration_seconds = $2::integer, transcript = $3::text,
              summary = $4::text, sentiment = $5::text, outcome = $6::text, next_action = $7::text,
              recording_url = $8::text, metadata = metadata || $9::jsonb
        WHERE id = $1::uuid
        RETURNING *`,
      [call.id, providerResult.durationSeconds, providerResult.transcript, analysis.summary, analysis.sentiment, analysis.outcome, analysis.nextAction, providerResult.recordingUrl, safeJsonb({ ...providerResult.metadata, qualificationLevel: analysis.qualificationLevel })]
    )
    completed = result.rows[0]
  } catch (error) {
    await updateCallStatus(client, { callId: call.id, status: 'failed', payload: { error: error.message, mockMode: true } })
    await addTimelineEvent(client, { workspaceId: call.workspace_id, leadId: call.lead_id, userId, eventType: 'ai_voice_call_failed', title: 'AI voice call failed', body: 'Mock-mode AI voice outreach call failed before completion.', source: 'ai', metadata: { callId: call.id, error: error.message, mockMode: true } }).catch(() => null)
    throw error
  }
  await insertCallEvent(client, { callId: call.id, eventType: 'transcript_stored', payload: { transcriptLength: providerResult.transcript.length } })
  await insertCallEvent(client, { callId: call.id, eventType: 'analysis_completed', payload: analysis })
  await addTimelineEvent(client, { workspaceId: call.workspace_id, leadId: call.lead_id, userId, eventType: 'ai_voice_call_completed', title: 'AI voice call completed', body: analysis.summary, source: 'ai', metadata: { callId: call.id, sentiment: analysis.sentiment, outcome: analysis.outcome, qualificationLevel: analysis.qualificationLevel, mockMode: true } })
  await addTimelineEvent(client, { workspaceId: call.workspace_id, leadId: call.lead_id, userId, eventType: 'ai_voice_followup_recommended', title: 'AI voice follow-up recommended', body: analysis.nextAction, source: 'ai', metadata: { callId: call.id, nextAction: analysis.nextAction, outcome: analysis.outcome } })
  await ensureVoiceWorker(client, call.workspace_id)
  await aiRevenueIntelligenceService.analyzeLeadRevenueIntelligence({ workspaceId: call.workspace_id, userId, leadId: call.lead_id, client }).catch(() => null)
  return completed
}

async function initiateCall({ workspaceId, userId = null, leadId, sequenceId = null, provider = DEFAULT_PROVIDER, phoneNumber = null, metadata = {}, autoComplete = true, context = {}, client = null } = {}) {
  if (!workspaceId) throw Object.assign(new Error('workspaceId is required'), { statusCode: 400 })
  if (!leadId) throw Object.assign(new Error('leadId is required'), { statusCode: 400 })
  const executor = client || await pool.connect()
  const release = !client && executor.release ? () => executor.release() : null
  try {
    const lead = await loadLead(executor, workspaceId, leadId)
    if (!lead) throw Object.assign(new Error('Lead not found'), { statusCode: 404 })
    const resolvedPhone = extractPhoneNumber({ phoneNumber, lead })
    if (!resolvedPhone) throw Object.assign(new Error('Phone number is required for mock voice outreach'), { statusCode: 400 })
    const call = await createCallRecord(executor, { workspaceId, leadId, sequenceId, provider: provider || DEFAULT_PROVIDER, phoneNumber: resolvedPhone, metadata })
    if (!autoComplete) return normalizeCall(call)
    return normalizeCall(await completeMockCall(executor, { call, lead, userId, context }))
  } catch (error) {
    throw error
  } finally {
    if (release) release()
  }
}

async function analyzeCall({ workspaceId, userId = null, callId, client = pool } = {}) {
  const result = await client.query('SELECT c.*, l.name AS lead_name FROM ai_voice_calls c JOIN crm_leads l ON l.id = c.lead_id WHERE c.workspace_id = $1::uuid AND c.id = $2::uuid LIMIT 1', [workspaceId, callId])
  const call = result.rows[0]
  if (!call) throw Object.assign(new Error('Voice call not found'), { statusCode: 404 })
  const analysis = analyzeTranscript({ transcript: call.transcript, lead: { name: call.lead_name } })
  const updated = await client.query(
    `UPDATE ai_voice_calls SET summary = $3::text, sentiment = $4::text, outcome = $5::text, next_action = $6::text, metadata = metadata || $7::jsonb WHERE workspace_id = $1::uuid AND id = $2::uuid RETURNING *`,
    [workspaceId, callId, analysis.summary, analysis.sentiment, analysis.outcome, analysis.nextAction, safeJsonb({ qualificationLevel: analysis.qualificationLevel, analyzedBy: 'deterministic-voice-analysis-v1' })]
  )
  await insertCallEvent(client, { callId, eventType: 'analysis_completed', payload: analysis })
  await addTimelineEvent(client, { workspaceId, leadId: call.lead_id, userId, eventType: 'ai_voice_followup_recommended', title: 'AI voice follow-up recommended', body: analysis.nextAction, source: 'ai', metadata: { callId, nextAction: analysis.nextAction, outcome: analysis.outcome } })
  return normalizeCall(updated.rows[0])
}

async function getCalls({ workspaceId, status = null, limit = 100 } = {}) {
  const params = [workspaceId, status, Math.min(Math.max(Number(limit) || 100, 1), 250)]
  const result = await pool.query(
    `SELECT c.*, l.name AS lead_name
       FROM ai_voice_calls c JOIN crm_leads l ON l.id = c.lead_id
      WHERE c.workspace_id = $1::uuid AND ($2::text IS NULL OR c.status = $2::text)
      ORDER BY c.created_at DESC
      LIMIT $3::integer`,
    params
  )
  return result.rows.map((row) => ({ ...normalizeCall(row), leadName: row.lead_name }))
}

async function getCall({ workspaceId, callId } = {}) {
  const result = await pool.query('SELECT * FROM ai_voice_calls WHERE workspace_id = $1::uuid AND id = $2::uuid LIMIT 1', [workspaceId, callId])
  const call = normalizeCall(result.rows[0])
  if (!call) throw Object.assign(new Error('Voice call not found'), { statusCode: 404 })
  const events = await pool.query('SELECT * FROM ai_voice_call_events WHERE call_id = $1::uuid ORDER BY created_at ASC', [callId])
  return { ...call, events: events.rows.map(normalizeEvent) }
}

async function enqueueVoiceCall({ client = pool, workspaceId, userId, leadId, sequenceId = null, phoneNumber = null, queueName = process.env.AI_EXECUTION_QUEUE_NAME || 'ai-execution' } = {}) {
  const idempotencyKey = `${VOICE_OUTREACH_CALL_JOB_TYPE}:${workspaceId}:${leadId}:${sequenceId || 'manual'}:${new Date().toISOString().slice(0, 13)}`
  const payload = sanitizeAiActionPayload({ leadId, sequenceId, phoneNumber, provider: DEFAULT_PROVIDER, mockMode: true })
  const result = await client.query(
    `INSERT INTO ai_execution_jobs(workspace_id, user_id, queue_name, job_type, priority, status, payload, max_attempts, run_after, idempotency_key)
     VALUES($1::uuid, $2::uuid, $3::text, $4::text, 75, 'queued', $5::jsonb, 2, NOW(), $6::text)
     ON CONFLICT (workspace_id, idempotency_key) DO NOTHING
     RETURNING id`,
    [workspaceId, userId, queueName, VOICE_OUTREACH_CALL_JOB_TYPE, safeJsonb(payload), idempotencyKey]
  )
  return result.rows[0] || null
}

async function executeVoiceOutreachCallJob(job) {
  const payload = job.payload || {}
  const call = await initiateCall({ workspaceId: job.workspace_id, userId: job.user_id, leadId: payload.leadId || payload.lead_id, sequenceId: payload.sequenceId || payload.sequence_id || null, phoneNumber: payload.phoneNumber || payload.phone_number || null, provider: DEFAULT_PROVIDER, metadata: { executionJobId: job.id, source: VOICE_OUTREACH_CALL_JOB_TYPE }, autoComplete: true })
  return { ok: true, jobType: VOICE_OUTREACH_CALL_JOB_TYPE, callId: call.id, leadId: call.leadId, status: call.status, sentiment: call.sentiment, outcome: call.outcome, nextAction: call.nextAction }
}

async function executeVoiceCallAnalysisJob(job) {
  const payload = job.payload || {}
  const call = await analyzeCall({ workspaceId: job.workspace_id, userId: job.user_id, callId: payload.callId || payload.call_id })
  return { ok: true, jobType: VOICE_CALL_ANALYSIS_JOB_TYPE, callId: call.id, sentiment: call.sentiment, outcome: call.outcome, nextAction: call.nextAction }
}

module.exports = {
  AI_VOICE_WORKER_TYPE,
  VOICE_OUTREACH_CALL_JOB_TYPE,
  VOICE_CALL_ANALYSIS_JOB_TYPE,
  analyzeCall,
  analyzeTranscript,
  enqueueVoiceCall,
  executeVoiceCallAnalysisJob,
  executeVoiceOutreachCallJob,
  getCall,
  getCalls,
  initiateCall,
  _private: { completeMockCall, extractPhoneNumber, normalizeCall, updateCallStatus },
}
