const service = require('../services/aiCommandCenterService')

function resolve(req) {
  return {
    workspaceId: req.workspace?.id || req.aiControl?.workspaceId || req.workspaceId || null,
    userId: req.user?.id || req.aiControl?.userId || null,
  }
}

async function getOverview(req, res, next) { try { res.json(await service.getOverview(resolve(req))) } catch (e) { next(e) } }
async function getTimeline(req, res, next) { try { res.json(await service.getTimeline(resolve(req))) } catch (e) { next(e) } }
async function getBrief(req, res, next) { try { res.json(await service.getBrief(resolve(req))) } catch (e) { next(e) } }
async function getOperations(req, res, next) { try { res.json(await service.getOperations(resolve(req))) } catch (e) { next(e) } }
async function getFocus(req, res, next) { try { res.json(await service.getFocus(resolve(req))) } catch (e) { next(e) } }
async function getDailyReport(req, res, next) { try { res.json(await service.getReport({ ...resolve(req), reportType: 'daily' })) } catch (e) { next(e) } }
async function getWeeklyReport(req, res, next) { try { res.json(await service.getReport({ ...resolve(req), reportType: 'weekly' })) } catch (e) { next(e) } }
async function getKpi(req, res, next) { try { res.json(await service.getKpi(resolve(req))) } catch (e) { next(e) } }
async function getPlanning(req, res, next) { try { res.json(await service.getPlanning(resolve(req))) } catch (e) { next(e) } }
async function getPlanningWeekly(req, res, next) { try { res.json(await service.getPlanningWeekly(resolve(req))) } catch (e) { next(e) } }
async function getPlanningMonthly(req, res, next) { try { res.json(await service.getPlanningMonthly(resolve(req))) } catch (e) { next(e) } }
async function getReview(req, res, next) { try { res.json(await service.getReview(resolve(req))) } catch (e) { next(e) } }
async function getStability(req, res, next) { try { res.json(await service.getStability(resolve(req))) } catch (e) { next(e) } }
async function getReadiness(req, res, next) { try { res.json(await service.getReadiness(resolve(req))) } catch (e) { next(e) } }
async function requestAction(req, res, next) { try { const { actionType, reason } = req.body || {}; res.status(201).json(await service.requestAction({ ...resolve(req), actionType, reason })) } catch (e) { next(e) } }
async function getActions(req, res, next) { try { res.json(await service.getActions({ ...resolve(req), limit: req.query?.limit, status: req.query?.status })) } catch (e) { next(e) } }
async function getInbox(req, res, next) { try { res.json(await service.getActions({ ...resolve(req), limit: req.query?.limit, status: 'requested' })) } catch (e) { next(e) } }
async function approveAction(req, res, next) { try { res.json(await service.reviewAction({ ...resolve(req), actionId: req.params.id, decision: 'approve', reviewNote: req.body?.reviewNote, reviewer: resolve(req).userId })) } catch (e) { next(e) } }
async function rejectAction(req, res, next) { try { res.json(await service.reviewAction({ ...resolve(req), actionId: req.params.id, decision: 'reject', reviewNote: req.body?.reviewNote, reviewer: resolve(req).userId })) } catch (e) { next(e) } }
async function getActionAudit(req, res, next) { try { res.json(await service.getActionAudit({ ...resolve(req), actionId: req.params.id, limit: req.query?.limit })) } catch (e) { next(e) } }

module.exports = { getOverview, getTimeline, getBrief, getOperations, getFocus, getDailyReport, getWeeklyReport, getKpi, getPlanning, getPlanningWeekly, getPlanningMonthly, getReview, getStability, getReadiness, requestAction, getActions, getInbox, approveAction, rejectAction, getActionAudit }
