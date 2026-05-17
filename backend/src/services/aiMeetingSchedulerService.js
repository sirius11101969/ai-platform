const { addTimelineEvent } = require('./timelineService')
const { findDuplicateQueueItem, logDuplicateSkipped, normalizeSourceMessageId } = require('./aiQueueDedupService')

const MEETING_ACTION_TYPE = 'meeting_schedule_proposal'
const DEFAULT_TIMEZONE = process.env.APP_TIMEZONE || 'Europe/Moscow'
const DURATION_MINUTES = 30
const RECOMMENDATION = 'Клиент согласился на demo-созвон. Рекомендуется назначить встречу и перевести сделку в Booked.'

const WEEKDAYS = {
  воскресенье: 0,
  понедельник: 1,
  вторник: 2,
  среда: 3,
  среду: 3,
  четверг: 4,
  пятница: 5,
  пятницу: 5,
  суббота: 6,
}

const DATE_PATTERNS = [
  { key: 'послезавтра', offset: 2, pattern: /(^|[^а-яёa-z])послезавтра(?=$|[^а-яёa-z])/i },
  { key: 'завтра', offset: 1, pattern: /(^|[^а-яёa-z])завтра(?=$|[^а-яёa-z])/i },
  { key: 'сегодня', offset: 0, pattern: /(^|[^а-яёa-z])сегодня(?=$|[^а-яёa-z])/i },
]

const INTENT_PATTERN = /(?:завтра|сегодня|послезавтра|\bв\s*\d{1,2}(?::\d{2})?(?:\s*(?:утра|дня|вечера|ночи))?\b|созвон|демо|demo|удобно|давайте|встреча|понедельник|вторник|сред[ау]|четверг|пятниц[ау]|суббота|воскресенье)/i
const TIME_PATTERN = /(?:^|[\s,.;!?])в\s*(\d{1,2})(?::(\d{2}))?(?:\s*(утра|дня|вечера|ночи))?(?=$|[\s,.;!?])/i

function getTimezone() {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: DEFAULT_TIMEZONE }).format(new Date())
    return DEFAULT_TIMEZONE
  } catch (_) {
    return 'UTC'
  }
}

function addDays(date, days) {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

function getZonedParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  return Object.fromEntries(formatter.formatToParts(date).filter((part) => part.type !== 'literal').map((part) => [part.type, Number(part.value)]))
}

function zonedTimeToUtc({ year, month, day, hour, minute }, timeZone) {
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0))
  const actual = getZonedParts(guess, timeZone)
  const desiredMs = Date.UTC(year, month - 1, day, hour, minute, 0)
  const actualMs = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, actual.second || 0)
  return new Date(guess.getTime() + (desiredMs - actualMs))
}

function parseDate(text, now = new Date(), timeZone = getTimezone()) {
  const normalized = String(text || '').toLowerCase()
  const today = getZonedParts(now, timeZone)
  const base = new Date(Date.UTC(today.year, today.month - 1, today.day, 12, 0, 0))

  for (const rule of DATE_PATTERNS) {
    if (rule.pattern.test(normalized)) {
      const target = addDays(base, rule.offset)
      return { detectedDateText: rule.key, year: target.getUTCFullYear(), month: target.getUTCMonth() + 1, day: target.getUTCDate() }
    }
  }

  for (const [label, weekday] of Object.entries(WEEKDAYS)) {
    const pattern = new RegExp(`(^|[^а-яёa-z])${label}(?=$|[^а-яёa-z])`, 'i')
    if (!pattern.test(normalized)) continue
    const currentWeekday = new Date(Date.UTC(today.year, today.month - 1, today.day)).getUTCDay()
    let offset = (weekday - currentWeekday + 7) % 7
    if (offset === 0) offset = 7
    const target = addDays(base, offset)
    return { detectedDateText: label, year: target.getUTCFullYear(), month: target.getUTCMonth() + 1, day: target.getUTCDate() }
  }

  return { detectedDateText: '', year: today.year, month: today.month, day: today.day }
}

function parseTime(text) {
  const match = String(text || '').match(TIME_PATTERN)
  if (!match) return { detectedTimeText: '', hour: null, minute: null }
  let hour = Number(match[1])
  const minute = match[2] !== undefined ? Number(match[2]) : 0
  const marker = match[3] || ''
  if ((marker === 'дня' || marker === 'вечера') && hour >= 1 && hour <= 11) hour += 12
  if (marker === 'ночи' && hour === 12) hour = 0
  if (hour > 23 || minute > 59) return { detectedTimeText: match[0].trim(), hour: null, minute: null }
  return { detectedTimeText: match[0].trim(), hour, minute }
}

function detectSchedulingIntent(text, { now = new Date(), timeZone = getTimezone() } = {}) {
  const normalized = String(text || '').trim()
  if (!normalized || !INTENT_PATTERN.test(normalized)) return null
  const date = parseDate(normalized, now, timeZone)
  const time = parseTime(normalized)
  const hasMeetingWord = /(созвон|демо|demo|встреча|давайте|удобно)/i.test(normalized)
  const proposedStartTime = time.hour === null ? null : zonedTimeToUtc({ ...date, hour: time.hour, minute: time.minute }, timeZone).toISOString()
  const confidence = Math.min(95, 62 + (date.detectedDateText ? 13 : 0) + (time.detectedTimeText ? 15 : 0) + (hasMeetingWord ? 5 : 0))
  return {
    detectedDateText: date.detectedDateText,
    detectedTimeText: time.detectedTimeText,
    proposedStartTime,
    durationMinutes: DURATION_MINUTES,
    confidence,
    timeZone,
  }
}

async function ensureMeetingSchedulerWorker(client, workspaceId) {
  await client.query(`SELECT pg_advisory_xact_lock(hashtext('ai_meeting_scheduler_worker'))`)

  const existing = await client.query(
    `SELECT id FROM ai_workers
      WHERE workspace_id = $1 AND type = 'ai_meeting_scheduler'
      ORDER BY created_at ASC, id ASC
      LIMIT 1`,
    [workspaceId]
  )
  if (existing.rows[0]) {
    await client.query('UPDATE ai_workers SET last_run_at = NOW(), updated_at = NOW() WHERE id = $1', [existing.rows[0].id])
    console.log('[meeting-scheduler] worker reused', { workerId: existing.rows[0].id })
    return existing.rows[0]
  }

  const created = await client.query(
    `INSERT INTO ai_workers(workspace_id, name, type, status, mode, description)
     VALUES($1, 'AI Meeting Scheduler', 'ai_meeting_scheduler', 'active', 'approval_required', 'Определяет намерение назначить demo-созвон и создаёт предложения встреч только для ручного approval.')
     ON CONFLICT DO NOTHING
     RETURNING id`,
    [workspaceId]
  )
  if (created.rows[0]) {
    await client.query('UPDATE ai_workers SET last_run_at = NOW(), updated_at = NOW() WHERE id = $1', [created.rows[0].id])
    console.log('[meeting-scheduler] worker created', { workerId: created.rows[0].id })
    return created.rows[0]
  }

  const reused = await client.query(
    `SELECT id FROM ai_workers
      WHERE workspace_id = $1 AND type = 'ai_meeting_scheduler'
      ORDER BY created_at ASC, id ASC
      LIMIT 1`,
    [workspaceId]
  )
  if (reused.rows[0]) {
    await client.query('UPDATE ai_workers SET last_run_at = NOW(), updated_at = NOW() WHERE id = $1', [reused.rows[0].id])
    console.log('[meeting-scheduler] worker reused', { workerId: reused.rows[0].id })
    return reused.rows[0]
  }

  throw new Error('AI Meeting Scheduler worker could not be created or reused')
}

async function createMeetingScheduleProposal(client, { userId, workspaceId, lead, messageText, channel, sourceMessageId }) {
  const detected = detectSchedulingIntent(messageText)
  if (!detected || !lead?.id) return null
  const sourceId = normalizeSourceMessageId(sourceMessageId)
  if (!sourceId) return null
  const duplicate = await findDuplicateQueueItem(client, { workspaceId, leadId: lead.id, actionType: MEETING_ACTION_TYPE, sourceMessageId: sourceId })
  if (duplicate) {
    logDuplicateSkipped({ workspaceId, leadId: lead.id, actionType: MEETING_ACTION_TYPE, sourceMessageId: sourceId, duplicateId: duplicate.id })
    return null
  }

  const worker = await ensureMeetingSchedulerWorker(client, workspaceId)
  const proposedTitle = `Demo-созвон — ${lead.name}`
  const payload = {
    leadId: lead.id,
    detectedDateText: detected.detectedDateText,
    detectedTimeText: detected.detectedTimeText,
    proposedTitle,
    proposedStartTime: detected.proposedStartTime,
    durationMinutes: DURATION_MINUTES,
    channel,
    sourceMessageId: sourceId,
    confidence: detected.confidence,
    inboundMessage: messageText,
    customerMessage: messageText,
    timeZone: detected.timeZone,
    calendar: { provider: null, externalEventId: null, connectLater: true },
  }
  if (channel === 'telegram') payload.telegramMessageId = sourceId
  if (channel === 'email') payload.emailMessageId = sourceId

  const created = await client.query(
    `INSERT INTO ai_worker_queue(worker_id, workspace_id, lead_id, action_type, status, title, recommendation, payload)
     VALUES($1, $2, $3, $4, 'pending_approval', $5, $6, $7)
     RETURNING id`,
    [worker.id, workspaceId, lead.id, MEETING_ACTION_TYPE, `Запланировать встречу — ${lead.name}`, RECOMMENDATION, payload]
  )
  await addTimelineEvent(client, { workspaceId, leadId: lead.id, userId, eventType: 'ai_meeting_schedule_proposed', title: 'AI предложил запланировать встречу', body: messageText, source: 'ai', metadata: { queueId: created.rows[0].id, actionType: MEETING_ACTION_TYPE, channel, sourceMessageId: sourceId, confidence: detected.confidence } })
  return { id: created.rows[0].id, payload }
}

module.exports = { MEETING_ACTION_TYPE, RECOMMENDATION, createMeetingScheduleProposal, detectSchedulingIntent }
