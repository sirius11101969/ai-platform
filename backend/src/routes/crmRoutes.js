const express = require('express')
const { activity, addNote, createFollowUp, createLead, deleteLead, generateLeadEmail, listLeadEmails, listLeads, listStages, listTelegramMessages, sendLeadEmail, sendTelegramReply, stats, updateLead, updateStage } = require('../controllers/crmController')
const { requireAuth } = require('../middleware/authMiddleware')

const router = express.Router()

router.use(requireAuth)
router.get('/activity', activity)
router.get('/stages', listStages)
router.patch('/stages/:status', updateStage)
router.get('/leads', listLeads)
router.post('/leads', createLead)
router.patch('/leads/:id', updateLead)
router.delete('/leads/:id', deleteLead)
router.post('/leads/:id/notes', addNote)
router.post('/leads/:id/followups', createFollowUp)
router.get('/leads/:id/emails', listLeadEmails)
router.post('/leads/:id/emails/generate', generateLeadEmail)
router.post('/leads/:id/emails', sendLeadEmail)
router.get('/leads/:id/telegram-messages', listTelegramMessages)
router.post('/leads/:id/telegram-messages', sendTelegramReply)
router.get('/stats', stats)

module.exports = router
