const pool = require('../db/pool')
const aiAgentModel = require('../models/aiAgentModel')
const { addTimelineEvent } = require('./timelineService')
const { scoreLeadContext } = require('./leadIntelligenceService')

const PUBLIC_LEAD_FIELDS = ['name', 'email', 'phone', 'telegram', 'company', 'message', 'source', 'page_url', 'utm_source', 'utm_medium', 'utm_campaign']
const MAX_FIELD_LENGTHS = {
  name: 160,
  email: 254,
  phone: 64,
  telegram: 64,
  company: 180,
  message: 3000,
  source: 120,
  page_url: 2000,
  utm_source: 200,
  utm_medium: 200,
  utm_campaign: 200,
}

function normalizeText(value, maxLength) {
  const normalized = String(value || '').replace(/\u0000/g, '').trim()
  if (!normalized) return null
  return normalized.slice(0, maxLength)
}

function normalizeEmail(value) {
  const email = normalizeText(value, MAX_FIELD_LENGTHS.email)?.toLowerCase() || null
  if (!email) return null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw Object.assign(new Error('Invalid email'), { statusCode: 400 })
  }
  return email
}

function normalizePageUrl(value) {
  const pageUrl = normalizeText(value, MAX_FIELD_LENGTHS.page_url)
  if (!pageUrl) return null
  try {
    const parsed = new URL(pageUrl)
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Invalid protocol')
    return parsed.toString().slice(0, MAX_FIELD_LENGTHS.page_url)
  } catch (_error) {
    throw Object.assign(new Error('Invalid page_url'), { statusCode: 400 })
  }
}

function normalizePayload(payload = {}) {
  const normalized = {}
  for (const field of PUBLIC_LEAD_FIELDS) {
    if (field === 'email') normalized.email = normalizeEmail(payload.email)
    else if (field === 'page_url') normalized.page_url = normalizePageUrl(payload.page_url)
    else normalized[field] = normalizeText(payload[field], MAX_FIELD_LENGTHS[field])
  }

  const hasContact = Boolean(normalized.email || normalized.phone || normalized.telegram)
  const hasIntent = Boolean(normalized.name || normalized.company || normalized.message)
  if (!hasContact || !hasIntent) {
    throw Object.assign(new Error('Lead contact and message context are required'), { statusCode: 400 })
  }

  if (normalized.phone && !/^[+()\-\s\d.]{5,64}$/.test(normalized.phone)) {
    throw Object.assign(new Error('Invalid phone'), { statusCode: 400 })
  }

  if (normalized.telegram && !/^@?[a-zA-Z0-9_]{3,64}$/.test(normalized.telegram)) {
    throw Object.assign(new Error('Invalid telegram'), { statusCode: 400 })
  }

  return normalized
}

async function resolveWorkspace(client) {
  const envWorkspaceId = normalizeText(process.env.PUBLIC_LEADS_WORKSPACE_ID, 80)
  const validEnvWorkspaceId = envWorkspaceId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(envWorkspaceId) ? envWorkspaceId : null
  const workspaceResult = validEnvWorkspaceId
    ? await client.query('SELECT * FROM workspaces WHERE id = $1 LIMIT 1', [validEnvWorkspaceId])
    : { rows: [] }

  const workspace = workspaceResult.rows[0] || (await client.query('SELECT * FROM workspaces ORDER BY created_at ASC LIMIT 1')).rows[0]
  if (!workspace) throw Object.assign(new Error('Public leads workspace is not configured'), { statusCode: 503 })

  const ownerResult = await client.query(
    `SELECT wm.user_id
       FROM workspace_members wm
      WHERE wm.workspace_id = $1 AND wm.role IN ('owner', 'admin', 'sales')
      ORDER BY CASE wm.role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END, wm.created_at ASC
      LIMIT 1`,
    [workspace.id]
  )
  const userId = ownerResult.rows[0]?.user_id || workspace.owner_user_id
  if (!userId) throw Object.assign(new Error('Public leads workspace owner is not configured'), { statusCode: 503 })

  return { workspaceId: workspace.id, userId }
}

async function ensureSdrWorker(client, workspaceId) {
  const result = await client.query(
    `INSERT INTO ai_workers(workspace_id, name, type, status, mode, description)
     VALUES($1, 'AI SDR', 'ai_sdr_agent', 'active', 'approval_required', 'Проверяет новых лидов с лендинга и готовит безопасные рекомендации для менеджера.')
     ON CONFLICT (workspace_id, type) DO UPDATE SET updated_at = NOW()
     RETURNING id`,
    [workspaceId]
  )
  return result.rows[0]
}

function buildMetadata(input, requestMeta = {}) {
  return {
    landing: true,
    originalSource: input.source || 'landing',
    message: input.message || '',
    pageUrl: input.page_url || '',
    utm: {
      source: input.utm_source || '',
      medium: input.utm_medium || '',
      campaign: input.utm_campaign || '',
    },
    request: {
      ip: requestMeta.ip || '',
      userAgent: requestMeta.userAgent || '',
      receivedAt: new Date().toISOString(),
    },
  }
}

function buildLeadContext(lead, metadata) {
  return {
    lead: {
      id: lead.id,
      name: lead.name,
      company: lead.company,
      email: lead.email,
      telegram: lead.telegram,
      source: lead.source,
      stage: lead.status,
      value: Number(lead.value || 0),
      notesText: lead.notes || '',
      createdAt: lead.created_at,
      updatedAt: lead.updated_at,
    },
    notes: metadata.message ? [{ body: metadata.message, source: 'landing' }] : [],
    followUps: [],
    telegramMessages: [],
    emails: [],
    activity: [],
    landing: metadata,
  }
}

async function createPublicLead(payload, requestMeta = {}) {
  const input = normalizePayload(payload)
  const client = await pool.connect()
  let actionId = null
  try {
    await client.query('BEGIN')
    const { workspaceId, userId } = await resolveWorkspace(client)
    const metadata = buildMetadata(input, requestMeta)
    const name = input.name || input.company || 'Лид с лендинга'
    const notes = input.message || null

    const leadResult = await client.query(
      `INSERT INTO crm_leads(user_id, workspace_id, name, email, phone, telegram, company, status, stage, value, source, notes, contact, metadata)
       VALUES($1, $2, $3, $4, $5, $6, $7, 'new', 'new', 0, 'landing', $8, COALESCE($6, $5, $4), $9)
       RETURNING *`,
      [userId, workspaceId, name, input.email, input.phone, input.telegram, input.company, notes, metadata]
    )
    const lead = leadResult.rows[0]

    await client.query(
      `INSERT INTO crm_activity(user_id, workspace_id, lead_id, type, title, body, metadata)
       VALUES($1, $2, $3, 'lead_created_from_landing', 'Лид создан с лендинга', $4, $5)`,
      [userId, workspaceId, lead.id, notes || `Источник: ${metadata.originalSource}`, metadata]
    )

    await addTimelineEvent(client, {
      workspaceId,
      leadId: lead.id,
      userId,
      eventType: 'lead_created_from_landing',
      title: 'Лид создан с лендинга',
      body: notes,
      source: 'landing',
      metadata,
    })

    const context = buildLeadContext(lead, metadata)
    const score = scoreLeadContext(context, {})
    await client.query(
      `INSERT INTO lead_ai_scores(workspace_id, lead_id, score, temperature, deal_probability, urgency_level, engagement_level, ai_summary, next_best_action, risk_level, ideal_contact_timing, objections_detected, recommended_cta, recommended_channel)
       VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [workspaceId, lead.id, score.score, score.temperature, score.dealProbability, score.urgencyLevel, score.engagementLevel, score.aiSummary, score.nextBestAction, score.riskLevel, score.idealContactTiming, JSON.stringify(score.objectionsDetected || []), score.recommendedCta, score.recommendedChannel]
    )

    const agent = await client.query(
      `INSERT INTO ai_agents(workspace_id, name, type, status, config)
       VALUES($1, 'AI Sales Agent', 'sales', 'active', $2)
       ON CONFLICT (workspace_id, type) DO UPDATE SET updated_at = NOW()
       RETURNING id`,
      [workspaceId, { source: 'landing_lead_capture' }]
    )
    const action = await client.query(
      `INSERT INTO ai_agent_actions(workspace_id, agent_id, lead_id, task_type, status, priority, input_context)
       VALUES($1, $2, $3, 'analyze_lead', 'queued', 10, $4)
       RETURNING id`,
      [workspaceId, agent.rows[0].id, lead.id, context]
    )
    actionId = action.rows[0].id

    const worker = await ensureSdrWorker(client, workspaceId)
    await client.query(
      `INSERT INTO ai_worker_queue(worker_id, workspace_id, lead_id, action_type, status, title, recommendation, payload)
       VALUES($1, $2, $3, 'create_reminder', 'pending_approval', $4, $5, $6)`,
      [worker.id, workspaceId, lead.id, 'Проверить нового лида', 'Новый лид с лендинга. Проверьте контактные данные, UTM-источник и запустите безопасный следующий шаг.', { leadId: lead.id, aiAgentActionId: actionId, source: 'landing', pageUrl: input.page_url, utm: metadata.utm, reminderText: 'Проверить нового лида с лендинга' }]
    )

    await client.query('COMMIT')
    return { leadId: lead.id, workspaceId, actionId }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

function schedulePublicLeadAnalysis(actionId) {
  if (!actionId) return
  setImmediate(() => {
    aiAgentModel.processAction(actionId).catch((error) => console.error('Public lead AI analysis failed', error.message || error))
  })
}

module.exports = { createPublicLead, schedulePublicLeadAnalysis }
