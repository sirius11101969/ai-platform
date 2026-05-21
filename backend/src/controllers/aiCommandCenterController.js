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

module.exports = { getOverview }
