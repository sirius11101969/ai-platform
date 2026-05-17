const express = require('express')
const { requireAuth } = require('../middleware/authMiddleware')
const { requireWorkspace } = require('../middleware/workspaceMiddleware')
const { getPipelineCopilot } = require('../services/aiPipelineCopilotService')

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

module.exports = router
