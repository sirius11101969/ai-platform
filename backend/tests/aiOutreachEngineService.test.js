const assert = require('assert')
const service = require('../src/services/aiOutreachEngineService')

const workspaceId = 'workspace-1'
const userId = 'user-1'
const lead = {
  id: 'lead-1',
  name: 'Иван Петров',
  company: 'Ромашка',
  email: 'ivan@romashka.ru',
  telegram: '@ivan',
  source: 'landing',
  notes: 'Нужна AI CRM для команды продаж и Telegram follow-up',
  metadata: { message: 'Нужна AI CRM для команды продаж и Telegram follow-up' },
}

function compact(sql) {
  return String(sql).replace(/\s+/g, ' ').trim()
}

function makeClient({ duplicate = false } = {}) {
  const inserts = { queue: [], jobs: [], activity: [], timeline: [] }
  let queueId = 0
  let jobId = 0
  return {
    inserts,
    async query(sql, params = []) {
      const query = compact(sql)
      if (query.startsWith('INSERT INTO ai_workers(')) return { rows: [{ id: 'worker-1' }], rowCount: 1 }
      if (query.startsWith('SELECT id FROM ai_worker_queue')) return { rows: duplicate ? [{ id: 'existing-queue' }] : [], rowCount: duplicate ? 1 : 0 }
      if (query.startsWith('SELECT id FROM ai_followup_jobs')) return { rows: duplicate ? [{ id: 'existing-job' }] : [], rowCount: duplicate ? 1 : 0 }
      if (query.startsWith('INSERT INTO ai_worker_queue(')) {
        const row = { id: `queue-${++queueId}`, worker_id: params[0], workspace_id: params[1], lead_id: params[2], action_type: params[3], status: 'pending_approval', title: params[4], recommendation: params[5], payload: params[6] }
        inserts.queue.push(row)
        return { rows: [row], rowCount: 1 }
      }
      if (query.startsWith('INSERT INTO ai_followup_jobs(')) {
        const row = { id: `job-${++jobId}`, workspace_id: params[0], lead_id: params[1], rule_type: params[2], status: 'suggested', suggested_channel: params[3], generated_message: params[4], scheduled_for: params[5], reason: params[6], urgency: params[7], metadata: params[8] }
        inserts.jobs.push(row)
        return { rows: [row], rowCount: 1 }
      }
      if (query.startsWith('INSERT INTO crm_activity(')) {
        inserts.activity.push({ params })
        return { rows: [], rowCount: 1 }
      }
      if (query.startsWith('INSERT INTO lead_timeline_events(')) {
        inserts.timeline.push({ params })
        return { rows: [{ id: 'timeline-1' }], rowCount: 1 }
      }
      throw new Error(`Unexpected query: ${query}`)
    },
  }
}

async function runHotLeadTest() {
  const client = makeClient()
  const result = await service.generateOutreachForLead(client, { workspaceId, userId, lead, intelligence: { score: 82, temperature: 'hot', recommendedChannel: 'telegram', intentSummary: 'AI CRM для отдела продаж' } })

  assert.deepStrictEqual(result.outreachTypes, service.OUTREACH_TYPES)
  assert.strictEqual(client.inserts.queue.length, service.OUTREACH_TYPES.length * 2, 'hot lead should create telegram and email draft for every outreach type')
  assert.strictEqual(client.inserts.jobs.length, service.OUTREACH_TYPES.length, 'hot lead should create suggested follow-up jobs')
  assert.ok(client.inserts.queue.every((item) => item.status === 'pending_approval'))
  assert.ok(client.inserts.queue.some((item) => item.action_type === 'telegram_draft' && /Иван, добрый день/.test(item.payload.text)))
  assert.ok(client.inserts.queue.some((item) => item.action_type === 'email_draft' && item.payload.subject && item.payload.cta))
  const customerCopy = client.inserts.queue.map((item) => `${item.payload.subject || ''} ${item.payload.text || ''}`).join('\n')
  assert.ok(/автоматизац|follow-up|CRM/i.test(customerCopy), 'drafts should translate tags into business language')
  assert.ok(!/Лид проявил интерес к темам|intent summary|temperature|score|qualification|AI detected/i.test(customerCopy), 'customer-facing copy must not expose internal AI wording')
  const telegramDrafts = client.inserts.queue.filter((item) => item.action_type === 'telegram_draft')
  assert.ok(telegramDrafts.every((item) => item.payload.text.split('\n').length >= 2 && item.payload.text.split('\n').length <= 5), 'telegram drafts should be 2-5 short lines')
  assert.ok(client.inserts.jobs.every((job) => job.status === 'suggested' && job.generated_message))
}

async function runSanitizedIntentTest() {
  const rawLead = { ...lead, notes: 'Лид проявил интерес к темам: crm, ai..', metadata: { message: 'intent summary: crm, ai, followup; temperature hot; score 92; qualification good; AI detected' } }
  const telegram = service.buildTelegramDraft('followup_24h', rawLead, { intentSummary: 'Лид проявил интерес к темам: crm, ai..', score: 92, temperature: 'hot' })
  const email = service.buildEmailDraft('demo_offer', rawLead, { aiSummary: 'intent summary crm ai followup temperature score qualification AI detected' })
  const combined = `${telegram.text}\n${email.subject}\n${email.body}`
  assert.ok(/автоматизац|CRM|follow-up/i.test(combined))
  assert.ok(!/Лид проявил интерес к темам|intent summary|temperature|score|qualification|AI detected|crm, ai\.\./i.test(combined))
}


async function runChannelAwareRecommendationAndGreetingTest() {
  const testLead = {
    ...lead,
    id: 'lead-copy-quality',
    name: 'Copy Quality Test Lead',
    company: 'Copy Quality Co',
    email: 'quality@example.com',
    telegram: '@copy_quality',
  }
  const client = makeClient()
  await service.generateOutreachForLead(client, { workspaceId, userId, lead: testLead, intelligence: { score: 91, temperature: 'hot', recommendedChannel: 'telegram', intentSummary: 'Нужно демо AI CRM и план внедрения' } })

  const queueCopy = client.inserts.queue.map((item) => `${item.recommendation}\n${item.payload.text || ''}`).join('\n')
  assert.ok(!/Copy, добрый день/.test(queueCopy), 'label-like English test lead names must not be used as personal greetings')
  assert.ok(client.inserts.queue.every((item) => !/Copy, добрый день/.test(item.payload.text || '')))
  assert.ok(client.inserts.queue.some((item) => item.action_type === 'telegram_draft' && /^Здравствуйте!/m.test(item.payload.text)))

  const emailDrafts = client.inserts.queue.filter((item) => item.action_type === 'email_draft')
  const telegramDrafts = client.inserts.queue.filter((item) => item.action_type === 'telegram_draft')
  assert.ok(emailDrafts.some((item) => /^Подготовить email-сообщение/.test(item.recommendation)), 'email first/follow-up drafts should use email wording')
  assert.ok(emailDrafts.every((item) => !/короткое сообщение в Telegram/i.test(item.recommendation)), 'email draft recommendations must not ask for a Telegram message')
  assert.ok(telegramDrafts.some((item) => /^Подготовить короткое сообщение в Telegram/.test(item.recommendation)), 'telegram drafts can use Telegram wording')
  assert.ok(emailDrafts.some((item) => item.payload.outreachType === 'demo_offer' && /^Предложить демо/.test(item.recommendation)))
  assert.ok(client.inserts.timeline.every((item) => !/Copy, добрый день/.test(item.params[5] || '')), 'timeline body must use the safe greeting too')
}

function runCompanyOnlyGreetingTest() {
  const companyLead = { ...lead, name: '', company: 'Ромашка' }
  const telegram = service.buildTelegramDraft('first_contact', companyLead, { intentSummary: 'интерес к CRM', recommendedChannel: 'telegram' })
  const email = service.buildEmailDraft('first_contact', companyLead, { intentSummary: 'интерес к CRM', recommendedChannel: 'email' })
  assert.ok(/^Здравствуйте!\nВидим ваш запрос от компании Ромашка/.test(telegram.text))
  assert.ok(/^Здравствуйте! Видим ваш запрос от компании Ромашка/.test(email.body))
}

async function runWarmLeadTest() {
  const client = makeClient()
  const result = await service.generateOutreachForLead(client, { workspaceId, userId, lead, intelligence: { score: 55, temperature: 'warm', recommendedChannel: 'email', aiSummary: 'интерес к CRM' } })
  assert.deepStrictEqual(result.outreachTypes, ['first_contact'])
  assert.strictEqual(client.inserts.queue.length, 2, 'warm lead should only create first_contact telegram/email drafts')
  assert.strictEqual(client.inserts.jobs.length, 1)
}

async function runColdLeadTest() {
  const client = makeClient()
  const result = await service.generateOutreachForLead(client, { workspaceId, userId, lead, intelligence: { score: 25, temperature: 'cold', recommendedChannel: 'crm_task' } })
  assert.deepStrictEqual(result.outreachTypes, [])
  assert.strictEqual(client.inserts.queue.length, 0, 'cold lead should not create send drafts')
  assert.strictEqual(client.inserts.jobs.length, 1, 'cold lead should create recommendation-only follow-up job')
  assert.strictEqual(client.inserts.jobs[0].suggested_channel, 'crm')
}

async function runDuplicateTest() {
  const client = makeClient({ duplicate: true })
  const result = await service.generateOutreachForLead(client, { workspaceId, userId, lead, intelligence: { score: 90, temperature: 'hot', recommendedChannel: 'telegram' } })
  assert.strictEqual(client.inserts.queue.length, 0)
  assert.strictEqual(client.inserts.jobs.length, 0)
  assert.ok(result.skipped.length >= service.OUTREACH_TYPES.length * 3, 'duplicates should be reported as skipped')
}

async function main() {
  await runHotLeadTest()
  await runSanitizedIntentTest()
  await runChannelAwareRecommendationAndGreetingTest()
  runCompanyOnlyGreetingTest()
  await runWarmLeadTest()
  await runColdLeadTest()
  await runDuplicateTest()
  console.log('aiOutreachEngineService tests passed')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
