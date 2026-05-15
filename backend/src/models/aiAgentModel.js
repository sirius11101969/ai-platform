const pool = require('../db/pool')
const crmModel = require('./crmModel')
const emailService = require('../services/emailService')
const { ACTION_PROMPTS, runSalesAgent } = require('../services/aiSalesAgentService')

const AGENT_ACTION_COSTS = {
  analyze_lead: 10,
  generate_follow_up: 12,
  generate_commercial_offer: 18,
  generate_telegram_response: 10,
  generate_email_response: 10,
}
const ACTION_TYPES = Object.keys(AGENT_ACTION_COSTS)
const STATUSES = ['queued', 'running', 'completed', 'failed']

function normalizeAction(row) {
  if (!row) return null
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    agentId: row.agent_id,
    leadId: row.lead_id,
    taskType: row.task_type,
    status: row.status,
    priority: Number(row.priority || 0),
    inputContext: row.input_context || {},
    outputResult: row.output_result || null,
    error: row.error || null,
    retryCount: Number(row.retry_count || 0),
    maxRetries: Number(row.max_retries || 3),
    nextRetryAt: row.next_retry_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function normalizeRun(row) {
  if (!row) return null
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    actionId: row.action_id,
    status: row.status,
    executionLog: row.execution_log || [],
    error: row.error || null,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function ensureSalesAgent(workspaceId, client = pool) {
  const result = await client.query(
    `INSERT INTO ai_agents(workspace_id, name, type, status, config)
     VALUES($1, 'AI Sales Agent', 'sales', 'active', $2)
     ON CONFLICT (workspace_id, type) DO UPDATE SET updated_at = NOW()
     RETURNING id, workspace_id, name, type, status, config, created_at, updated_at`,
    [workspaceId, { capabilities: ACTION_TYPES }]
  )
  return result.rows[0]
}

async function buildLeadContext(userId, workspaceId, leadId) {
  const lead = await crmModel.findLead(userId, workspaceId, leadId)
  if (!lead) throw Object.assign(new Error('Lead not found'), { statusCode: 404 })
  const [emails, activity] = await Promise.all([
    emailService.listLeadEmails(userId, workspaceId, leadId).catch(() => []),
    crmModel.listActivity(userId, workspaceId).catch(() => []),
  ])
  return {
    lead: {
      id: lead.id,
      name: lead.name,
      company: lead.company,
      email: lead.email,
      telegram: lead.telegram,
      source: lead.source,
      stage: lead.status,
      value: lead.value,
      notesText: lead.notesText,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      lastMessageAt: lead.lastMessageAt,
    },
    notes: lead.notes || [],
    followUps: lead.followUps || [],
    telegramMessages: lead.telegramMessages || [],
    emails: emails.map((email) => ({ id: email.id, status: email.status, subject: email.subject, text: email.text, createdAt: email.createdAt, sentAt: email.sentAt, openedAt: email.openedAt })),
    activity: activity.filter((event) => event.leadId === lead.id),
  }
}

function validateTaskType(taskType) {
  const normalized = String(taskType || '').trim()
  if (!ACTION_TYPES.includes(normalized)) {
    throw Object.assign(new Error(`AI agent task type must be one of: ${ACTION_TYPES.join(', ')}`), { statusCode: 400 })
  }
  return normalized
}

async function debitCredits(client, userId, workspaceId, amount, metadata) {
  const workspace = await client.query('SELECT credits_pool FROM workspaces WHERE id = $1 FOR UPDATE', [workspaceId])
  if (!workspace.rows[0]) throw Object.assign(new Error('Workspace not found'), { statusCode: 404 })
  if (Number(workspace.rows[0].credits_pool) < amount) throw Object.assign(new Error(`Insufficient credits: ${amount} credits required`), { statusCode: 402 })
  const updated = await client.query('UPDATE workspaces SET credits_pool = credits_pool - $1, updated_at = NOW() WHERE id = $2 RETURNING credits_pool', [amount, workspaceId])
  await client.query(
    `INSERT INTO credits_ledger(user_id, workspace_id, amount, reason, balance_after, metadata)
     VALUES($1, $2, $3, 'ai_agent_action', $4, $5)`,
    [userId, workspaceId, -amount, updated.rows[0].credits_pool, metadata]
  )
  return Number(updated.rows[0].credits_pool)
}

async function createAction(userId, workspaceId, payload) {
  const taskType = validateTaskType(payload.taskType || payload.task_type)
  const leadId = payload.leadId || payload.lead_id
  if (!leadId) throw Object.assign(new Error('leadId is required'), { statusCode: 400 })
  const priority = Number(payload.priority || 0)
  const inputContext = await buildLeadContext(userId, workspaceId, leadId)
  const cost = AGENT_ACTION_COSTS[taskType]
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const agent = await ensureSalesAgent(workspaceId, client)
    const action = await client.query(
      `INSERT INTO ai_agent_actions(workspace_id, agent_id, lead_id, task_type, status, priority, input_context, output_result)
       VALUES($1, $2, $3, $4, 'queued', $5, $6, NULL)
       RETURNING *`,
      [workspaceId, agent.id, leadId, taskType, priority, inputContext]
    )
    const remainingCredits = await debitCredits(client, userId, workspaceId, cost, { actionId: action.rows[0].id, taskType, leadId })
    await client.query('COMMIT')
    return { action: normalizeAction(action.rows[0]), remainingCredits, cost }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function processAction(actionId) {
  const client = await pool.connect()
  let runId
  try {
    await client.query('BEGIN')
    const actionResult = await client.query(
      `UPDATE ai_agent_actions
          SET status = 'running', updated_at = NOW()
        WHERE id = $1 AND status = 'queued'
        RETURNING *`,
      [actionId]
    )
    const action = normalizeAction(actionResult.rows[0])
    if (!action) {
      await client.query('ROLLBACK')
      return null
    }
    const run = await client.query(
      `INSERT INTO ai_agent_runs(workspace_id, action_id, lead_id, task_type, status, priority, input_context, execution_log, started_at)
       VALUES($1, $2, $3, $4, 'running', $5, $6, $7, NOW()) RETURNING *`,
      [action.workspaceId, action.id, action.leadId, action.taskType, action.priority, action.inputContext, [{ at: new Date().toISOString(), message: 'Запуск AI Sales Agent' }]]
    )
    runId = run.rows[0].id
    await client.query('COMMIT')

    const output = await runSalesAgent({ taskType: action.taskType, context: action.inputContext })
    await pool.query(
      `UPDATE ai_agent_actions SET status = 'completed', output_result = $2, error = NULL, updated_at = NOW() WHERE id = $1`,
      [action.id, output]
    )
    await pool.query(
      `UPDATE ai_agent_runs
          SET status = 'completed', output_result = $2, execution_log = execution_log || $3::jsonb, finished_at = NOW(), updated_at = NOW()
        WHERE id = $1`,
      [runId, output, JSON.stringify([{ at: new Date().toISOString(), message: 'AI результат сохранён' }])]
    )
    await pool.query(
      `INSERT INTO crm_activity(workspace_id, lead_id, user_id, type, title, body, metadata)
       SELECT $1, $2, wm.user_id, 'ai_agent_action_completed', 'AI рекомендация создана', $3, $4
         FROM workspace_members wm WHERE wm.workspace_id = $1 AND wm.role = 'owner' LIMIT 1`,
      [action.workspaceId, action.leadId, output.nextBestAction || output.message || output.rawText || 'AI action completed', { actionId: action.id, taskType: action.taskType }]
    )
    if (action.taskType === 'generate_follow_up') {
      await pool.query(
        `INSERT INTO ai_followups(workspace_id, lead_id, action_id, task_type, status, priority, input_context, output_result)
         VALUES($1, $2, $3, 'generate_follow_up', 'queued', $4, $5, $6)`,
        [action.workspaceId, action.leadId, action.id, action.priority, action.inputContext, output]
      )
    }
    return normalizeAction({ ...action, status: 'completed', output_result: output })
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined)
    const message = error.response?.data?.error?.message || error.message || 'AI agent action failed'
    const failed = await pool.query(
      `UPDATE ai_agent_actions
          SET status = CASE WHEN retry_count + 1 < max_retries THEN 'queued' ELSE 'failed' END,
              retry_count = retry_count + 1,
              next_retry_at = CASE WHEN retry_count + 1 < max_retries THEN NOW() + ((retry_count + 1) * INTERVAL '1 minute') ELSE NULL END,
              error = $2,
              updated_at = NOW()
        WHERE id = $1 RETURNING *`,
      [actionId, message]
    )
    if (runId) {
      await pool.query(
        `UPDATE ai_agent_runs SET status = 'failed', error = $2, execution_log = execution_log || $3::jsonb, finished_at = NOW(), updated_at = NOW() WHERE id = $1`,
        [runId, message, JSON.stringify([{ at: new Date().toISOString(), message }])]
      )
    }
    return normalizeAction(failed.rows[0])
  } finally {
    client.release()
  }
}

async function listActions(workspaceId, { leadId } = {}) {
  const params = [workspaceId]
  let filter = ''
  if (leadId) {
    params.push(leadId)
    filter = ` AND lead_id = $${params.length}`
  }
  const result = await pool.query(`SELECT * FROM ai_agent_actions WHERE workspace_id = $1${filter} ORDER BY created_at DESC LIMIT 100`, params)
  return result.rows.map(normalizeAction)
}

async function listRuns(workspaceId) {
  const result = await pool.query('SELECT * FROM ai_agent_runs WHERE workspace_id = $1 ORDER BY created_at DESC LIMIT 100', [workspaceId])
  return result.rows.map(normalizeRun)
}

async function getMetrics(workspaceId) {
  const result = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE a.created_at::date = CURRENT_DATE)::int AS actions_today,
       COUNT(*) FILTER (WHERE a.task_type = 'generate_follow_up')::int AS generated_followups,
       COUNT(*) FILTER (WHERE a.status = 'completed')::int AS completed_actions,
       COUNT(*)::int AS total_actions,
       COUNT(DISTINCT a.lead_id) FILTER (WHERE a.status = 'completed')::int AS assisted_deals
     FROM ai_agent_actions a WHERE a.workspace_id = $1`,
    [workspaceId]
  )
  const row = result.rows[0] || {}
  const total = Number(row.total_actions || 0)
  const completed = Number(row.completed_actions || 0)
  return {
    actionsToday: Number(row.actions_today || 0),
    generatedFollowUps: Number(row.generated_followups || 0),
    efficiency: total ? Math.round((completed / total) * 100) : 0,
    aiAssistedDeals: Number(row.assisted_deals || 0),
  }
}

async function queueInactiveFollowUps(userId, workspaceId, inactiveHours = 24) {
  const result = await pool.query(
    `SELECT id FROM crm_leads
      WHERE user_id = $1 AND workspace_id = $2 AND status NOT IN ('won', 'lost')
        AND updated_at < NOW() - ($3::int * INTERVAL '1 hour')
        AND NOT EXISTS (
          SELECT 1 FROM ai_agent_actions a
           WHERE a.workspace_id = crm_leads.workspace_id AND a.lead_id = crm_leads.id
             AND a.task_type = 'generate_follow_up' AND a.created_at > NOW() - INTERVAL '24 hours'
        )
      ORDER BY updated_at ASC LIMIT 10`,
    [userId, workspaceId, inactiveHours]
  )
  const queued = []
  for (const row of result.rows) {
    queued.push((await createAction(userId, workspaceId, { leadId: row.id, taskType: 'generate_follow_up', priority: 5 })).action)
  }
  return queued
}

module.exports = {
  ACTION_PROMPTS,
  ACTION_TYPES,
  AGENT_ACTION_COSTS,
  STATUSES,
  createAction,
  getMetrics,
  listActions,
  listRuns,
  processAction,
  queueInactiveFollowUps,
}
