const engine = require('../services/aiRevenueEngine/autonomousRevenueEngine')

async function getSnapshot(req, res, next) { try { res.json({ snapshot: await engine.getLatestSnapshot({ workspaceId: req.workspace.id }) }) } catch (e) { next(e) } }
async function getRecommendations(req, res, next) { try { res.json({ recommendations: await engine.getRecommendations({ workspaceId: req.workspace.id }) }) } catch (e) { next(e) } }
async function getRisks(req, res, next) { try { res.json({ risks: await engine.getRisks({ workspaceId: req.workspace.id }) }) } catch (e) { next(e) } }
async function runAnalysis(req, res, next) { try { res.status(201).json(await engine.runAnalysis({ workspaceId: req.workspace.id })) } catch (e) { next(e) } }

module.exports = { getSnapshot, getRecommendations, getRisks, runAnalysis }
