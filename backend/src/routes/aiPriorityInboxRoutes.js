const express = require('express')
const { createPriorityInboxAction, listPriorityInbox } = require('../services/aiPriorityInboxService')
const { requireAuth } = require('../middleware/authMiddleware')
const { requireWorkspace } = require('../middleware/workspaceMiddleware')

const router = express.Router()

router.use(requireAuth)
router.use(requireWorkspace)


router.post('/priority-inbox/actions', async (req, res, next) => {
  try {
    const result = await createPriorityInboxAction(req.user.id, req.workspace.id, req.body || {})
    res.status(result.duplicate ? 200 : 201).json(result)
  } catch (error) {
    next(error)
  }
})

router.get('/priority-inbox', async (req, res, next) => {
  try {
    const inbox = await listPriorityInbox(req.user.id, req.workspace.id, { mode: req.query.mode })
    res.json(inbox)
  } catch (error) {
    next(error)
  }
})

module.exports = router
