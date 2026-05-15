const aiTaskModel = require('../models/aiTaskModel')

function scheduleTaskProcessing(taskId) {
  setImmediate(() => {
    aiTaskModel.processTask(taskId).catch((error) => {
      console.error('AI task processing failed', error)
    })
  })
}

async function createTask(req, res, next) {
  try {
    const { task, remainingCredits } = await aiTaskModel.createTask(req.user.id, req.body)
    scheduleTaskProcessing(task.id)
    res.status(201).json({ task, remainingCredits, costs: aiTaskModel.TASK_COSTS })
  } catch (error) {
    next(error)
  }
}

async function listTasks(req, res, next) {
  try {
    const tasks = await aiTaskModel.listTasks(req.user.id)
    res.json({ tasks, costs: aiTaskModel.TASK_COSTS })
  } catch (error) {
    next(error)
  }
}

async function getTask(req, res, next) {
  try {
    const task = await aiTaskModel.findTaskById(req.user.id, req.params.id)
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }
    return res.json({ task })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createTask,
  getTask,
  listTasks,
}
