const pool = require('../db/pool')
const { createFollowupSequenceDrafts } = require('../services/autonomousFollowupQueueService')

const WORKER_TYPES = [
  'ai_sdr_agent',
  'ai_followup_worker',
  'ai_revenue_analyst',
  'ai_crm_assistant',
  'ai_email_assistant',
  'ai_telegram_assistant',
  'ai_meeting_scheduler',
]
const STATUSES = ['active', 'paused', 'error']
const MODES = ['suggestion_only', 'approval_required', 'autonomous_ready']
const RUN_STATUSES = ['queued', 'running', 'completed', 'failed']
const QUEUE_STATUSES = ['pending_approval', 'approved', 'rejected', 'executing', 'completed', 'executed', 'failed', 'cancelled']

const DEFAULT_WORKERS = [
  {
    name: 'AI SDR Agent',
    type: 'ai_sdr_agent',
    mode: 'approval_required',
    description: 'Анализирует новые лиды, определяет приоритет и предлагает первый следующий шаг.',
  },
  {
    name: 'AI Follow-up Engine',
    type: 'ai_followup_worker',
    mode: 'approval_required',
    description: 'Находит stale conversations и готовит безопасные follow-up drafts без автоотправки.',
  },
  {
    name: 'AI Revenue Analyst',
    type: 'ai_revenue_analyst',
    mode: 'suggestion_only',
    description: 'Суммирует pipeline, риски выручки, узкие места и прогноз по воронке.',
  },
  {
    name: 'AI CRM Assistant',
    type: 'ai_crm_assistant',
    mode: 'approval_required',
    description: 'Подсказывает следующие CRM действия, заметки и приоритеты менеджера.',
  },
  {
    name: 'AI Email Assistant',
    type: 'ai_email_assistant',
    mode: 'approval_required',
    description: 'Готовит email-черновики и темы писем для одобрения командой.',
  },
  {
    name: 'AI Telegram Assistant',
    type: 'ai_telegram_assistant',
    mode: 'approval_required',
    description: 'Готовит Telegram-сообщения и короткие сценарии диалога для одобрения.',
  },
]

function normalizeWorker(row) {
  if (!row) return null
  return {
    id: row.id,
    workspace_id: row.workspace_id,
    name: row.name,
    type: row.type,
    status: row.status,
    mode: row.mode,
    description: row.description || '',
    last_run_at: row.last_run_at,
    created_at: row.created_at,
  }
}

function normalizeRun(row) {
  if (!row) return null
  return {
    id: row.id,
    worker_id: row.worker_id,
    workspace_id: row.workspace_id,
    lead_id: row.lead_id,
    input_context: row.input_context || {},
    output_summary: row.output_summary || {},
    status: row.status,
    credits_spent: Number(row.credits_spent || 0),
    created_at: row.created_at,
  }
}

function normalizeQueueItem(row) {
  if (!row) return null
  return {
    id: row.id,
    worker_id: row.worker_id,
    workspace_id: row.workspace_id,
    run_id: row.run_id,
    lead_id: row.lead_id,
    action_type: row.action_type,
    status: row.status,
    title: row.title,
    recommendation: row.recommendation,
    payload: row.payload || {},
    approved_by: row.approved_by || null,
    approved_at: row.approved_at || null,
    executed_at: row.executed_at || null,
    error_message: row.error_message || '',
    worker_name: row.worker_name || '',
    lead_name: row.lead_name || '',
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

async function ensureDefaultWorkers(workspaceId, client = pool) {
  for (const worker of DEFAULT_WORKERS) {
    await client.query(
      `INSERT INTO ai_workers(workspace_id, name, type, status, mode, description)
       VALUES($1, $2, $3, 'active', $4, $5)
       ON CONFLICT (workspace_id, type) DO UPDATE
         SET name = CASE WHEN ai_workers.type = 'ai_followup_worker' THEN EXCLUDED.name ELSE ai_workers.name END,
             mode = CASE WHEN ai_workers.type = 'ai_followup_worker' THEN EXCLUDED.mode ELSE ai_workers.mode END,
             description = CASE WHEN ai_workers.type = 'ai_followup_worker' THEN EXCLUDED.description ELSE ai_workers.description END,
             updated_at = NOW()`,
      [workspaceId, worker.name, worker.type, worker.mode, worker.description]
    )
  }
}

function validateEnum(value, allowed, field) {
  if (value === undefined) return undefined
  const normalized = String(value || '').trim()
  if (!allowed.includes(normalized)) throw Object.assign(new Error(`Invalid ${field}`), { statusCode: 400 })
  return normalized
}

async function listWorkers(workspaceId) {
  await ensureDefaultWorkers(workspaceId)
  const result = await pool.query('SELECT * FROM ai_workers WHERE workspace_id = $1 ORDER BY created_at ASC', [workspaceId])
  return result.rows.map(normalizeWorker)
}

async function createWorker(workspaceId, payload) {
  const name = String(payload.name || '').trim()
  const type = validateEnum(payload.type, WORKER_TYPES, 'worker type')
  const status = validateEnum(payload.status || 'active', STATUSES, 'worker status')
  const mode = validateEnum(payload.mode || 'suggestion_only', MODES, 'worker mode')
  const description = String(payload.description || '').trim()
  if (!name) throw Object.assign(new Error('Worker name is required'), { statusCode: 400 })
  const result = await pool.query(
    `INSERT INTO ai_workers(workspace_id, name, type, status, mode, description)
     VALUES($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [workspaceId, name, type, status, mode, description]
  )
  return normalizeWorker(result.rows[0])
}

async function updateWorker(workspaceId, workerId, payload) {
  const updates = []
  const values = [workspaceId, workerId]
  function set(column, value) {
    values.push(value)
    updates.push(`${column} = $${values.length}`)
  }
  if (payload.name !== undefined) {
    const name = String(payload.name || '').trim()
    if (!name) throw Object.assign(new Error('Worker name is required'), { statusCode: 400 })
    set('name', name)
  }
  if (payload.status !== undefined) set('status', validateEnum(payload.status, STATUSES, 'worker status'))
  if (payload.mode !== undefined) set('mode', validateEnum(payload.mode, MODES, 'worker mode'))
  if (payload.description !== undefined) set('description', String(payload.description || '').trim())
  if (!updates.length) return getWorker(workspaceId, workerId)
  updates.push('updated_at = NOW()')
  const result = await pool.query(`UPDATE ai_workers SET ${updates.join(', ')} WHERE workspace_id = $1 AND id = $2 RETURNING *`, values)
  if (!result.rows[0]) throw Object.assign(new Error('AI worker not found'), { statusCode: 404 })
  return normalizeWorker(result.rows[0])
}

async function getWorker(workspaceId, workerId, client = pool) {
  const result = await client.query('SELECT * FROM ai_workers WHERE workspace_id = $1 AND id = $2', [workspaceId, workerId])
  if (!result.rows[0]) throw Object.assign(new Error('AI worker not found'), { statusCode: 404 })
  return normalizeWorker(result.rows[0])
}

async function listRuns(workspaceId, workerId) {
  await getWorker(workspaceId, workerId)
  const result = await pool.query('SELECT * FROM ai_worker_runs WHERE workspace_id = $1 AND worker_id = $2 ORDER BY created_at DESC LIMIT 100', [workspaceId, workerId])
  return result.rows.map(normalizeRun)
}

async function fetchLeadSnapshot(workspaceId) {
  const result = await pool.query(
    `SELECT id, name, company, status, stage, value, source, email, telegram, phone, updated_at, created_at, last_message_at, notes
       FROM crm_leads
      WHERE workspace_id = $1
      ORDER BY updated_at DESC, created_at DESC
      LIMIT 200`,
    [workspaceId]
  )
  return result.rows.map((lead) => ({
    ...lead,
    value: Number(lead.value || 0),
  }))
}

function daysSince(value) {
  if (!value) return 999
  return Math.floor((Date.now() - new Date(value).getTime()) / 86400000)
}

const EMPTY_DATA_SUMMARY = 'Нет данных для анализа. Добавьте лидов или дождитесь новых сообщений.'
const EMPTY_PIPELINE_RECOMMENDATION = 'В воронке пока нет активных лидов. Добавьте первого лида или подключите Telegram-бота для автоматического сбора заявок.'

function getLeadDisplayName(lead) {
  return String(lead?.name || lead?.company || 'лид без имени').trim()
}

function formatRecommendation(item) {
  const title = String(item.title || 'AI рекомендация').trim().replace(/[:：]\s*$/, '.')
  const recommendation = String(item.recommendation || EMPTY_DATA_SUMMARY).trim().replace(/[:：]\s*$/, '.')
  return {
    ...item,
    title,
    recommendation,
  }
}

function buildRevenueRecommendation(openLeads) {
  const pipeline = openLeads.reduce((sum, lead) => sum + Number(lead.value || 0), 0)

  if (pipeline === 0 && openLeads.length === 0) {
    return formatRecommendation({
      leadId: null,
      actionType: 'pipeline_empty',
      title: 'Воронка пока пустая',
      recommendation: `${EMPTY_PIPELINE_RECOMMENDATION} Когда появятся первые лиды, запустите AI SDR Agent для приоритизации и подготовки следующего шага.`,
      payload: {
        openLeads: 0,
        pipeline: 0,
        suggestedActions: ['create_first_lead', 'connect_telegram_lead_capture', 'launch_ai_sdr_after_leads'],
      },
    })
  }

  const risky = openLeads.filter((lead) => daysSince(lead.updated_at) >= 7)
  const riskSentence = risky.length
    ? `Сделок с паузой 7+ дней — ${risky.length}. Проверьте следующий шаг и канал контакта.`
    : 'Сделок с паузой 7+ дней нет. Продолжайте поддерживать регулярные касания.'

  return formatRecommendation({
    leadId: null,
    actionType: 'pipeline_summary',
    title: 'Сводка выручки под контролем AI',
    recommendation: `В открытой воронке ${openLeads.length} лидов на ${pipeline.toLocaleString('ru-RU')} ₽. ${riskSentence}`,
    payload: { openLeads: openLeads.length, pipeline, riskyLeads: risky.length },
  })
}

function buildRecommendations(worker, leads) {
  const openLeads = leads.filter((lead) => !['won', 'lost'].includes(lead.status))
  if (worker.type !== 'ai_revenue_analyst' && openLeads.length === 0) return []

  if (worker.type === 'ai_sdr_agent') {
    return openLeads.filter((lead) => lead.status === 'new').slice(0, 5).map((lead) => formatRecommendation({
      leadId: lead.id,
      actionType: 'lead_prioritization',
      title: `Проверить нового лида — ${getLeadDisplayName(lead)}`,
      recommendation: `AI SDR рекомендует квалифицировать лида, уточнить бюджет и зафиксировать следующий шаг. Потенциал — ${lead.value || 0} ₽.`,
      payload: { priority: lead.value >= 100000 ? 'high' : 'medium', channel: lead.telegram ? 'telegram' : lead.email ? 'email' : 'crm' },
    }))
  }
  if (worker.type === 'ai_followup_worker') {
    return openLeads.filter((lead) => daysSince(lead.updated_at) >= 3).slice(0, 5).map((lead) => formatRecommendation({
      leadId: lead.id,
      actionType: 'follow_up_recommendation',
      title: `Вернуть лида в диалог — ${getLeadDisplayName(lead)}`,
      recommendation: `Лид не обновлялся ${daysSince(lead.updated_at)} дн. Подготовьте короткий follow-up с ценностью и одним CTA.`,
      payload: { inactiveDays: daysSince(lead.updated_at), suggestedChannel: lead.telegram ? 'telegram' : lead.email ? 'email' : 'crm' },
    }))
  }
  if (worker.type === 'ai_revenue_analyst') {
    return [buildRevenueRecommendation(openLeads)]
  }
  if (worker.type === 'ai_crm_assistant') {
    return openLeads.slice(0, 5).map((lead) => formatRecommendation({
      leadId: lead.id,
      actionType: 'crm_next_action',
      title: `Следующее CRM действие — ${getLeadDisplayName(lead)}`,
      recommendation: `Обновите этап ${lead.status || 'new'}, добавьте заметку по боли клиента и назначьте следующий контакт в течение 24 часов.`,
      payload: { currentStatus: lead.status, nextStep: 'create_reminder' },
    }))
  }
  if (worker.type === 'ai_email_assistant') {
    return openLeads.filter((lead) => lead.email).slice(0, 5).map((lead) => formatRecommendation({
      leadId: lead.id,
      actionType: 'email_draft',
      title: `Email-черновик — ${getLeadDisplayName(lead)}`,
      recommendation: 'Подготовьте письмо с персональным контекстом, ROI и предложением короткого созвона. Автоотправка отключена.',
      payload: { to: lead.email, subject: `Следующий шаг по ${lead.company || 'вашему запросу'}` },
    }))
  }
  if (worker.type === 'ai_telegram_assistant') {
    return openLeads.filter((lead) => lead.telegram).slice(0, 5).map((lead) => formatRecommendation({
      leadId: lead.id,
      actionType: 'telegram_draft',
      title: `Telegram-сценарий — ${getLeadDisplayName(lead)}`,
      recommendation: 'Короткое сообщение: подтвердить контекст, дать одну ценность и спросить про удобное время. Автоотправка отключена.',
      payload: { telegram: lead.telegram, tone: 'consultative' },
    }))
  }
  return []
}

function buildOutputSummary(worker, leads, recommendations) {
  const openLeads = leads.filter((lead) => !['won', 'lost'].includes(lead.status))
  const hasUsefulEmptyPipelineRecommendation = recommendations.some((item) => item.actionType === 'pipeline_empty')
  const summary = recommendations.length === 0
    ? EMPTY_DATA_SUMMARY
    : hasUsefulEmptyPipelineRecommendation
      ? EMPTY_PIPELINE_RECOMMENDATION
      : `${recommendations.length} рекомендаций создано`

  return {
    summary,
    recommendations,
    openLeads: openLeads.length,
    pipeline: openLeads.reduce((sum, lead) => sum + Number(lead.value || 0), 0),
  }
}

async function runWorker({ userId, workspaceId, workerId }) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const worker = await getWorker(workspaceId, workerId, client)
    if (worker.status === 'paused') throw Object.assign(new Error('AI worker is paused'), { statusCode: 400 })
    const leads = await fetchLeadSnapshot(workspaceId)
    const recommendations = worker.type === 'ai_followup_worker' ? [] : buildRecommendations(worker, leads)
    const inputContext = {
      workerType: worker.type,
      mode: worker.mode,
      leadCount: leads.length,
      generatedBy: worker.type === 'ai_followup_worker' ? 'autonomous_followup_engine_v1' : 'deterministic_v1',
      safety: worker.type === 'ai_followup_worker' ? 'human_approval_required_no_auto_send' : undefined,
    }
    const initialOutputSummary = buildOutputSummary(worker, leads, recommendations)
    const runResult = await client.query(
      `INSERT INTO ai_worker_runs(worker_id, workspace_id, lead_id, input_context, output_summary, status, credits_spent)
       VALUES($1, $2, $3, $4, $5, 'completed', $6)
       RETURNING *`,
      [worker.id, workspaceId, recommendations[0]?.leadId || null, inputContext, initialOutputSummary, Math.max(1, recommendations.length || 1)]
    )
    let run = normalizeRun(runResult.rows[0])
    const queueItems = []
    if (worker.type === 'ai_followup_worker') {
      const scan = await createFollowupSequenceDrafts({ client, userId, workspaceId, workerId: worker.id, runId: run.id })
      for (const item of scan.created) queueItems.push(normalizeQueueItem(item))
      const outputSummary = {
        summary: `AI Follow-up Engine проверил ${scan.scannedLeadsCount} stale conversations и создал ${scan.createdCount} drafts на approval`,
        scannedLeads: scan.scannedLeadsCount,
        createdDrafts: scan.createdCount,
        skipped: scan.skippedCount,
        actionType: 'followup_sequence_draft',
        noAutoSend: true,
      }
      const updatedRun = await client.query('UPDATE ai_worker_runs SET lead_id = $3, output_summary = $4, credits_spent = $5 WHERE workspace_id = $1 AND id = $2 RETURNING *', [workspaceId, run.id, queueItems[0]?.lead_id || null, outputSummary, Math.max(1, scan.scannedLeadsCount || 1)])
      run = normalizeRun(updatedRun.rows[0])
    } else {
      for (const recommendation of recommendations) {
        const queued = await client.query(
          `INSERT INTO ai_worker_queue(worker_id, workspace_id, run_id, lead_id, action_type, status, title, recommendation, payload)
           VALUES($1, $2, $3, $4, $5, 'pending_approval', $6, $7, $8)
           RETURNING *`,
          [worker.id, workspaceId, run.id, recommendation.leadId, recommendation.actionType, recommendation.title, recommendation.recommendation, recommendation.payload]
        )
        queueItems.push(normalizeQueueItem(queued.rows[0]))
      }
    }
    const outputSummary = run.output_summary
    await client.query('UPDATE ai_workers SET last_run_at = NOW(), status = $3, updated_at = NOW() WHERE workspace_id = $1 AND id = $2', [workspaceId, worker.id, 'active'])
    await client.query(
      `INSERT INTO crm_activity(workspace_id, user_id, type, title, body, metadata)
       VALUES($1, $2, 'ai_worker_run_completed', $3, $4, $5)`,
      [workspaceId, userId, `${worker.name} завершил запуск`, outputSummary.summary, { workerId: worker.id, runId: run.id }]
    )
    await client.query('COMMIT')
    return { run, queueItems }
  } catch (error) {
    await client.query('ROLLBACK')
    if (!error.statusCode || error.statusCode >= 500) {
      await pool.query('UPDATE ai_workers SET status = $2, updated_at = NOW() WHERE workspace_id = $1 AND id = $3', [workspaceId, 'error', workerId]).catch(() => undefined)
    }
    throw error
  } finally {
    client.release()
  }
}

async function getCommandCenter(workspaceId) {
  const workers = await listWorkers(workspaceId)
  const [queue, runs, stats, revenue] = await Promise.all([
    pool.query('SELECT * FROM ai_worker_queue WHERE workspace_id = $1 ORDER BY created_at DESC LIMIT 50', [workspaceId]),
    pool.query('SELECT * FROM ai_worker_runs WHERE workspace_id = $1 ORDER BY created_at DESC LIMIT 20', [workspaceId]),
    pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'pending_approval')::int AS pending_actions,
        COUNT(*) FILTER (WHERE status = 'failed')::int AS failed_actions,
        COUNT(*) FILTER (WHERE status IN ('pending_approval','approved','executing'))::int AS queue_active
       FROM ai_worker_queue WHERE workspace_id = $1`,
      [workspaceId]
    ),
    pool.query("SELECT COALESCE(SUM(value), 0)::numeric AS pipeline FROM crm_leads WHERE workspace_id = $1 AND status NOT IN ('won','lost')", [workspaceId]),
  ])
  const runRows = runs.rows.map(normalizeRun)
  const completedRuns = runRows.filter((run) => run.status === 'completed').length
  const efficiency = runRows.length ? Math.round((completedRuns / runRows.length) * 100) : 0
  const activeWorkers = workers.filter((worker) => worker.status === 'active').length
  const statsRow = stats.rows[0] || {}
  return {
    workers,
    queue: queue.rows.map(normalizeQueueItem),
    recentRuns: runRows,
    metrics: {
      activeWorkers,
      totalWorkers: workers.length,
      queueActive: Number(statsRow.queue_active || 0),
      pendingActions: Number(statsRow.pending_actions || 0),
      failedActions: Number(statsRow.failed_actions || 0),
      efficiency,
      revenueUnderAi: Number(revenue.rows[0]?.pipeline || 0),
    },
  }
}

module.exports = {
  MODES,
  QUEUE_STATUSES,
  RUN_STATUSES,
  STATUSES,
  WORKER_TYPES,
  createWorker,
  getCommandCenter,
  listRuns,
  listWorkers,
  runWorker,
  updateWorker,
}
