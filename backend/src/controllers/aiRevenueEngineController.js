const engine = require('../services/aiRevenueEngine/autonomousRevenueEngine')

function resolveRevenueEngineContext(req) {
  const workspaceId = req.workspace?.id || req.workspaceId || req.aiGateway?.workspaceId || req.aiControl?.workspaceId || req.executionContext?.workspaceId || null
  const authMode = req.aiGateway?.authMode || req.aiControl?.authMode || req.executionContext?.authMode || null
  const userId = req.user?.id || req.aiGateway?.userId || req.aiControl?.userId || req.executionContext?.userId || null
  return { workspaceId, authMode, userId }
}

async function getSnapshot(req, res, next) {
  try {
    const context = resolveRevenueEngineContext(req)
    console.info('ai_revenue_engine_context_resolved', { method: req.method, path: req.originalUrl || req.url, ...context })
    res.json({ snapshot: await engine.getLatestSnapshot({ workspaceId: context.workspaceId }) })
  } catch (e) { next(e) }
}

async function getRecommendations(req, res, next) {
  try {
    const context = resolveRevenueEngineContext(req)
    console.info('ai_revenue_engine_context_resolved', { method: req.method, path: req.originalUrl || req.url, ...context })
    res.json({ recommendations: await engine.getRecommendations({ workspaceId: context.workspaceId }) })
  } catch (e) { next(e) }
}

async function getRisks(req, res, next) {
  try {
    const context = resolveRevenueEngineContext(req)
    console.info('ai_revenue_engine_context_resolved', { method: req.method, path: req.originalUrl || req.url, ...context })
    res.json({ risks: await engine.getRisks({ workspaceId: context.workspaceId }) })
  } catch (e) { next(e) }
}

async function runAnalysis(req, res, next) {
  try {
    const context = resolveRevenueEngineContext(req)
    console.info('ai_revenue_engine_context_resolved', { method: req.method, path: req.originalUrl || req.url, ...context })
    console.info('ai_revenue_engine_analysis_started', {
      method: req.method,
      path: req.originalUrl || req.url,
      workspaceId: context.workspaceId,
      authMode: context.authMode,
      userId: context.userId,
    })
    const analysis = await engine.runAnalysis({ workspaceId: context.workspaceId })
    console.info('ai_revenue_engine_analysis_completed', {
      method: req.method,
      path: req.originalUrl || req.url,
      workspaceId: context.workspaceId,
      authMode: context.authMode,
      userId: context.userId,
    })
    res.status(200).json(analysis)
  } catch (e) { next(e) }
}

module.exports = { getSnapshot, getRecommendations, getRisks, runAnalysis }
