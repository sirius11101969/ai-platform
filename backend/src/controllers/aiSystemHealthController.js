const service = require('../services/aiSystemHealthService')

async function getSystemHealth(req, res, next) {
  try {
    const workspaceId = req.workspace?.id || req.aiControl?.workspaceId || req.workspaceId || null
    console.info('ai_system_health_auth_success', {
      workspaceId,
      authMode: req.aiControl?.authMode || (req.user ? 'jwt' : 'unknown'),
      userId: req.user?.id || null,
      path: req.originalUrl || req.url,
      method: req.method,
    })

    const result = await service.getSystemHealth({ workspaceId })
    console.info('ai_system_health_checked', {
      workspaceId,
      status: result?.status || 'unknown',
      summary: result?.summary || null,
    })
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

module.exports = { getSystemHealth }
