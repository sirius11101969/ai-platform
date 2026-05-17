const aiWorkerModel = require('../models/aiWorkerModel')

async function listWorkers(req, res, next) {
  try {
    const workers = await aiWorkerModel.listWorkers(req.workspace.id)
    res.json({ workers, statuses: aiWorkerModel.STATUSES, modes: aiWorkerModel.MODES, types: aiWorkerModel.WORKER_TYPES })
  } catch (error) {
    next(error)
  }
}

async function createWorker(req, res, next) {
  try {
    const worker = await aiWorkerModel.createWorker(req.workspace.id, req.body)
    res.status(201).json({ worker })
  } catch (error) {
    next(error)
  }
}

async function updateWorker(req, res, next) {
  try {
    const worker = await aiWorkerModel.updateWorker(req.workspace.id, req.params.id, req.body)
    res.json({ worker })
  } catch (error) {
    next(error)
  }
}

async function listRuns(req, res, next) {
  try {
    const runs = await aiWorkerModel.listRuns(req.workspace.id, req.params.id)
    res.json({ runs })
  } catch (error) {
    next(error)
  }
}

async function commandCenter(req, res, next) {
  try {
    const commandCenter = await aiWorkerModel.getCommandCenter(req.workspace.id)
    res.json({ commandCenter })
  } catch (error) {
    next(error)
  }
}

async function runWorker(req, res, next) {
  try {
    const result = await aiWorkerModel.runWorker({ userId: req.user.id, workspaceId: req.workspace.id, workerId: req.params.id })
    res.status(202).json(result)
  } catch (error) {
    next(error)
  }
}

async function runWorkerByType(req, res, next) {
  try {
    const result = await aiWorkerModel.runWorkerByType({ userId: req.user.id, workspaceId: req.workspace.id, workerType: req.params.type })
    res.status(202).json(result)
  } catch (error) {
    next(error)
  }
}

module.exports = { commandCenter, createWorker, listRuns, listWorkers, runWorker, runWorkerByType, updateWorker }
