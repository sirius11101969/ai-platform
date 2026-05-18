const service = require('../services/aiManagerDashboardService')

async function getManagerDashboard(req, res, next) {
  try {
    const dashboard = await service.getManagerDashboard(req.user.id, req.workspace.id, { range: req.query.range })
    res.json(dashboard)
  } catch (error) {
    next(error)
  }
}

module.exports = { getManagerDashboard }
