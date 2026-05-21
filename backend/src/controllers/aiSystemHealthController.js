const service = require('../services/aiSystemHealthService')

async function getSystemHealth(req, res, next) {
  try {
    const workspaceId = req.workspace?.id || req.aiControl?.workspaceId || req.workspaceId || null
    const result = await service.getSystemHealth({ workspaceId })
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

module.exports = { getSystemHealth }
