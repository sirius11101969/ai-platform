const workspaceModel = require('../models/workspaceModel')

async function requireWorkspace(req, res, next) {
  try {
    const workspaceId = req.get('x-workspace-id') || req.query.workspaceId || req.body?.workspaceId || null
    const workspace = await workspaceModel.getWorkspaceForUser(req.user.id, workspaceId)
    if (!workspace) return res.status(404).json({ error: 'Рабочее пространство не найдено' })
    req.workspace = workspace
    return next()
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message || 'Доступ к рабочему пространству не выполнен' })
  }
}

function requireWorkspaceRole(roles = []) {
  return (req, res, next) => {
    if (!req.workspace) return res.status(500).json({ error: 'Контекст рабочего пространства отсутствует' })
    if (!roles.includes(req.workspace.role)) return res.status(403).json({ error: 'Недостаточно прав в рабочем пространстве' })
    return next()
  }
}

module.exports = { requireWorkspace, requireWorkspaceRole }
