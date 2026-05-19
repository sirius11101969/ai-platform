const express = require('express')
const cors = require('cors')
const axios = require('axios')
const pool = require('./db/pool')
const { migrate } = require('./db/schema')
const authRoutes = require('./routes/authRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const crmRoutes = require('./routes/crmRoutes')
const aiTaskRoutes = require('./routes/aiTaskRoutes')
const aiAgentRoutes = require('./routes/aiAgentRoutes')
const telegramRoutes = require('./routes/telegramRoutes')
const emailRoutes = require('./routes/emailRoutes')
const workspaceRoutes = require('./routes/workspaceRoutes')
const aiExecutionRoutes = require('./routes/aiExecutionRoutes')
const aiExecutionRunnerRoutes = require('./routes/aiExecutionRunnerRoutes')
const aiWorkerRoutes = require('./routes/aiWorkerRoutes')
const { runWorkerByType } = require('./controllers/aiWorkerController')
const aiApprovalQueueRoutes = require('./routes/aiApprovalQueueRoutes')
const aiFollowupRoutes = require('./routes/aiFollowupRoutes')
const aiPriorityInboxRoutes = require('./routes/aiPriorityInboxRoutes')
const aiPipelineCopilotRoutes = require('./routes/aiPipelineCopilotRoutes')
const aiManagerDashboardRoutes = require('./routes/aiManagerDashboardRoutes')
const approvalCenterRoutes = require('./routes/approvalCenterRoutes')
const aiSequenceRoutes = require('./routes/aiSequenceRoutes')
const aiRevenueIntelligenceRoutes = require('./routes/aiRevenueIntelligenceRoutes')
const aiVoiceOutreachRoutes = require('./routes/aiVoiceOutreachRoutes')
const realtimeVoiceRoutes = require('./routes/realtimeVoiceRoutes')
const realtimeTransportRoutes = require('./routes/realtimeTransportRoutes')
const openaiRealtimeRoutes = require('./routes/openaiRealtimeRoutes')
const liveRealtimeRoutes = require('./routes/liveRealtimeRoutes')
const demoRoutes = require('./routes/demoRoutes')
const publicRoutes = require('./routes/publicRoutes')
const { markOpened } = require('./controllers/emailController')
const { startEmailQueueWorker } = require('./services/emailService')
const { startLeadAnalysisWorker } = require('./services/leadAnalysisWorker')
const { startLeadQualificationWorker } = require('./services/leadQualificationService')
const { ensureDefaultRulesForAllWorkspaces } = require('./services/aiFollowupRulesService')
const { requireAuth } = require('./middleware/authMiddleware')
const { requireWorkspace } = require('./middleware/workspaceMiddleware')
const { errorHandler } = require('./middleware/errorHandler')
const { aiCopySanitizerResponseMiddleware } = require('./middleware/aiCopySanitizerMiddleware')
const { startAutonomousExecutionLoop } = require('./services/execution/autonomousExecutionLoop')

const app = express()
const port = Number(process.env.PORT || 3001)

app.use(cors({ origin: process.env.CORS_ORIGIN || true }))
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '25mb' }))

const healthHandler = (_, res) => {
  res.json({ status: 'OK' })
}

app.get('/health', healthHandler)
app.get('/api/health', healthHandler)

app.use('/api', aiCopySanitizerResponseMiddleware)

app.use('/api/public', publicRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/workspaces', workspaceRoutes)
app.use('/api/crm', crmRoutes)
app.use('/api/ai/execution', aiExecutionRunnerRoutes)
// Must stay before the global /api/ai sequence middleware chain so SSE stream auth can run in isolation.
app.use('/api/ai', liveRealtimeRoutes)
app.use('/api/ai', approvalCenterRoutes)
app.use('/api/ai', aiSequenceRoutes)
app.use('/api/ai', aiRevenueIntelligenceRoutes)
app.use('/api/ai', aiVoiceOutreachRoutes)
app.use('/api/ai', realtimeVoiceRoutes)
app.use('/api/ai', realtimeTransportRoutes)
app.use('/api/ai', openaiRealtimeRoutes)
app.use('/api/ai', aiTaskRoutes)
app.use('/api/ai/agents', aiAgentRoutes)
app.use('/api/ai', aiWorkerRoutes)
app.post('/api/ai-workers/run/:type', requireAuth, requireWorkspace, runWorkerByType)
app.get('/api/ai-workers/focus-summary', requireAuth, requireWorkspace, require('./controllers/aiApprovalQueueController').focusSummary)
app.use('/api/ai/approval-queue', aiApprovalQueueRoutes)
app.use('/api/ai', aiFollowupRoutes)
app.use('/api/ai', aiPriorityInboxRoutes)
app.use('/api/ai', aiPipelineCopilotRoutes)
app.use('/api/ai', aiManagerDashboardRoutes)
app.use('/api/demo', demoRoutes)
app.get('/api/email/open/:token', markOpened)
app.use('/api/email', emailRoutes)
app.use('/api/telegram', telegramRoutes)
app.use('/api/integrations/telegram', telegramRoutes)
app.use('/api', aiExecutionRoutes)

app.post('/api/lead', requireAuth, requireWorkspace, async (req, res, next) => {
  try {
    const { name, contact, source, metadata } = req.body

    if (!name || !contact) {
      return res.status(400).json({ error: 'Name and contact are required' })
    }

    const result = await pool.query(
      `INSERT INTO crm_leads(user_id, workspace_id, name, contact, source, metadata)
       VALUES($1, $6, $2, $3, $4, $5)
       RETURNING id, name, contact, stage, source, metadata, created_at`,
      [req.user.id, name, contact, source || 'website', metadata || {}, req.workspace.id]
    )

    if (process.env.BITRIX_WEBHOOK) {
      await axios.post(`${process.env.BITRIX_WEBHOOK}/crm.lead.add.json`, {
        fields: {
          TITLE: `Новый лид ${name}`,
          NAME: name,
          PHONE: [{ VALUE: contact, VALUE_TYPE: 'WORK' }]
        }
      })
    }

    res.status(201).json({ success: true, lead: result.rows[0] })
  } catch (error) {
    next(error)
  }
})

app.post('/api/subscribe', requireAuth, async (req, res, next) => {
  try {
    const { plan } = req.body

    if (!plan) {
      return res.status(400).json({ error: 'Plan is required' })
    }

    const paymentUrl = `https://yookassa.ru/pay/${req.user.id}-${plan}`

    const result = await pool.query(
      `INSERT INTO subscriptions(user_id, plan, payment_url)
       VALUES($1, $2, $3)
       RETURNING id, plan, status, payment_url, created_at`,
      [req.user.id, plan, paymentUrl]
    )

    res.status(201).json({ success: true, subscription: result.rows[0], paymentUrl })
  } catch (error) {
    next(error)
  }
})

app.use(errorHandler)

async function start() {
  if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is required in production')
    }
    process.env.JWT_SECRET = 'development-only-change-me'
    console.warn('JWT_SECRET is not set; using development fallback secret')
  }

  if (process.env.RUN_MIGRATIONS !== 'false') {
    await migrate()
  }

  const followupRuleSeed = await ensureDefaultRulesForAllWorkspaces()
  if (followupRuleSeed.seeded) {
    console.log(`Seeded ${followupRuleSeed.seeded} default AI follow-up rules across ${followupRuleSeed.workspaces} workspaces`)
  }

  startEmailQueueWorker()
  startLeadAnalysisWorker()
  startLeadQualificationWorker()

  const server = app.listen(port, () => {
    console.log(`Backend started on port ${port}`)
  })

  startAutonomousExecutionLoop().catch((error) => {
    console.warn('[autonomous-execution-loop] startup failed', { error: error.message })
  })

  return server
}

if (require.main === module) {
  start().catch((error) => {
    console.error('Failed to start backend', error)
    process.exit(1)
  })
}

module.exports = { app, start }
