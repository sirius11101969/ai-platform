const workspaceModel = require('../models/workspaceModel')
const { PLAN_LIMITS } = require('../plans')

async function listWorkspaces(req, res, next) {
  try {
    const workspaces = await workspaceModel.listWorkspaces(req.user.id)
    res.json({ workspaces, plans: PLAN_LIMITS })
  } catch (error) {
    next(error)
  }
}

async function createWorkspace(req, res, next) {
  try {
    const workspace = await workspaceModel.createWorkspace(req.user.id, req.body)
    res.status(201).json({ workspace, plans: PLAN_LIMITS })
  } catch (error) {
    next(error)
  }
}

async function currentWorkspace(req, res, next) {
  try {
    const workspaceId = req.get('x-workspace-id') || req.query.workspaceId || req.workspace?.id || null
    const workspace = await workspaceModel.getCurrentWorkspace(req.user.id, workspaceId)
    res.json({ workspace, plans: PLAN_LIMITS })
  } catch (error) {
    next(error)
  }
}

async function addMember(req, res, next) {
  try {
    const member = await workspaceModel.addMember(req.user.id, req.params.id, req.body)
    res.status(201).json({ member })
  } catch (error) {
    next(error)
  }
}

async function updateWorkspace(req, res, next) {
  try {
    const workspace = await workspaceModel.updateWorkspace(req.user.id, req.params.id, req.body)
    res.json({ workspace, plans: PLAN_LIMITS })
  } catch (error) {
    next(error)
  }
}

module.exports = { addMember, createWorkspace, currentWorkspace, listWorkspaces, updateWorkspace }
