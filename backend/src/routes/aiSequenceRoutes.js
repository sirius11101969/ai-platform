const express = require('express')
const controller = require('../controllers/aiSequenceController')
const { requireAiExecutionRunnerAuth } = require('../middleware/aiExecutionRunnerAuthMiddleware')
const { requireWorkspace } = require('../middleware/workspaceMiddleware')

const router = express.Router()

router.use('/sequences', (req, res, next) => requireAiExecutionRunnerAuth(req, res, next))
router.use('/sequences', (req, res, next) => {
  if (req.method === 'GET' && /^\/live-stream\/sessions\/[^/]+\/stream$/.test(req.path)) {
    return next()
  }

  if (req.aiExecutionAuth?.type === 'internal_admin_key') {
    const workspaceId = req.get('x-workspace-id') || req.body?.workspaceId || req.body?.workspace_id || req.query.workspaceId || req.query.workspace_id
    if (!workspaceId) return res.status(400).json({ error: 'workspaceId is required for admin-key sequence requests' })
    console.info('sequence_admin_key_accepted', { method: req.method, path: req.originalUrl || req.url, workspaceId })
    return next()
  }
  return requireWorkspace(req, res, next)
})

router.post('/sequences/start', controller.start)
router.post('/sequences/pause', controller.pause)
router.post('/sequences/stop', controller.stop)
router.get('/sequences/active', controller.active)

module.exports = router
