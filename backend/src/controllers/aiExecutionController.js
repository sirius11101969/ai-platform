const aiActionService = require('../services/aiActionService')
const attachmentService = require('../services/attachmentService')
const materialService = require('../services/materialService')
const timelineService = require('../services/timelineService')

async function listMaterials(req, res, next) {
  try { res.json({ materials: materialService.listMaterials() }) } catch (error) { next(error) }
}

async function sendLeadAttachments(req, res, next) {
  try {
    const result = await attachmentService.sendLeadAttachments({ userId: req.user.id, workspaceId: req.workspace.id, leadId: req.params.id, ...req.body })
    res.status(201).json(result)
  } catch (error) { next(error) }
}

async function listLeadActionCenter(req, res, next) {
  try {
    const [actions, timeline, attachments] = await Promise.all([
      aiActionService.listLeadActions(req.user.id, req.workspace.id, req.params.id),
      timelineService.listLeadTimeline(req.user.id, req.workspace.id, req.params.id),
      attachmentService.listLeadAttachments(req.user.id, req.workspace.id, req.params.id),
    ])
    res.json({ actions, timeline, attachments })
  } catch (error) { next(error) }
}

async function createLeadAction(req, res, next) {
  try {
    const action = await aiActionService.createAction({ userId: req.user.id, workspaceId: req.workspace.id, leadId: req.params.id, ...req.body })
    res.status(201).json({ action })
  } catch (error) { next(error) }
}

async function updateAction(req, res, next) {
  try { res.json({ action: await aiActionService.updateAction(req.user.id, req.workspace.id, req.params.actionId, req.body) }) } catch (error) { next(error) }
}

async function approveAction(req, res, next) {
  try { res.json({ action: await aiActionService.transitionAction(req.user.id, req.workspace.id, req.params.actionId, 'approved') }) } catch (error) { next(error) }
}

async function cancelAction(req, res, next) {
  try { res.json({ action: await aiActionService.transitionAction(req.user.id, req.workspace.id, req.params.actionId, 'cancelled') }) } catch (error) { next(error) }
}

async function sendAction(req, res, next) {
  try { res.status(202).json(await aiActionService.sendAction(req.user.id, req.workspace.id, req.params.actionId)) } catch (error) { next(error) }
}

module.exports = { approveAction, cancelAction, createLeadAction, listLeadActionCenter, listMaterials, sendAction, sendLeadAttachments, updateAction }
