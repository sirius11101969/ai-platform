const pool = require('../db/pool')

const TASK_COSTS = {
  ai_content_generation: 5,
  ai_sales_reply: 8,
  ai_telegram_outreach: 9,
  ai_crm_follow_up: 12,
}

const LEGACY_TASK_TYPE_ALIASES = {
  text_generation: 'ai_content_generation',
  sales_email: 'ai_sales_reply',
  crm_summary: 'ai_crm_follow_up',
  lead_follow_up: 'ai_crm_follow_up',
}

const TASK_TYPES = Object.keys(TASK_COSTS)
const TASK_STATUSES = ['pending', 'processing', 'completed', 'failed']
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function normalizeTask(row) {
  if (!row) return null
  return {
    id: row.id,
    user_id: row.user_id,
    type: normalizeTaskType(row.type || row.task_type),
    prompt: row.prompt || row.input?.prompt || '',
    status: row.status,
    credits_spent: Number(row.credits_spent || 0),
    result: row.result || row.output || null,
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

async function listTasks(userId) {
  const result = await pool.query(
    `SELECT id, user_id, type, prompt, status, credits_spent, result, created_at, updated_at, task_type, input, output
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
    `SELECT id, user_id, type, prompt, status, credits_spent, result, created_at, updated_at, task_type, input, output
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
       RETURNING id, user_id, type, prompt, status, credits_spent, result, created_at, updated_at`,
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
    ai_content_generation: {
      title: 'AI content generation',
      content: `Premium content draft for: ${promptPreview}\n\nHook: Open with the highest-impact business outcome.\nAngle: Make the promise specific, measurable, and credible.\nCTA: Invite the reader to launch the next AI workflow.`,
      artifacts: ['hook', 'value proposition', 'call to action'],
    },
    ai_sales_reply: {
      title: 'AI sales reply',
      subject: 'Re: next step for your AI workflow',
      content: `Hi,\n\nThanks for the context: ${promptPreview}. The best reply is consultative: acknowledge the need, connect it to a clear ROI outcome, and suggest a short next step.\n\nRecommended CTA: “Can we map the first automation this week?”`,
      artifacts: ['objection handling', 'ROI framing', 'meeting CTA'],
    },
    ai_telegram_outreach: {
      title: 'AI Telegram outreach',
      message: `Quick Telegram sequence for: ${promptPreview}\n\n1) Personal opener tied to their role/company.\n2) One-line pain point about missed follow-ups or slow CRM work.\n3) Soft CTA: ask if they want a 2-minute workflow audit.`,
      artifacts: ['telegram opener', 'pain-point line', 'soft CTA'],
    },
    ai_crm_follow_up: {
      title: 'AI CRM follow-up',
      steps: [
        `Log context: ${promptPreview}`,
        'Create next action with a clear owner and due date.',
        'Send a personalized recap within 2 hours.',
        'Schedule the next touch based on lead priority.',
      ],
      artifacts: ['crm note', 'next action', 'follow-up cadence'],
    },
  }

  return {
    ...templates[task.type],
    generatedAt,
    model: 'ai-task-engine-v1',
    creditsSpent: task.credits_spent,
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function processTask(taskId) {
  try {
    const processingResult = await pool.query(
      `UPDATE ai_tasks
          SET status = 'processing', updated_at = NOW()
        WHERE id = $1 AND status = 'pending'
        RETURNING id, user_id, type, prompt, status, credits_spent, result, created_at, updated_at`,
      [taskId]
    )

    const task = normalizeTask(processingResult.rows[0])
    if (!task) return null

    await sleep(Number(process.env.AI_TASK_PROCESSING_DELAY_MS || 1200))

    const result = buildTaskResult(task)
    const completedResult = await pool.query(
      `UPDATE ai_tasks
          SET status = 'completed', result = $2, output = $2, updated_at = NOW()
        WHERE id = $1 AND status = 'processing'
        RETURNING id, user_id, type, prompt, status, credits_spent, result, created_at, updated_at`,
      [taskId, result]
    )

    return normalizeTask(completedResult.rows[0])
  } catch (error) {
    await pool.query(
      `UPDATE ai_tasks
          SET status = 'failed', result = $2, output = $2, error = $3, updated_at = NOW()
        WHERE id = $1`,
      [taskId, { error: 'Task processing failed' }, error.message]
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
