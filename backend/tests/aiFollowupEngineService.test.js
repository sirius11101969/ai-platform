const assert = require('assert')
const pool = require('../src/db/pool')
const crmModel = require('../src/models/crmModel')
const { DEFAULT_FOLLOWUP_RULES } = require('../src/services/aiFollowupRulesService')
const service = require('../src/services/aiFollowupEngineService')

const workspaceId = '00000000-0000-4000-8000-000000000001'
const userId = '00000000-0000-4000-8000-000000000002'
const leadId = '00000000-0000-4000-8000-000000000003'
const jobId = '00000000-0000-4000-8000-000000000004'

function compact(sql) {
  return String(sql).replace(/\s+/g, ' ').trim()
}

function makeJob(overrides = {}) {
  return {
    id: jobId,
    workspace_id: workspaceId,
    lead_id: leadId,
    rule_type: 'no_reply_3d',
    status: 'suggested',
    suggested_channel: 'crm',
    generated_message: 'Follow up with this lead',
    scheduled_for: new Date(),
    approved_at: null,
    sent_at: null,
    reason: 'Inactive lead',
    urgency: 'medium',
    error: null,
    metadata: {},
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }
}

async function runScanTest() {
  const insertedJobs = []

  pool.query = async (sql, params = []) => {
    const query = compact(sql)

    if (query.startsWith('SELECT rule_type FROM ai_followup_rules WHERE workspace_id = $1')) {
      return { rows: DEFAULT_FOLLOWUP_RULES.map((rule) => ({ rule_type: rule.ruleType })), rowCount: DEFAULT_FOLLOWUP_RULES.length }
    }

    if (query.startsWith('INSERT INTO ai_followup_rules')) {
      return { rows: [], rowCount: 1 }
    }

    if (query.startsWith('SELECT rule_type, suggested_channel, config FROM ai_followup_rules')) {
      return {
        rows: DEFAULT_FOLLOWUP_RULES.map((rule) => ({
          rule_type: rule.ruleType,
          suggested_channel: rule.suggestedChannel,
          config: rule.ruleType === 'proposal_no_reply' ? { stage: ' Proposal ', thresholdHours: '48' } : rule.config,
        })),
        rowCount: DEFAULT_FOLLOWUP_RULES.length,
      }
    }

    if (query.startsWith('WITH activity AS (')) {
      return {
        rows: [{
          id: leadId,
          user_id: userId,
          workspace_id: workspaceId,
          name: 'Алексей Морозов',
          company: 'ACME',
          email: 'alexey@example.com',
          telegram_chat_id: null,
          stage: ' PROPOSAL ',
          status: 'proposal',
          followup_stage: ' PROPOSAL ',
          last_message_at: new Date(Date.now() - 96 * 60 * 60 * 1000),
          updated_at: new Date(),
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          last_activity_at: new Date(Date.now() - 96 * 60 * 60 * 1000),
          score: null,
          temperature: null,
        }],
        rowCount: 1,
      }
    }

    if (query.startsWith('SELECT role, message, created_at FROM telegram_messages') ||
        query.startsWith('SELECT subject, text_body, status, error, created_at, sent_at FROM email_messages') ||
        query.startsWith('SELECT body, created_at FROM crm_notes') ||
        query.startsWith('SELECT task_type, output_result, created_at FROM ai_agent_actions')) {
      return { rows: [], rowCount: 0 }
    }

    if (query.startsWith('SELECT id FROM ai_followup_jobs WHERE workspace_id = $1 AND lead_id = $2 AND rule_type = $3')) {
      return { rows: [], rowCount: 0 }
    }

    if (query.startsWith('SELECT MAX(outbound_at) AS last_outbound_at')) {
      return { rows: [{ last_outbound_at: null }], rowCount: 1 }
    }

    if (query.startsWith('SELECT column_name FROM information_schema.columns')) {
      return { rows: ['reason', 'urgency', 'metadata'].map((column_name) => ({ column_name })), rowCount: 3 }
    }

    if (query.startsWith('INSERT INTO ai_followup_jobs(')) {
      const [jobWorkspaceId, jobLeadId, ruleType, status, channel, message, scheduledHours, metadata, reason, urgency] = params
      const job = makeJob({
        id: `job-${insertedJobs.length + 1}`,
        workspace_id: jobWorkspaceId,
        lead_id: jobLeadId,
        rule_type: ruleType,
        status,
        suggested_channel: channel,
        generated_message: message,
        scheduled_for: new Date(Date.now() + scheduledHours * 60 * 60 * 1000),
        metadata,
        reason,
        urgency,
      })
      insertedJobs.push(job)
      return { rows: [job], rowCount: 1 }
    }

    if (query.startsWith('INSERT INTO lead_timeline_events(')) {
      return { rows: [{ id: 'timeline-1', workspace_id: params[0], lead_id: params[1], user_id: params[2], event_type: params[3], title: params[4], body: params[5], source: params[6], metadata: params[7], created_at: new Date() }], rowCount: 1 }
    }

    throw new Error(`Unexpected query in AI follow-up scan test: ${query}`)
  }

  const response = await service.scanWorkspace(userId, workspaceId)
  assert.strictEqual(response.scannedLeadsCount, 1)
  assert.strictEqual(response.matchedLeadsCount, 1)
  assert.strictEqual(response.activeRules, DEFAULT_FOLLOWUP_RULES.length)
  assert.ok(response.created >= 1, 'inactive proposal lead should create at least one follow-up job')
  assert.ok(response.debugSummary?.evaluationsCount >= DEFAULT_FOLLOWUP_RULES.length, 'scan response should include rule evaluation debug summary')
  const proposalEvaluation = response.debugSummary.evaluations.find((evaluation) => evaluation.ruleType === 'proposal_no_reply')
  assert.ok(proposalEvaluation?.stageMatches, 'proposal_no_reply should normalize stage before matching')
  assert.ok(proposalEvaluation?.inactivityMatches, 'proposal_no_reply should use last_message_at inactivity hours')
  assert.strictEqual(proposalEvaluation?.finalMatch, true, 'proposal_no_reply should match the production proposal inactivity case')
  assert.ok(insertedJobs.some((job) => job.rule_type === 'proposal_no_reply'), 'proposal_no_reply should create a job')
  assert.ok(insertedJobs.some((job) => job.rule_type === 'no_reply_3d'), 'no_reply_3d should create a job for a 5-day inactive open lead')
  assert.ok(insertedJobs.every((job) => job.status === 'suggested'), 'created jobs should be suggested')
  assert.ok(insertedJobs.every((job) => ['telegram', 'email', 'crm'].includes(job.suggested_channel)), 'created jobs should use a valid channel')
  assert.ok(insertedJobs.every((job) => job.generated_message && job.generated_message.trim()), 'created jobs should have generated messages')
  assert.ok(insertedJobs.every((job) => job.reason && job.urgency), 'created jobs should include reason and urgency when columns exist')
}

async function runTransitionTest() {
  let updateSql = ''
  let updateParams = []

  pool.query = async (sql, params = []) => {
    const query = compact(sql)
    if (query.startsWith('SELECT j.* FROM ai_followup_jobs')) return { rows: [makeJob()], rowCount: 1 }
    if (query.startsWith('UPDATE ai_followup_jobs SET status = $3::text')) {
      updateSql = query
      updateParams = params
      return { rows: [makeJob({ status: 'approved', approved_at: new Date(), metadata: { decisionReason: '' } })], rowCount: 1 }
    }
    if (query.startsWith('INSERT INTO lead_timeline_events(')) return { rows: [], rowCount: 1 }
    throw new Error(`Unexpected query in transition test: ${query}`)
  }

  const item = await service.transition(userId, workspaceId, jobId, 'approved', undefined)
  assert.strictEqual(item.status, 'approved')
  assert.ok(item.approvedAt, 'approve should update approved_at')
  assert.ok(updateSql.includes('$3::text'), 'status parameter should be explicitly cast')
  assert.ok(updateSql.includes('$4::text'), 'nullable decision reason parameter should be explicitly cast')
  assert.deepStrictEqual(updateParams, [workspaceId, jobId, 'approved', ''])
}

async function runSendSuccessTest() {
  const originalCreateNote = crmModel.createNote
  let sentUpdateSeen = false
  crmModel.createNote = async () => ({ id: 'note-1' })

  pool.query = async (sql, params = []) => {
    const query = compact(sql)
    if (query.startsWith('SELECT j.* FROM ai_followup_jobs')) return { rows: [makeJob({ status: 'approved' })], rowCount: 1 }
    if (query.startsWith('SELECT id, user_id, email FROM crm_leads')) return { rows: [{ id: leadId, user_id: userId, email: 'lead@example.com' }], rowCount: 1 }
    if (query.startsWith("UPDATE ai_followup_jobs SET status = 'sent'")) {
      sentUpdateSeen = true
      return { rows: [makeJob({ status: 'sent', sent_at: new Date() })], rowCount: 1 }
    }
    if (query.startsWith('INSERT INTO ai_followup_attempts(')) return { rows: [], rowCount: 1 }
    if (query.startsWith('INSERT INTO lead_timeline_events(')) return { rows: [], rowCount: 1 }
    throw new Error(`Unexpected query in send success test: ${query}`)
  }

  try {
    const response = await service.send(userId, workspaceId, jobId)
    assert.strictEqual(response.item.status, 'sent')
    assert.ok(response.item.sentAt, 'send should update sent_at')
    assert.ok(sentUpdateSeen, 'send should persist sent status')
  } finally {
    crmModel.createNote = originalCreateNote
  }
}

async function runSendFailureTest() {
  const originalCreateNote = crmModel.createNote
  crmModel.createNote = async () => { throw new Error('CRM reminder failed') }

  pool.query = async (sql, params = []) => {
    const query = compact(sql)
    if (query.startsWith('SELECT j.* FROM ai_followup_jobs')) return { rows: [makeJob({ status: 'approved' })], rowCount: 1 }
    if (query.startsWith('SELECT id, user_id, email FROM crm_leads')) return { rows: [{ id: leadId, user_id: userId, email: 'lead@example.com' }], rowCount: 1 }
    if (query.startsWith("UPDATE ai_followup_jobs SET status = 'failed'")) return { rows: [makeJob({ status: 'failed', error: params[2] })], rowCount: 1 }
    if (query.startsWith('INSERT INTO ai_followup_attempts(')) return { rows: [], rowCount: 1 }
    if (query.startsWith('INSERT INTO lead_timeline_events(')) return { rows: [], rowCount: 1 }
    throw new Error(`Unexpected query in send failure test: ${query}`)
  }

  try {
    const response = await service.send(userId, workspaceId, jobId)
    assert.strictEqual(response.item.status, 'failed')
    assert.strictEqual(response.error, 'CRM reminder failed')
  } finally {
    crmModel.createNote = originalCreateNote
  }
}


async function runSendRequiresApprovalTest() {
  pool.query = async (sql) => {
    const query = compact(sql)
    if (query.startsWith('SELECT j.* FROM ai_followup_jobs')) return { rows: [makeJob({ status: 'suggested' })], rowCount: 1 }
    throw new Error(`Unexpected query in send approval test: ${query}`)
  }

  await assert.rejects(
    () => service.send(userId, workspaceId, jobId),
    (error) => error.statusCode === 400 && error.message === 'Сначала одобрите follow-up'
  )
}

async function runSendEmailMissingAddressTest() {
  pool.query = async (sql, params = []) => {
    const query = compact(sql)
    if (query.startsWith('SELECT j.* FROM ai_followup_jobs')) return { rows: [makeJob({ status: 'approved', suggested_channel: 'email' })], rowCount: 1 }
    if (query.startsWith('SELECT id, user_id, email FROM crm_leads')) return { rows: [{ id: leadId, user_id: userId, email: '' }], rowCount: 1 }
    if (query.startsWith("UPDATE ai_followup_jobs SET status = 'failed'")) return { rows: [makeJob({ status: 'failed', error: params[2] })], rowCount: 1 }
    if (query.startsWith('INSERT INTO ai_followup_attempts(')) return { rows: [], rowCount: 1 }
    if (query.startsWith('INSERT INTO lead_timeline_events(')) return { rows: [], rowCount: 1 }
    throw new Error(`Unexpected query in send missing email test: ${query}`)
  }

  const response = await service.send(userId, workspaceId, jobId)
  assert.strictEqual(response.item.status, 'failed')
  assert.strictEqual(response.error, 'У лида нет email для отправки.')
}

async function main() {
  delete process.env.OPENAI_API_KEY
  const originalQuery = pool.query.bind(pool)

  try {
    await runScanTest()
    await runTransitionTest()
    await runSendRequiresApprovalTest()
    await runSendSuccessTest()
    await runSendFailureTest()
    await runSendEmailMissingAddressTest()
  } finally {
    pool.query = originalQuery
    await pool.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
