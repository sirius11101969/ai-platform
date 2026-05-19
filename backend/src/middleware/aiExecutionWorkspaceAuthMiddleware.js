const pool = require('../db/pool')
const { requireAuth } = require('./authMiddleware')
const { requireWorkspace } = require('./workspaceMiddleware')
const { _private: runnerAuthPrivate } = require('./aiExecutionRunnerAuthMiddleware')

function resolveWorkspaceId(req) {
  return req.get('x-workspace-id') || req.query.workspaceId || req.body?.workspaceId || null
}

function requireAiExecutionWorkspaceAuth(options = {}) {
  const {
    missingWorkspaceError = 'workspaceId is required for admin key access',
    acceptedLogEvent = null,
    jwtAcceptedLogEvent = null,
  } = options

  return async function aiExecutionWorkspaceAuth(req, res, next) {
    try {
      if (runnerAuthPrivate.isInternalAdminKeyAccepted(req)) {
        const workspaceId = resolveWorkspaceId(req)
        if (!workspaceId) return res.status(400).json({ error: missingWorkspaceError })
        const result = await pool.query('SELECT id, name, owner_user_id, plan FROM workspaces WHERE id = $1::uuid LIMIT 1', [workspaceId])
        const workspace = result.rows[0]
        if (!workspace) return res.status(404).json({ error: 'Рабочее пространство не найдено' })
        req.user = { id: workspace.owner_user_id, authType: 'internal_admin_key' }
        req.workspace = { id: workspace.id, name: workspace.name, ownerUserId: workspace.owner_user_id, plan: workspace.plan, role: 'admin' }
        if (acceptedLogEvent) console.info(acceptedLogEvent, { method: req.method, path: req.originalUrl || req.url, workspaceId })
        return next()
      }
      return requireAuth(req, res, (authError) => {
        if (authError) return next(authError)
        return requireWorkspace(req, res, (workspaceError) => {
          if (workspaceError) return next(workspaceError)
          if (jwtAcceptedLogEvent) {
            console.info(jwtAcceptedLogEvent, {
              method: req.method,
              path: req.originalUrl || req.url,
              userId: req.user?.id,
              workspaceId: req.workspace?.id,
            })
          }
          return next()
        })
      })
    } catch (error) {
      return next(error)
    }
  }
}

module.exports = { requireAiExecutionWorkspaceAuth }
