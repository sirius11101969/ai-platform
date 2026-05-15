const aiTaskModel = require('../models/aiTaskModel')
const aiToolsService = require('../services/aiToolsService')

function scheduleTaskProcessing(taskId) {
  setImmediate(() => {
    aiTaskModel.processTask(taskId).catch((error) => {
      console.error('AI task processing failed', error)
    })
  })
}



async function listTools(_req, res) {
  res.json({ tools: aiToolsService.AI_TOOLS })
}

async function executeTool(req, res, next) {
  try {
    const result = await aiToolsService.executeTool(req.user.id, { ...req.body, workspaceId: req.workspace.id })
    res.status(202).json(result)
  } catch (error) {
    next(error)
  }
}

async function createTask(req, res, next) {
  try {
    const { task, remainingCredits } = await aiTaskModel.createTask(req.user.id, req.workspace.id, req.body)
    scheduleTaskProcessing(task.id)
    res.status(201).json({ task, remainingCredits, costs: aiTaskModel.TASK_COSTS, statuses: aiTaskModel.TASK_STATUSES })
  } catch (error) {
    next(error)
  }
}

async function listTasks(req, res, next) {
  try {
    const tasks = await aiTaskModel.listTasks(req.user.id, req.workspace.id)
    res.json({ tasks, costs: aiTaskModel.TASK_COSTS, statuses: aiTaskModel.TASK_STATUSES })
  } catch (error) {
    next(error)
  }
}

async function getTask(req, res, next) {
  try {
    const task = await aiTaskModel.findTaskById(req.user.id, req.workspace.id, req.params.id)
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
  executeTool,
  getTask,
  listTasks,
  listTools,
}
