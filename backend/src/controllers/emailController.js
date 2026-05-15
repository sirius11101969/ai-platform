const { EMAIL_TEMPLATES } = require('../services/emailTemplates')
const emailService = require('../services/emailService')

async function uploadAttachment(req, res, next) {
  try {
    const attachment = await emailService.saveAttachment(req.user.id, req.workspace.id, req.body)
    res.status(201).json({ attachment })
  } catch (error) { next(error) }
}

async function listAttachments(req, res, next) {
  try {
    const attachments = await emailService.listAttachments(req.user.id, req.workspace.id, req.query.leadId)
    res.json({ attachments })
  } catch (error) { next(error) }
}

async function listTemplates(_req, res) {
  res.json({ templates: Object.values(EMAIL_TEMPLATES) })
}

async function previewEmail(req, res, next) {
  try {
    const lead = req.body.lead || {}
    const rendered = emailService.renderTemplate(req.body.template || 'follow_up', lead, req.body)
    res.json({ email: rendered })
  } catch (error) { next(error) }
}

async function sendEmail(req, res, next) {
  try {
    const email = await emailService.enqueueEmail(req.user.id, { ...req.body, leadId: req.params.id, workspaceId: req.workspace.id })
    res.status(202).json({ email })
  } catch (error) { next(error) }
}

async function listLeadEmails(req, res, next) {
  try {
    const emails = await emailService.listLeadEmails(req.user.id, req.workspace.id, req.params.id)
    res.json({ emails })
  } catch (error) { next(error) }
}

async function markOpened(req, res, next) {
  try {
    await emailService.markOpened(req.params.token)
    const pixel = Buffer.from('R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64')
    res.set('Content-Type', 'image/gif')
    res.set('Cache-Control', 'no-store, max-age=0')
    res.send(pixel)
  } catch (error) { next(error) }
}

async function processQueue(_req, res, next) {
  try {
    const result = await emailService.processEmailQueue()
    res.json(result)
  } catch (error) { next(error) }
}

module.exports = { listAttachments, listLeadEmails, listTemplates, markOpened, previewEmail, processQueue, sendEmail, uploadAttachment }
