const assert = require('assert')
const { createMeetingScheduleProposal, detectSchedulingIntent } = require('../src/services/aiMeetingSchedulerService')
const { buildMeetingConfirmationDraftText } = require('../src/services/aiApprovalQueueService')

const detected = detectSchedulingIntent('Да, завтра в 15:00 удобно', {
  now: new Date('2026-05-17T09:00:00.000Z'),
  timeZone: 'Europe/Moscow',
})

assert.ok(detected, 'meeting intent should be detected')
assert.strictEqual(detected.detectedDateText, 'завтра')
assert.strictEqual(detected.detectedTimeText, 'в 15:00')
assert.strictEqual(detected.durationMinutes, 30)
assert.strictEqual(detected.timeZone, 'Europe/Moscow')
assert.ok(detected.confidence >= 90, 'confidence should be high for date + time + convenience phrase')
assert.strictEqual(detected.proposedStartTime, '2026-05-18T12:00:00.000Z')

const afternoon = detectSchedulingIntent('Давайте послезавтра в 3 дня', {
  now: new Date('2026-05-17T09:00:00.000Z'),
  timeZone: 'Europe/Moscow',
})
assert.strictEqual(afternoon.detectedTimeText, 'в 3 дня')
assert.strictEqual(afternoon.proposedStartTime, '2026-05-19T12:00:00.000Z')

assert.strictEqual(detectSchedulingIntent('Спасибо, получил материалы'), null)

assert.strictEqual(
  buildMeetingConfirmationDraftText({ payload: { proposedStartTime: detected.proposedStartTime, detectedDateText: 'завтра', detectedTimeText: 'в 15:00', timeZone: 'Europe/Moscow' } }),
  'Отлично, demo-созвон подтверждён на 18.05 в 15:00. До встречи!'
)

assert.strictEqual(
  buildMeetingConfirmationDraftText({ payload: { proposedStartTime: null, detectedDateText: 'завтра', detectedTimeText: '' } }),
  'Отлично, demo-созвон подтверждён. До встречи!'
)

async function testIdempotentMeetingSchedulerWorker() {
  let worker = null
  let workerInsertCount = 0
  const proposals = []

  const client = {
    async query(query, params = []) {
      if (query.includes('pg_advisory_xact_lock')) return { rows: [], rowCount: 0 }
      if (query.includes('SELECT id FROM ai_workers') && query.includes("type = 'ai_meeting_scheduler'")) {
        return { rows: worker ? [{ id: worker.id }] : [], rowCount: worker ? 1 : 0 }
      }
      if (query.startsWith('UPDATE ai_workers SET last_run_at')) return { rows: [], rowCount: 1 }
      if (query.startsWith('INSERT INTO ai_workers(')) {
        workerInsertCount += 1
        if (worker) return { rows: [], rowCount: 0 }
        worker = { id: 'meeting-worker-1', workspace_id: params[0], type: 'ai_meeting_scheduler' }
        return { rows: [{ id: worker.id }], rowCount: 1 }
      }
      if (query.includes('SELECT id, status') && query.includes('FROM ai_worker_queue')) return { rows: proposals.some((proposal) => proposal.payload.sourceMessageId === params[4]) ? [{ id: 'duplicate', status: 'pending_approval' }] : [], rowCount: 0 }
      if (query.startsWith('INSERT INTO ai_worker_queue(')) {
        const proposal = {
          id: `proposal-${proposals.length + 1}`,
          workerId: params[0],
          workspaceId: params[1],
          leadId: params[2],
          actionType: params[3],
          status: 'pending_approval',
          payload: params[6],
        }
        proposals.push(proposal)
        return { rows: [{ id: proposal.id }], rowCount: 1 }
      }
      if (query.startsWith('INSERT INTO lead_timeline_events(')) return { rows: [{ id: `timeline-${proposals.length}` }], rowCount: 1 }
      throw new Error(`Unexpected query: ${query}`)
    },
  }

  for (let index = 1; index <= 5; index += 1) {
    const result = await createMeetingScheduleProposal(client, {
      userId: 'user-1',
      workspaceId: 'workspace-1',
      lead: { id: 'lead-1', name: 'Demo Lead' },
      messageText: 'Да, завтра в 15:00 удобно для demo',
      channel: 'telegram',
      sourceMessageId: `telegram-${index}`,
    })
    assert.ok(result, `proposal ${index} should be created`)
  }

  const duplicate = await createMeetingScheduleProposal(client, {
    userId: 'user-1',
    workspaceId: 'workspace-1',
    lead: { id: 'lead-1', name: 'Demo Lead' },
    messageText: 'Да, завтра в 15:00 удобно для demo',
    channel: 'telegram',
    sourceMessageId: 'telegram-1',
  })
  assert.strictEqual(duplicate, null, 'duplicate source message should not create another proposal')


  assert.strictEqual(workerInsertCount, 1, 'meeting scheduler worker should be inserted once')
  assert.strictEqual(worker.id, 'meeting-worker-1')
  assert.strictEqual(proposals.length, 5, 'five inbound scheduling messages should create five proposals')
  assert.ok(proposals.every((proposal) => proposal.workerId === 'meeting-worker-1'))
  assert.ok(proposals.every((proposal) => proposal.actionType === 'meeting_schedule_proposal'))
  assert.ok(proposals.every((proposal) => proposal.status === 'pending_approval'))
}

testIdempotentMeetingSchedulerWorker()
  .then(() => console.log('ai meeting scheduler tests passed'))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
