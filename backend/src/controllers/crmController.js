const crmModel = require('../models/crmModel')
const { sendTelegramMessageToLead } = require('../services/telegramService')
const emailService = require('../services/emailService')


async function listStages(req, res, next) {
  try {
    const stages = await crmModel.listStages(req.user.id, req.workspace.id)
    res.json({ stages })
  } catch (error) {
    next(error)
  }
}

async function updateStage(req, res, next) {
  try {
    const stage = await crmModel.updateStage(req.user.id, req.workspace.id, req.params.status, req.body)
    res.json({ stage })
  } catch (error) {
    next(error)
  }
}

async function listLeads(req, res, next) {
  try {
    const leads = await crmModel.listLeads(req.user.id, req.workspace.id)
    res.json({ leads })
  } catch (error) {
    next(error)
  }
}

async function createLead(req, res, next) {
  try {
    const lead = await crmModel.createLead(req.user.id, req.workspace.id, req.body)
    res.status(201).json({ lead })
  } catch (error) {
    next(error)
  }
}

async function updateLead(req, res, next) {
  try {
    const lead = await crmModel.updateLead(req.user.id, req.workspace.id, req.params.id, req.body)
    res.json({ lead })
  } catch (error) {
    next(error)
  }
}

async function deleteLead(req, res, next) {
  try {
    await crmModel.deleteLead(req.user.id, req.workspace.id, req.params.id)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

async function addNote(req, res, next) {
  try {
    const note = await crmModel.createNote(req.user.id, req.workspace.id, req.params.id, req.body.body)
    res.status(201).json({ note })
  } catch (error) {
    next(error)
  }
}




async function listLeadEmails(req, res, next) {
  try {
    const emails = await emailService.listLeadEmails(req.user.id, req.workspace.id, req.params.id)
    res.json({ emails })
  } catch (error) {
    next(error)
  }
}

async function generateLeadEmail(req, res, next) {
  try {
    const lead = (await crmModel.listLeads(req.user.id, req.workspace.id)).find((item) => item.id === req.params.id)
    if (!lead) return res.status(404).json({ error: 'Lead not found' })
    const email = emailService.renderTemplate(req.body.template || 'follow_up', lead, req.body)
    res.json({ email })
  } catch (error) {
    next(error)
  }
}

async function sendLeadEmail(req, res, next) {
  try {
    const email = await emailService.enqueueEmail(req.user.id, { ...req.body, leadId: req.params.id, workspaceId: req.workspace.id })
    res.status(202).json({ email })
  } catch (error) {
    next(error)
  }
}

async function listTelegramMessages(req, res, next) {
  try {
    const messages = await crmModel.listTelegramMessages(req.user.id, req.workspace.id, req.params.id)
    res.json({ messages })
  } catch (error) {
    next(error)
  }
}

async function sendTelegramReply(req, res, next) {
  try {
    const result = await sendTelegramMessageToLead({ userId: req.user.id, workspaceId: req.workspace.id, leadId: req.params.id, text: req.body.message })
    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}

async function createFollowUp(req, res, next) {
  try {
    const result = await crmModel.createFollowUp(req.user.id, req.workspace.id, req.params.id)
    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}

async function activity(req, res, next) {
  try {
    const events = await crmModel.listActivity(req.user.id, req.workspace.id)
    res.json({ events })
  } catch (error) {
    next(error)
  }
}

async function stats(req, res, next) {
  try {
    const data = await crmModel.getStats(req.user.id, req.workspace.id)
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
  generateLeadEmail,
  listLeadEmails,
  listLeads,
  listTelegramMessages,
  listStages,
  stats,
  sendLeadEmail,
  sendTelegramReply,
  updateLead,
  updateStage,
}
