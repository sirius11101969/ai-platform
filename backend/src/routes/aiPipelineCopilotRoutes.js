const express = require('express')
const { requireAuth } = require('../middleware/authMiddleware')
const { requireWorkspace } = require('../middleware/workspaceMiddleware')
const { createPipelineCopilotAction, getPipelineCopilot } = require('../services/aiPipelineCopilotService')

const router = express.Router()

router.use(requireAuth)
router.use(requireWorkspace)

router.get('/pipeline-copilot', async (req, res, next) => {
  try {
    const result = await getPipelineCopilot(req.user.id, req.workspace.id)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.post('/pipeline-copilot/actions/followup', async (req, res, next) => {
  try {
    const result = await createPipelineCopilotAction(req.user.id, req.workspace.id, { leadId: req.body?.leadId, actionKind: 'followup' })
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.post('/pipeline-copilot/actions/meeting', async (req, res, next) => {
  try {
    const result = await createPipelineCopilotAction(req.user.id, req.workspace.id, { leadId: req.body?.leadId, actionKind: 'meeting' })
    res.json(result)
  } catch (error) {
    next(error)
  }
})

module.exports = router
