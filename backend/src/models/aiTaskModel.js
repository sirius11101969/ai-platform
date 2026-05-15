const pool = require('../db/pool')

const TASK_COSTS = {
  text_generation: 5,
  sales_email: 8,
  crm_summary: 10,
  lead_follow_up: 12,
}

const TASK_TYPES = Object.keys(TASK_COSTS)
const TASK_STATUSES = ['pending', 'processing', 'completed', 'failed']
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function normalizeTask(row) {
  if (!row) return null
  return {
    id: row.id,
    user_id: row.user_id,
    type: row.type || row.task_type,
    prompt: row.prompt || row.input?.prompt || '',
    status: row.status,
    credits_spent: Number(row.credits_spent || 0),
    result: row.result || row.output || null,
    created_at: row.created_at,
  }
}

function getTaskCost(type) {
  return TASK_COSTS[type] || TASK_COSTS.text_generation
}

function validateTaskPayload({ type = 'text_generation', prompt }) {
  const normalizedType = String(type || 'text_generation').trim()
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

async function listTasks(userId) {
  const result = await pool.query(
    `SELECT id, user_id, type, prompt, status, credits_spent, result, created_at, task_type, input, output
       FROM ai_tasks
      WHERE user_id = $1
      ORDER BY created_at DESC`,
    [userId]
  )

  return result.rows.map(normalizeTask)
}

async function findTaskById(userId, taskId) {
  if (!UUID_PATTERN.test(String(taskId || ''))) {
    const error = new Error('Invalid task id')
    error.statusCode = 400
    throw error
  }

  const result = await pool.query(
    `SELECT id, user_id, type, prompt, status, credits_spent, result, created_at, task_type, input, output
       FROM ai_tasks
      WHERE user_id = $1 AND id = $2`,
    [userId, taskId]
  )

  return normalizeTask(result.rows[0])
}

async function createTask(userId, payload) {
  const { type, prompt, creditsSpent } = validateTaskPayload(payload)
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const userResult = await client.query('SELECT credits FROM users WHERE id = $1 FOR UPDATE', [userId])
    const user = userResult.rows[0]
    if (!user) {
      const error = new Error('User not found')
      error.statusCode = 401
      throw error
    }

    if (Number(user.credits) < creditsSpent) {
      const error = new Error(`Insufficient credits: ${creditsSpent} credits required`)
      error.statusCode = 402
      throw error
    }

    const taskResult = await client.query(
      `INSERT INTO ai_tasks(type, prompt, status, credits_spent, result, user_id, task_type, input, output)
       VALUES($1, $2, 'pending', $3, NULL, $4, $1, $5, NULL)
       RETURNING id, user_id, type, prompt, status, credits_spent, result, created_at`,
      [type, prompt, creditsSpent, userId, { prompt }]
    )

    const creditResult = await client.query(
      `UPDATE users
          SET credits = credits - $1
        WHERE id = $2
        RETURNING credits`,
      [creditsSpent, userId]
    )
    const balanceAfter = creditResult.rows[0].credits

    await client.query(
      `INSERT INTO credits_ledger(user_id, amount, reason, balance_after, metadata)
       VALUES($1, $2, 'ai_task', $3, $4)`,
      [userId, -creditsSpent, balanceAfter, { taskId: taskResult.rows[0].id, type, promptPreview: prompt.slice(0, 120) }]
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

function buildTaskResult(task) {
  const prompt = task.prompt.trim()
  const promptPreview = prompt.length > 220 ? `${prompt.slice(0, 220)}…` : prompt
  const generatedAt = new Date().toISOString()

  const templates = {
    text_generation: {
      title: 'AI response draft',
      content: `Draft response for: ${promptPreview}\n\n1. Confirm the customer goal.\n2. Propose a concrete next step.\n3. Add a measurable success metric.`,
    },
    sales_email: {
      title: 'Sales email',
      subject: 'Next step for your AI growth workflow',
      content: `Hi,\n\nBased on ${promptPreview}, I suggest a concise follow-up with a clear value promise, proof point, and one meeting CTA.\n\nBest,\nAI Bot Platform`,
    },
    crm_summary: {
      title: 'CRM summary',
      bullets: [
        `Context captured: ${promptPreview}`,
        'Priority: qualify business impact and timeline.',
        'Recommended CRM action: create a follow-up note and set next-contact owner.',
      ],
    },
    lead_follow_up: {
      title: 'Lead follow-up plan',
      steps: [
        'Send a personalized recap within 2 hours.',
        'Ask one qualification question tied to budget, urgency, or integration scope.',
        'Schedule the next touch and record it in CRM.',
      ],
      personalization: promptPreview,
    },
  }

  return {
    ...templates[task.type],
    generatedAt,
    model: 'ai-task-engine-v1',
    creditsSpent: task.credits_spent,
  }
}

async function processTask(taskId) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const taskResult = await client.query(
      `UPDATE ai_tasks
          SET status = 'processing', updated_at = NOW()
        WHERE id = $1 AND status = 'pending'
        RETURNING id, user_id, type, prompt, status, credits_spent, result, created_at`,
      [taskId]
    )

    const task = normalizeTask(taskResult.rows[0])
    if (!task) {
      await client.query('COMMIT')
      return null
    }

    const result = buildTaskResult(task)
    const completedResult = await client.query(
      `UPDATE ai_tasks
          SET status = 'completed', result = $2, output = $2, updated_at = NOW()
        WHERE id = $1
        RETURNING id, user_id, type, prompt, status, credits_spent, result, created_at`,
      [taskId, result]
    )

    await client.query('COMMIT')
    return normalizeTask(completedResult.rows[0])
  } catch (error) {
    await client.query('ROLLBACK')
    await pool.query(
      `UPDATE ai_tasks
          SET status = 'failed', result = $2, output = $2, error = $3, updated_at = NOW()
        WHERE id = $1`,
      [taskId, { error: 'Task processing failed' }, error.message]
    )
    throw error
  } finally {
    client.release()
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
