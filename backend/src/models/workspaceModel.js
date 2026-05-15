const pool = require('../db/pool')
const { PLAN_KEYS, getPlanLimits } = require('../plans')

const ROLES = ['owner', 'admin', 'sales', 'viewer']
const WRITE_ROLES = ['owner', 'admin']

function normalizeWorkspace(row) {
  if (!row) return null
  const plan = row.plan || 'free'
  return {
    id: row.id,
    name: row.name,
    ownerUserId: row.owner_user_id,
    plan,
    creditsPool: Number(row.credits_pool || 0),
    role: row.role || null,
    limits: getPlanLimits(plan),
    usage: row.usage || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function normalizeMember(row) {
  if (!row) return null
  return { id: row.id, workspaceId: row.workspace_id, userId: row.user_id, email: row.email || '', role: row.role, createdAt: row.created_at }
}

function assertUuid(id, message = 'Invalid workspace id') {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id || ''))) {
    throw Object.assign(new Error(message), { statusCode: 400 })
  }
}

function normalizeName(name) {
  const value = String(name || '').trim()
  if (!value || value.length > 120) throw Object.assign(new Error('Workspace name is required'), { statusCode: 400 })
  return value
}

function normalizePlan(plan) {
  const value = String(plan || 'free').trim().toLowerCase()
  if (!PLAN_KEYS.includes(value)) throw Object.assign(new Error(`Plan must be one of: ${PLAN_KEYS.join(', ')}`), { statusCode: 400 })
  return value
}

async function ensureDefaultWorkspace(userId, client = pool) {
  const existing = await client.query(
    `SELECT w.*, wm.role
       FROM workspaces w
       JOIN workspace_members wm ON wm.workspace_id = w.id
      WHERE wm.user_id = $1
      ORDER BY CASE wm.role WHEN 'owner' THEN 0 ELSE 1 END, w.created_at ASC
      LIMIT 1`,
    [userId]
  )
  if (existing.rows[0]) return normalizeWorkspace(existing.rows[0])

  const user = await client.query('SELECT id, email, credits, plan, created_at FROM users WHERE id = $1', [userId])
  if (!user.rows[0]) throw Object.assign(new Error('User not found'), { statusCode: 401 })
  const name = `${String(user.rows[0].email).split('@')[0]} workspace`
  const workspace = await client.query(
    `INSERT INTO workspaces(name, owner_user_id, plan, credits_pool, created_at, updated_at)
     VALUES($1, $2, $3, $4, COALESCE($5, NOW()), NOW())
     RETURNING *`,
    [name, userId, user.rows[0].plan || 'free', user.rows[0].credits || 0, user.rows[0].created_at]
  )
  await client.query('INSERT INTO workspace_members(workspace_id, user_id, role) VALUES($1, $2, $3) ON CONFLICT DO NOTHING', [workspace.rows[0].id, userId, 'owner'])
  return normalizeWorkspace({ ...workspace.rows[0], role: 'owner' })
}

async function listWorkspaces(userId) {
  await ensureDefaultWorkspace(userId)
  const result = await pool.query(
    `SELECT w.*, wm.role
       FROM workspaces w
       JOIN workspace_members wm ON wm.workspace_id = w.id
      WHERE wm.user_id = $1
      ORDER BY w.updated_at DESC, w.created_at DESC`,
    [userId]
  )
  return result.rows.map(normalizeWorkspace)
}

async function getWorkspaceForUser(userId, workspaceId = null) {
  if (!workspaceId) return ensureDefaultWorkspace(userId)
  assertUuid(workspaceId)
  const result = await pool.query(
    `SELECT w.*, wm.role
       FROM workspaces w
       JOIN workspace_members wm ON wm.workspace_id = w.id
      WHERE w.id = $1 AND wm.user_id = $2`,
    [workspaceId, userId]
  )
  return normalizeWorkspace(result.rows[0])
}

async function getUsage(workspaceId) {
  assertUuid(workspaceId)
  const [credits, leads, emails, telegram] = await Promise.all([
    pool.query("SELECT COALESCE(SUM(-amount) FILTER (WHERE amount < 0), 0)::int AS count FROM credits_ledger WHERE workspace_id = $1", [workspaceId]),
    pool.query('SELECT COUNT(*)::int AS count FROM crm_leads WHERE workspace_id = $1', [workspaceId]),
    pool.query('SELECT COUNT(*)::int AS count FROM email_messages WHERE workspace_id = $1', [workspaceId]),
    pool.query('SELECT COUNT(*)::int AS count FROM telegram_messages WHERE workspace_id = $1', [workspaceId]),
  ])
  return {
    aiCreditsUsed: Number(credits.rows[0]?.count || 0),
    leadsCount: Number(leads.rows[0]?.count || 0),
    emailActionsCount: Number(emails.rows[0]?.count || 0),
    telegramMessagesCount: Number(telegram.rows[0]?.count || 0),
  }
}

async function getCurrentWorkspace(userId, workspaceId = null) {
  const workspace = await getWorkspaceForUser(userId, workspaceId)
  if (!workspace) throw Object.assign(new Error('Workspace not found'), { statusCode: 404 })
  const [members, usage] = await Promise.all([listMembers(userId, workspace.id), getUsage(workspace.id)])
  return { ...workspace, members, usage }
}

async function createWorkspace(userId, payload) {
  const name = normalizeName(payload.name)
  const plan = normalizePlan(payload.plan || 'free')
  const creditsPool = Math.max(0, Number(payload.creditsPool ?? getPlanLimits(plan).monthlyAiCredits) || 0)
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await client.query(
      `INSERT INTO workspaces(name, owner_user_id, plan, credits_pool)
       VALUES($1, $2, $3, $4) RETURNING *`,
      [name, userId, plan, creditsPool]
    )
    await client.query('INSERT INTO workspace_members(workspace_id, user_id, role) VALUES($1, $2, $3)', [result.rows[0].id, userId, 'owner'])
    await client.query('COMMIT')
    return normalizeWorkspace({ ...result.rows[0], role: 'owner' })
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function updateWorkspace(userId, workspaceId, payload) {
  assertUuid(workspaceId)
  const current = await getWorkspaceForUser(userId, workspaceId)
  if (!current) throw Object.assign(new Error('Workspace not found'), { statusCode: 404 })
  if (!WRITE_ROLES.includes(current.role)) throw Object.assign(new Error('Workspace admin role is required'), { statusCode: 403 })
  const updates = []
  const values = [workspaceId]
  if (Object.prototype.hasOwnProperty.call(payload, 'name')) {
    values.push(normalizeName(payload.name)); updates.push(`name = $${values.length}`)
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'plan')) {
    values.push(normalizePlan(payload.plan)); updates.push(`plan = $${values.length}`)
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'creditsPool')) {
    values.push(Math.max(0, Number(payload.creditsPool) || 0)); updates.push(`credits_pool = $${values.length}`)
  }
  if (!updates.length) return current
  updates.push('updated_at = NOW()')
  const result = await pool.query(`UPDATE workspaces SET ${updates.join(', ')} WHERE id = $1 RETURNING *`, values)
  return normalizeWorkspace({ ...result.rows[0], role: current.role })
}

async function addMember(userId, workspaceId, payload) {
  assertUuid(workspaceId)
  const current = await getWorkspaceForUser(userId, workspaceId)
  if (!current) throw Object.assign(new Error('Workspace not found'), { statusCode: 404 })
  if (!WRITE_ROLES.includes(current.role)) throw Object.assign(new Error('Workspace admin role is required'), { statusCode: 403 })
  const role = String(payload.role || 'viewer').trim().toLowerCase()
  if (!ROLES.includes(role) || role === 'owner') throw Object.assign(new Error(`Role must be one of: admin, sales, viewer`), { statusCode: 400 })
  const email = String(payload.email || '').trim().toLowerCase()
  const targetUserId = payload.userId || null
  const userResult = targetUserId
    ? await pool.query('SELECT id, email FROM users WHERE id = $1', [targetUserId])
    : await pool.query('SELECT id, email FROM users WHERE lower(email) = lower($1)', [email])
  if (!userResult.rows[0]) throw Object.assign(new Error('User not found'), { statusCode: 404 })
  const limit = current.limits.teamMembersLimit
  const count = await pool.query('SELECT COUNT(*)::int AS count FROM workspace_members WHERE workspace_id = $1', [workspaceId])
  if (Number(count.rows[0].count) >= limit) throw Object.assign(new Error('Workspace team members limit reached'), { statusCode: 402 })
  const member = await pool.query(
    `INSERT INTO workspace_members(workspace_id, user_id, role)
     VALUES($1, $2, $3)
     ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = EXCLUDED.role
     RETURNING id, workspace_id, user_id, role, created_at`,
    [workspaceId, userResult.rows[0].id, role]
  )
  return normalizeMember({ ...member.rows[0], email: userResult.rows[0].email })
}

async function listMembers(_userId, workspaceId) {
  const result = await pool.query(
    `SELECT wm.id, wm.workspace_id, wm.user_id, u.email, wm.role, wm.created_at
       FROM workspace_members wm
       JOIN users u ON u.id = wm.user_id
      WHERE wm.workspace_id = $1
      ORDER BY CASE wm.role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 WHEN 'sales' THEN 2 ELSE 3 END, wm.created_at ASC`,
    [workspaceId]
  )
  return result.rows.map(normalizeMember)
}

module.exports = { ROLES, addMember, createWorkspace, ensureDefaultWorkspace, getCurrentWorkspace, getPlanLimits, getUsage, getWorkspaceForUser, listMembers, listWorkspaces, updateWorkspace }
