const aiRevenueIntelligenceService = require('../services/aiRevenueIntelligenceService')

async function dashboard(req, res, next) {
  try {
    const intelligence = await aiRevenueIntelligenceService.getRevenueIntelligenceDashboard({ workspaceId: req.workspace.id })
    res.json({ intelligence })
  } catch (error) {
    next(error)
  }
}

async function analyzeLead(req, res, next) {
  try {
    const score = await aiRevenueIntelligenceService.analyzeLeadRevenueIntelligence({ workspaceId: req.workspace.id, userId: req.user.id, leadId: req.params.leadId })
    res.status(201).json({ score })
  } catch (error) {
    next(error)
  }
}

async function generateForecast(req, res, next) {
  try {
    const forecast = await aiRevenueIntelligenceService.generateRevenueForecast({ workspaceId: req.workspace.id, forecastPeriod: req.body?.forecastPeriod })
    res.status(201).json({ forecast })
  } catch (error) {
    next(error)
  }
}

async function schedule(req, res, next) {
  try {
    const scheduled = await aiRevenueIntelligenceService.enqueueDueRevenueIntelligence({ limit: req.body?.limit || 25 })
    res.status(202).json({ scheduled })
  } catch (error) {
    next(error)
  }
}

module.exports = { analyzeLead, dashboard, generateForecast, schedule }
