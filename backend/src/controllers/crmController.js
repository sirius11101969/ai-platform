const crmModel = require('../models/crmModel')

async function listLeads(req, res, next) {
  try {
    const leads = await crmModel.listLeads(req.user.id)
    res.json({ leads })
  } catch (error) {
    next(error)
  }
}

async function createLead(req, res, next) {
  try {
    const lead = await crmModel.createLead(req.user.id, req.body)
    res.status(201).json({ lead })
  } catch (error) {
    next(error)
  }
}

async function updateLead(req, res, next) {
  try {
    const lead = await crmModel.updateLead(req.user.id, req.params.id, req.body)
    res.json({ lead })
  } catch (error) {
    next(error)
  }
}

async function deleteLead(req, res, next) {
  try {
    await crmModel.deleteLead(req.user.id, req.params.id)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

async function addNote(req, res, next) {
  try {
    const note = await crmModel.createNote(req.user.id, req.params.id, req.body.body)
    res.status(201).json({ note })
  } catch (error) {
    next(error)
  }
}


async function createFollowUp(req, res, next) {
  try {
    const followUp = await crmModel.createFollowUp(req.user.id, req.params.id)
    res.status(201).json({ followUp })
  } catch (error) {
    next(error)
  }
}

async function activity(req, res, next) {
  try {
    const events = await crmModel.listActivity(req.user.id)
    res.json({ events })
  } catch (error) {
    next(error)
  }
}

async function stats(req, res, next) {
  try {
    const data = await crmModel.getStats(req.user.id)
    res.json({ stats: data })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  activity,
  addNote,
  createFollowUp,
  createLead,
  deleteLead,
  listLeads,
  stats,
  updateLead,
}
