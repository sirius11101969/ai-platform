const express = require('express')
const { listAttachments, listTemplates, previewEmail, processQueue, uploadAttachment } = require('../controllers/emailController')
const { requireAuth } = require('../middleware/authMiddleware')

const router = express.Router()

router.use(requireAuth)
router.get('/templates', listTemplates)
router.post('/preview', previewEmail)
router.post('/attachments', uploadAttachment)
router.get('/attachments', listAttachments)
router.post('/queue/process', processQueue)

module.exports = router
