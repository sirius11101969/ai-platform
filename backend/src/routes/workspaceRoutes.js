const express = require('express')
const { addMember, createWorkspace, currentWorkspace, listWorkspaces, updateWorkspace } = require('../controllers/workspaceController')
const { requireAuth } = require('../middleware/authMiddleware')

const router = express.Router()

router.use(requireAuth)
router.get('/', listWorkspaces)
router.post('/', createWorkspace)
router.get('/current', currentWorkspace)
router.post('/:id/members', addMember)
router.patch('/:id', updateWorkspace)

module.exports = router
