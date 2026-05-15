const express = require('express')
const { addNote, createLead, deleteLead, listLeads, stats, updateLead } = require('../controllers/crmController')
const { requireAuth } = require('../middleware/authMiddleware')

const router = express.Router()

router.use(requireAuth)
router.get('/leads', listLeads)
router.post('/leads', createLead)
router.patch('/leads/:id', updateLead)
router.delete('/leads/:id', deleteLead)
router.post('/leads/:id/notes', addNote)
router.get('/stats', stats)

module.exports = router
