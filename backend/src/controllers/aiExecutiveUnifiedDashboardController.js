const service = require('../services/aiExecutiveUnifiedDashboardService')
function resolve(req) { return { workspaceId: req.workspace?.id || req.aiControl?.workspaceId || req.workspaceId || null } }
async function getOverview(req, res, next) {
  try {
    const ctx = resolve(req)
    res.json(await service.getOverview(ctx))
  } catch (error) {
    next(error)
  }
}
module.exports = { getOverview }
