const express = require('express')
const { listPriorityInbox } = require('../services/aiPriorityInboxService')
const { requireAuth } = require('../middleware/authMiddleware')
const { requireWorkspace } = require('../middleware/workspaceMiddleware')

const router = express.Router()

router.use(requireAuth)
router.use(requireWorkspace)

router.get('/priority-inbox', async (req, res, next) => {
  try {
    const inbox = await listPriorityInbox(req.user.id, req.workspace.id)
    res.json(inbox)
  } catch (error) {
    next(error)
  }
})

module.exports = router
