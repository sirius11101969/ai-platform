const express = require('express')
const pool = require('../db/pool')
const { requireAuth } = require('../middleware/authMiddleware')
const { requireWorkspace } = require('../middleware/workspaceMiddleware')
const { _private: runnerAuthPrivate } = require('../middleware/aiExecutionRunnerAuthMiddleware')
const controller = require('../controllers/aiVoiceOutreachController')

const router = express.Router()

async function requireVoiceAuth(req, res, next) {
  try {
    if (runnerAuthPrivate.isInternalAdminKeyAccepted(req)) {
      const workspaceId = req.get('x-workspace-id') || req.query.workspaceId || req.body?.workspaceId || null
      if (!workspaceId) return res.status(400).json({ error: 'workspaceId is required for admin key voice access' })
      const result = await pool.query('SELECT id, name, owner_user_id, plan FROM workspaces WHERE id = $1::uuid LIMIT 1', [workspaceId])
      const workspace = result.rows[0]
      if (!workspace) return res.status(404).json({ error: 'Рабочее пространство не найдено' })
      req.user = { id: workspace.owner_user_id, authType: 'internal_admin_key' }
      req.workspace = { id: workspace.id, name: workspace.name, ownerUserId: workspace.owner_user_id, plan: workspace.plan, role: 'admin' }
      return next()
    }
    return requireAuth(req, res, (authError) => {
      if (authError) return next(authError)
      return requireWorkspace(req, res, next)
    })
  } catch (error) {
    return next(error)
  }
}

router.post('/voice/call', requireVoiceAuth, controller.createCall)
router.get('/voice/calls', requireVoiceAuth, controller.listCalls)
router.get('/voice/calls/:id', requireVoiceAuth, controller.getCall)

module.exports = router
