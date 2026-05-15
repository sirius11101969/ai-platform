const express = require('express')
const { approveAction, cancelAction, createLeadAction, listLeadActionCenter, listMaterials, sendAction, sendLeadAttachments, updateAction } = require('../controllers/aiExecutionController')
const { requireAuth } = require('../middleware/authMiddleware')
const { requireWorkspace } = require('../middleware/workspaceMiddleware')

const router = express.Router()
router.use(requireAuth)
router.use(requireWorkspace)
router.get('/materials', listMaterials)
router.post('/leads/:id/attachments/send', sendLeadAttachments)
router.get('/crm/leads/:id/action-center', listLeadActionCenter)
router.post('/crm/leads/:id/actions', createLeadAction)
router.patch('/crm/actions/:actionId', updateAction)
router.post('/crm/actions/:actionId/approve', approveAction)
router.post('/crm/actions/:actionId/cancel', cancelAction)
router.post('/crm/actions/:actionId/send', sendAction)

module.exports = router
