const express = require('express')
const { createTask, executeTool, getTask, listTasks, listTools } = require('../controllers/aiTaskController')
const { requireAuth } = require('../middleware/authMiddleware')
const { requireWorkspace } = require('../middleware/workspaceMiddleware')

const router = express.Router()

router.use(requireAuth)
router.use(requireWorkspace)
router.get('/tools', listTools)
router.post('/tools/execute', executeTool)
router.post('/tasks', createTask)
router.get('/tasks', listTasks)
router.get('/tasks/:id', getTask)

module.exports = router
