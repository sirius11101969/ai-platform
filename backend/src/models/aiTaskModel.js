const pool = require('../db/pool')
const { executeAiTask } = require('../services/aiTaskExecutorService')

const TASK_COSTS = {
  ai_content_generation: 5,
  ai_sales_reply: 8,
  ai_crm_follow_up: 12,
  ai_telegram_outreach: 9,
}

const LEGACY_TASK_TYPE_ALIASES = {
  text_generation: 'ai_content_generation',
  sales_email: 'ai_sales_reply',
  crm_summary: 'ai_crm_follow_up',
  lead_follow_up: 'ai_crm_follow_up',
  'Генерация текста': 'ai_content_generation',
  'Ответ клиенту': 'ai_sales_reply',
  'Follow-up для CRM': 'ai_crm_follow_up',
  'Telegram-сообщение': 'ai_telegram_outreach',
}

const TASK_TYPES = Object.keys(TASK_COSTS)
const TASK_STATUSES = ['pending', 'processing', 'completed', 'failed']
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function normalizeTask(row) {
  if (!row) return null
  return {
    id: row.id,
    user_id: row.user_id,
    workspace_id: row.workspace_id || null,
    type: normalizeTaskType(row.type || row.task_type),
    prompt: row.prompt || row.input?.prompt || '',
    status: row.status,
    credits_spent: Number(row.credits_spent || 0),
    result: row.result || row.output || null,
    error: row.error || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

function normalizeTaskType(type = 'ai_content_generation') {
  const rawType = String(type || 'ai_content_generation').trim()
  return LEGACY_TASK_TYPE_ALIASES[rawType] || rawType
}

function getTaskCost(type) {
  return TASK_COSTS[normalizeTaskType(type)] || TASK_COSTS.ai_content_generation
}

function validateTaskPayload({ type = 'ai_content_generation', prompt }) {
  const normalizedType = normalizeTaskType(type)
  const normalizedPrompt = String(prompt || '').trim()

  if (!TASK_TYPES.includes(normalizedType)) {
    const error = new Error(`Task type must be one of: ${TASK_TYPES.join(', ')}`)
    error.statusCode = 400
    throw error
  }

  if (!normalizedPrompt || normalizedPrompt.length < 3) {
    const error = new Error('Prompt with at least 3 characters is required')
    error.statusCode = 400
    throw error
  }

  if (normalizedPrompt.length > 4000) {
    const error = new Error('Prompt must be 4000 characters or fewer')
    error.statusCode = 400
    throw error
  }

  return { type: normalizedType, prompt: normalizedPrompt, creditsSpent: getTaskCost(normalizedType) }
}

async function listTasks(userId, workspaceId) {
  const result = await pool.query(
    `SELECT id, user_id, workspace_id, type, prompt, status, credits_spent, result, error, created_at, updated_at, task_type, input, output
       FROM ai_tasks
      WHERE user_id = $1 AND workspace_id = $2
      ORDER BY created_at DESC`,
    [userId, workspaceId]
  )

  return result.rows.map(normalizeTask)
}

async function findTaskById(userId, workspaceId, taskId) {
  if (!UUID_PATTERN.test(String(taskId || ''))) {
    const error = new Error('Invalid task id')
    error.statusCode = 400
    throw error
  }

  const result = await pool.query(
    `SELECT id, user_id, workspace_id, type, prompt, status, credits_spent, result, error, created_at, updated_at, task_type, input, output
       FROM ai_tasks
      WHERE user_id = $1 AND workspace_id = $2 AND id = $3`,
    [userId, workspaceId, taskId]
  )

  return normalizeTask(result.rows[0])
}

async function createTask(userId, workspaceId, payload) {
  const { type, prompt, creditsSpent } = validateTaskPayload(payload)
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const userResult = await client.query('SELECT credits_pool AS credits FROM workspaces WHERE id = $1 FOR UPDATE', [workspaceId])
    const user = userResult.rows[0]
    if (!user) {
      const error = new Error('Workspace not found')
      error.statusCode = 401
      throw error
    }

    if (Number(user.credits) < creditsSpent) {
      const error = new Error(`Insufficient credits: ${creditsSpent} credits required`)
      error.statusCode = 402
      throw error
    }

    const taskResult = await client.query(
      `INSERT INTO ai_tasks(type, prompt, status, credits_spent, result, user_id, workspace_id, task_type, input, output, error)
       VALUES($1, $2, 'processing', $3, NULL, $4, $6, $1, $5, NULL, NULL)
       RETURNING id, user_id, workspace_id, type, prompt, status, credits_spent, result, error, created_at, updated_at`,
      [type, prompt, creditsSpent, userId, { prompt }, workspaceId]
    )

    const creditResult = await client.query(
      `UPDATE workspaces
          SET credits_pool = credits_pool - $1, updated_at = NOW()
        WHERE id = $2
        RETURNING credits_pool AS credits`,
      [creditsSpent, workspaceId]
    )
    const balanceAfter = creditResult.rows[0].credits

    await client.query(
      `INSERT INTO credits_ledger(user_id, workspace_id, amount, reason, balance_after, metadata)
       VALUES($1, $5, $2, 'ai_task', $3, $4)`,
      [userId, -creditsSpent, balanceAfter, { taskId: taskResult.rows[0].id, type, promptPreview: prompt.slice(0, 120) }, workspaceId]
    )

    await client.query('COMMIT')

    return { task: normalizeTask(taskResult.rows[0]), remainingCredits: balanceAfter }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function processTask(taskId) {
  try {
    const processingResult = await pool.query(
      `SELECT id, user_id, workspace_id, type, prompt, status, credits_spent, result, error, created_at, updated_at, task_type, input, output
         FROM ai_tasks
        WHERE id = $1 AND status = 'processing'`,
      [taskId]
    )

    const task = normalizeTask(processingResult.rows[0])
    if (!task) return null

    const result = await executeAiTask(task)
    const completedResult = await pool.query(
      `UPDATE ai_tasks
          SET status = 'completed', result = $2, output = $2, error = NULL, updated_at = NOW()
        WHERE id = $1 AND status = 'processing'
        RETURNING id, user_id, workspace_id, type, prompt, status, credits_spent, result, error, created_at, updated_at`,
      [taskId, result]
    )

    return normalizeTask(completedResult.rows[0])
  } catch (error) {
    const message = error.response?.data?.error?.message || error.message || 'Task processing failed'
    await pool.query(
      `UPDATE ai_tasks
          SET status = 'failed', result = $2, output = $2, error = $3, updated_at = NOW()
        WHERE id = $1`,
      [taskId, { error: message, provider: 'openai' }, message]
    )
    throw error
  }
}

module.exports = {
  TASK_COSTS,
  TASK_STATUSES,
  TASK_TYPES,
  createTask,
  findTaskById,
  listTasks,
  processTask,
}
