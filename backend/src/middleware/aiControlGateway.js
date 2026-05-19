const pool = require('../db/pool')
const { requireAuth } = require('./authMiddleware')
const { requireWorkspace } = require('./workspaceMiddleware')
const { _private: runnerAuthPrivate } = require('./aiExecutionRunnerAuthMiddleware')

function resolveWorkspaceIdFromRequest(req) {
  return req.get('x-workspace-id')
    || req.query?.workspaceId
    || req.query?.workspace_id
    || req.body?.workspaceId
    || req.body?.workspace_id
    || req.params?.workspaceId
    || null
}

function emitGatewayLog(event, payload) {
  console.info(event, payload)
}

function requireAiControlGateway(options = {}) {
  const {
    requireWorkspaceForAdminKey = true,
    missingWorkspaceError = 'workspaceId is required for admin key access',
    resolveWorkspaceId = null,
  } = options

  return async function aiControlGateway(req, res, next) {
    try {
      const workspaceId = (typeof resolveWorkspaceId === 'function' ? resolveWorkspaceId(req) : null) || resolveWorkspaceIdFromRequest(req)

      if (workspaceId) {
        emitGatewayLog('ai_control_gateway_workspace_resolved', {
          method: req.method,
          path: req.originalUrl || req.url,
          workspaceId,
        })
      }

      if (runnerAuthPrivate.isInternalAdminKeyAccepted(req)) {
        if (requireWorkspaceForAdminKey && !workspaceId) {
          emitGatewayLog('ai_control_gateway_auth_denied', {
            method: req.method,
            path: req.originalUrl || req.url,
            reason: 'missing_workspace_for_admin_key',
          })
          return res.status(400).json({ error: missingWorkspaceError })
        }

        let workspace = null
        if (workspaceId) {
          const result = await pool.query('SELECT id, name, owner_user_id, plan FROM workspaces WHERE id = $1::uuid LIMIT 1', [workspaceId])
          workspace = result.rows[0] || null

          if (!workspace) {
            emitGatewayLog('ai_control_gateway_auth_denied', {
              method: req.method,
              path: req.originalUrl || req.url,
              reason: 'workspace_not_found',
              workspaceId,
            })
            return res.status(404).json({ error: 'Рабочее пространство не найдено' })
          }

          req.workspace = {
            id: workspace.id,
            name: workspace.name,
            ownerUserId: workspace.owner_user_id,
            plan: workspace.plan,
            role: 'admin',
          }
          req.user = { id: workspace.owner_user_id, authType: 'internal_admin_key' }
        }

        req.aiControl = {
          authMode: 'admin_key',
          workspaceId: req.workspace?.id || workspaceId || null,
          userId: req.user?.id || null,
          isAdminKey: true,
          isJwt: false,
          allowed: true,
        }

        emitGatewayLog('ai_control_gateway_auth_success', {
          method: req.method,
          path: req.originalUrl || req.url,
          authMode: req.aiControl.authMode,
          workspaceId: req.aiControl.workspaceId,
          userId: req.aiControl.userId,
        })

        return next()
      }

      return requireAuth(req, res, (authError) => {
        if (authError) {
          emitGatewayLog('ai_control_gateway_auth_denied', {
            method: req.method,
            path: req.originalUrl || req.url,
            reason: 'jwt_auth_failed',
          })
          return next(authError)
        }

        return requireWorkspace(req, res, (workspaceError) => {
          if (workspaceError) {
            emitGatewayLog('ai_control_gateway_auth_denied', {
              method: req.method,
              path: req.originalUrl || req.url,
              reason: 'workspace_auth_failed',
              userId: req.user?.id || null,
            })
            return next(workspaceError)
          }

          req.aiControl = {
            authMode: 'jwt',
            workspaceId: req.workspace?.id || workspaceId || null,
            userId: req.user?.id || null,
            isAdminKey: false,
            isJwt: true,
            allowed: true,
          }

          emitGatewayLog('ai_control_gateway_auth_success', {
            method: req.method,
            path: req.originalUrl || req.url,
            authMode: req.aiControl.authMode,
            workspaceId: req.aiControl.workspaceId,
            userId: req.aiControl.userId,
          })

          return next()
        })
      })
    } catch (error) {
      emitGatewayLog('ai_control_gateway_auth_denied', {
        method: req.method,
        path: req.originalUrl || req.url,
        reason: 'unexpected_error',
        message: error.message,
      })
      return next(error)
    }
  }
}

module.exports = {
  requireAiControlGateway,
  _private: { resolveWorkspaceIdFromRequest },
}
