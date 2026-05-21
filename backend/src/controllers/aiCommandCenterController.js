const service = require('../services/aiCommandCenterService')

function resolve(req) {
  return { workspaceId: req.workspace?.id || req.aiControl?.workspaceId || req.workspaceId || null }
}

async function getOverview(req, res, next) {
  try {
    const ctx = resolve(req)
    const response = await service.getOverview(ctx)
    res.json(response)
  } catch (error) {
    next(error)
  }
}

async function getTimeline(req, res, next) {
  try {
    const ctx = resolve(req)
    const response = await service.getTimeline(ctx)
    res.json(response)
  } catch (error) {
    next(error)
  }
}

module.exports = { getOverview, getTimeline, requestAction, getActions }


async function requestAction(req, res, next) {
  try {
    const ctx = resolve(req)
    const { actionType, reason } = req.body || {}
    const response = await service.requestAction({ ...ctx, actionType, reason })
    res.status(201).json(response)
  } catch (error) {
    next(error)
  }
}

async function getActions(req, res, next) {
  try {
    const ctx = resolve(req)
    const response = await service.getActions({ ...ctx, limit: req.query?.limit })
    res.json(response)
  } catch (error) {
    next(error)
  }
}
