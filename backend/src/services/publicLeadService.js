const pool = require('../db/pool')
const aiAgentModel = require('../models/aiAgentModel')
const { addTimelineEvent } = require('./timelineService')
const { createQualificationQueueItem, ensureSdrWorker, scheduleLeadQualification } = require('./leadQualificationService')
const { notifyLandingLeadManager } = require('./publicLeadNotificationService')

const PUBLIC_LEAD_FIELDS = ['name', 'email', 'phone', 'telegram', 'company', 'message', 'source', 'page_url', 'utm_source', 'utm_medium', 'utm_campaign']
const HONEYPOT_FIELDS = ['website', 'url', 'homepage', 'company_site', 'honeypot']
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

function normalizePhone(value) {
  const phone = normalizeText(value, MAX_FIELD_LENGTHS.phone)
  if (!phone) return null
  if (!/^[+()\-\s\d.]{5,64}$/.test(phone)) {
    throw Object.assign(new Error('Invalid phone'), { statusCode: 400 })
  }
  const normalized = phone.replace(/[\s().-]/g, '')
  if (!/^\+?\d{5,15}$/.test(normalized)) {
    throw Object.assign(new Error('Invalid phone'), { statusCode: 400 })
  }
  return normalized.startsWith('+') ? normalized : `+${normalized}`
}

function normalizeTelegram(value) {
  const raw = normalizeText(value, MAX_FIELD_LENGTHS.telegram)
  if (!raw) return null
  const withoutUrl = raw.replace(/^https?:\/\/(?:t\.me|telegram\.me)\//i, '').replace(/^@/, '').trim()
  if (!/^[a-zA-Z0-9_]{3,64}$/.test(withoutUrl)) {
    throw Object.assign(new Error('Invalid telegram'), { statusCode: 400 })
  }
  return `@${withoutUrl.toLowerCase()}`
}

function rejectHoneypot(payload = {}) {
  if (HONEYPOT_FIELDS.some((field) => normalizeText(payload[field], 500))) {
    throw Object.assign(new Error('Spam submission rejected'), { statusCode: 400 })
  }
}

function normalizePayload(payload = {}) {
  rejectHoneypot(payload)
  const normalized = {}
  for (const field of PUBLIC_LEAD_FIELDS) {
    if (field === 'email') normalized.email = normalizeEmail(payload.email)
    else if (field === 'phone') normalized.phone = normalizePhone(payload.phone)
    else if (field === 'telegram') normalized.telegram = normalizeTelegram(payload.telegram)
    else if (field === 'page_url') normalized.page_url = normalizePageUrl(payload.page_url)
    else normalized[field] = normalizeText(payload[field], MAX_FIELD_LENGTHS[field])
  }

  if (!normalized.name || !normalized.email || !normalized.message) {
    throw Object.assign(new Error('Lead name, email and message are required'), { statusCode: 400 })
  }

  return normalized
}


function buildRepeatedSubmissionValues(input, requestMeta = {}) {
  return {
    email: input.email,
    phone: input.phone,
    telegram: input.telegram,
    ip: normalizeText(requestMeta.ip, 120),
    message: input.message,
  }
}

async function rejectRepeatedSubmission(client, workspaceId, input, requestMeta = {}) {
  const values = buildRepeatedSubmissionValues(input, requestMeta)
  const result = await client.query(
    `SELECT id
       FROM crm_leads
      WHERE workspace_id = $1
        AND source = 'landing'
        AND created_at >= NOW() - INTERVAL '30 minutes'
        AND (
          email = $2
          OR ($3::text IS NOT NULL AND phone = $3)
          OR ($4::text IS NOT NULL AND telegram = $4)
          OR (metadata->'request'->>'ip' = $5 AND notes = $6)
        )
      LIMIT 1`,
    [workspaceId, values.email, values.phone, values.telegram, values.ip, values.message]
  )
  if (result.rows[0]) {
    throw Object.assign(new Error('Repeated public lead submission rejected'), { statusCode: 409 })
  }
}

const WORKSPACE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

async function resolveWorkspace(client) {
  const envWorkspaceId = normalizeText(process.env.PUBLIC_LEADS_WORKSPACE_ID, 80)
  let workspace = null
  let reason = 'preferred_workspace_name'

  if (envWorkspaceId) {
    if (!WORKSPACE_ID_PATTERN.test(envWorkspaceId)) {
      throw Object.assign(new Error('PUBLIC_LEADS_WORKSPACE_ID must be a valid workspace UUID'), { statusCode: 503 })
    }

    const workspaceResult = await client.query('SELECT * FROM workspaces WHERE id = $1 LIMIT 1', [envWorkspaceId])
    workspace = workspaceResult.rows[0] || null
    if (!workspace) {
      throw Object.assign(new Error('PUBLIC_LEADS_WORKSPACE_ID workspace was not found'), { statusCode: 503 })
    }
    reason = 'PUBLIC_LEADS_WORKSPACE_ID'
  } else {
    const workspaceResult = await client.query(
      `SELECT *
         FROM workspaces
        WHERE LOWER(name) NOT LIKE '%test%'
          AND LOWER(name) NOT LIKE '%demo%'
          AND LOWER(name) NOT LIKE '%sandbox%'
        ORDER BY
          CASE
            WHEN LOWER(name) = 'buylesson workspace' THEN 0
            WHEN LOWER(name) LIKE '%buylesson%' THEN 1
            WHEN LOWER(name) = 'production' THEN 2
            WHEN LOWER(name) LIKE '%production%' THEN 3
            WHEN LOWER(name) = 'default' THEN 4
            WHEN LOWER(name) LIKE '%default%' THEN 5
            ELSE 6
          END,
          created_at ASC
        LIMIT 1`
    )
    workspace = workspaceResult.rows[0] || null
  }

  if (!workspace) throw Object.assign(new Error('Public leads workspace is not configured'), { statusCode: 503 })
  if (!workspace.owner_user_id) throw Object.assign(new Error('Public leads workspace owner is not configured'), { statusCode: 503 })

  console.info('[public-leads] workspace selected', {
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    reason,
  })

  return { workspaceId: workspace.id, workspaceName: workspace.name, userId: workspace.owner_user_id, reason }
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
    await rejectRepeatedSubmission(client, workspaceId, input, requestMeta)
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
    const queueItem = await createQualificationQueueItem(client, {
      workspaceId,
      leadId: lead.id,
      workerId: worker.id,
      title: `Квалифицировать лида — ${lead.name}`,
      recommendation: 'Анализ лида поставлен в очередь: система подготовит приоритет, канал связи и следующий шаг.',
      payload: { leadId: lead.id, aiAgentActionId: actionId, source: 'landing', pageUrl: input.page_url, utm: metadata.utm },
    })

    await client.query('COMMIT')
    scheduleLeadQualification({ workspaceId, leadId: lead.id, queueId: queueItem.id })
    notifyLandingLeadManager({
      userId,
      workspaceId,
      lead,
      recommendedNextStep: 'Связаться с лидом и подтвердить удобное время демо.',
    }).catch((error) => console.warn('Landing lead manager notification failed', error.message || error))
    return { leadId: lead.id, workspaceId, actionId, queueId: queueItem.id }
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

module.exports = { createPublicLead, schedulePublicLeadAnalysis, _private: { normalizePayload, rejectRepeatedSubmission, resolveWorkspace } }
