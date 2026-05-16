const service = require('../services/aiFollowupEngineService')

async function list(req, res, next) { try { res.json(await service.listFollowups(req.user.id, req.workspace.id)) } catch (error) { next(error) } }
async function scan(req, res, next) { try { res.status(201).json(await service.scanWorkspace(req.user.id, req.workspace.id)) } catch (error) { next(error) } }
async function approve(req, res, next) { try { res.json({ item: await service.transition(req.user.id, req.workspace.id, req.params.id, 'approved', req.body?.reason || '') }) } catch (error) { next(error) } }
async function reject(req, res, next) { try { res.json({ item: await service.transition(req.user.id, req.workspace.id, req.params.id, 'rejected', req.body?.reason || '') }) } catch (error) { next(error) } }
async function update(req, res, next) { try { res.json({ item: await service.updateFollowup(req.user.id, req.workspace.id, req.params.id, req.body || {}) }) } catch (error) { next(error) } }
async function send(req, res, next) {
  const context = { id: req.params.id, userId: req.user.id, workspaceId: req.workspace.id }
  console.log('[ai-followups] send requested', context)

  try {
    const result = await service.send(req.user.id, req.workspace.id, req.params.id)
    if (result?.error) {
      console.log('[ai-followups] send failed', { ...context, status: result.item?.status, error: result.error })
    } else {
      console.log('[ai-followups] send succeeded', { ...context, status: result?.item?.status })
    }
    res.json(result)
  } catch (error) {
    console.log('[ai-followups] send failed', { ...context, error: error.message })
    next(error)
  }
}
module.exports = { approve, list, reject, scan, send, update }
