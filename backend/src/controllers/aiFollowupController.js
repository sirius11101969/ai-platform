const service = require('../services/aiFollowupEngineService')

async function list(req, res, next) { try { res.json(await service.listFollowups(req.user.id, req.workspace.id)) } catch (error) { next(error) } }
async function scan(req, res, next) { try { res.status(201).json(await service.scanWorkspace(req.user.id, req.workspace.id)) } catch (error) { next(error) } }
async function approve(req, res, next) { try { res.json({ item: await service.transition(req.user.id, req.workspace.id, req.params.id, 'approved', req.body?.reason || '') }) } catch (error) { next(error) } }
async function reject(req, res, next) { try { res.json({ item: await service.transition(req.user.id, req.workspace.id, req.params.id, 'rejected', req.body?.reason || '') }) } catch (error) { next(error) } }
async function update(req, res, next) { try { res.json({ item: await service.updateFollowup(req.user.id, req.workspace.id, req.params.id, req.body || {}) }) } catch (error) { next(error) } }
async function send(req, res, next) { try { res.json(await service.send(req.user.id, req.workspace.id, req.params.id)) } catch (error) { next(error) } }
module.exports = { approve, list, reject, scan, send, update }
