const express = require('express')
const { createTask, getTask, listTasks } = require('../controllers/aiTaskController')
const { requireAuth } = require('../middleware/authMiddleware')

const router = express.Router()

router.use(requireAuth)
router.post('/tasks', createTask)
router.get('/tasks', listTasks)
router.get('/tasks/:id', getTask)

module.exports = router
