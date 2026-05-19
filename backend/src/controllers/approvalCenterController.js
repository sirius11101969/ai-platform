const service = require('../services/approvalCenter/approvalCenterService')

async function list(req, res, next) { try { res.json(await service.listQueue(req.workspace.id, { status: req.query.status })) } catch (error) { next(error) } }
async function approve(req, res, next) { try { res.json({ item: await service.updateDecision({ userId: req.user.id, workspaceId: req.workspace.id, id: req.params.id, action: 'approve', reason: req.body?.reason }) }) } catch (error) { next(error) } }
async function reject(req, res, next) { try { res.json({ item: await service.updateDecision({ userId: req.user.id, workspaceId: req.workspace.id, id: req.params.id, action: 'reject', reason: req.body?.reason }) }) } catch (error) { next(error) } }
async function snooze(req, res, next) { try { res.json({ item: await service.updateDecision({ userId: req.user.id, workspaceId: req.workspace.id, id: req.params.id, action: 'snooze', reason: req.body?.reason, snoozeUntil: req.body?.snoozeUntil }) }) } catch (error) { next(error) } }
async function escalate(req, res, next) { try { res.json({ item: await service.updateDecision({ userId: req.user.id, workspaceId: req.workspace.id, id: req.params.id, action: 'escalate', reason: req.body?.reason }) }) } catch (error) { next(error) } }
module.exports = { list, approve, reject, snooze, escalate }
