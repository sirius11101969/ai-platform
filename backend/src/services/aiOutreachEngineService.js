const { addTimelineEvent } = require('./timelineService')

const OUTREACH_TYPES = ['first_contact', 'followup_24h', 'followup_3d', 'meeting_request', 'demo_offer']
const QUEUE_ACTIONS = ['telegram_draft', 'email_draft']

function clean(value, fallback = '') {
  const normalized = String(value || '').trim()
  return normalized || fallback
}

function firstName(name) {
  return clean(name, 'Коллеги').split(/\s+/)[0]
}

function normalizeChannel(channel, lead = {}) {
  const value = String(channel || '').toLowerCase()
  if (value === 'telegram' || lead.telegram || lead.telegram_chat_id || lead.telegramChatId) return 'telegram'
  if (value === 'email' || lead.email) return 'email'
  return 'crm'
}

function temperatureFrom(score, temperature) {
  const normalized = String(temperature || '').toLowerCase()
  if (['hot', 'warm', 'cold'].includes(normalized)) return normalized
  if (Number(score) >= 70) return 'hot'
  if (Number(score) >= 45) return 'warm'
  return 'cold'
}

function selectedOutreachTypes(score, temperature) {
  const temp = temperatureFrom(score, temperature)
  if (temp === 'hot' || Number(score) >= 70) return OUTREACH_TYPES
  if (temp === 'warm') return ['first_contact']
  return []
}

function buildIntent(lead, intelligence = {}) {
  const metadata = lead.metadata || {}
  return clean(intelligence.intentSummary || intelligence.aiSummary || metadata.intent || metadata.message || lead.notes || lead.first_message, 'интерес к AI CRM и автоматизации продаж')
}

function buildTelegramDraft(type, lead, intelligence = {}) {
  const name = firstName(lead.name)
  const company = clean(lead.company)
  const source = clean(lead.source, 'CRM')
  const intent = buildIntent(lead, intelligence)
  const channel = normalizeChannel(intelligence.recommendedChannel, lead)
  const context = company ? `для ${company}` : 'для вашей команды'
  const sourceText = source === 'telegram' ? 'по вашему сообщению в Telegram' : source === 'landing' ? 'по заявке с сайта' : 'по вашему запросу'

  const templates = {
    first_contact: `${name}, добрый день! Увидел ${sourceText} про ${intent}. Могу коротко показать, как AS6 AI CRM автоматизирует follow-up и коммуникации ${context} без спама.`,
    followup_24h: `${name}, добрый день! Возвращаюсь к запросу про ${intent}. Если актуально, подскажу 2–3 быстрых шага для запуска AI follow-up ${context}.`,
    followup_3d: `${name}, добрый день! Не хочу отвлекать лишним — просто уточню, актуальна ли ещё задача по ${intent}? Если да, предложу короткий план внедрения.`,
    meeting_request: `${name}, добрый день! Предлагаю созвониться на 15 минут и разобрать, как AI CRM закроет ваш сценарий ${context}. Удобно сегодня или завтра?`,
    demo_offer: `${name}, добрый день! Могу показать короткое demo AS6 AI CRM на примере ${intent}: лиды, Telegram/email черновики и follow-up очередь. Когда удобно посмотреть?`,
  }

  return { text: templates[type], channel }
}

function buildEmailDraft(type, lead, intelligence = {}) {
  const name = firstName(lead.name)
  const company = clean(lead.company, 'вашей команды')
  const intent = buildIntent(lead, intelligence)
  const score = Number(intelligence.score || 0)
  const temp = temperatureFrom(score, intelligence.temperature)
  const cta = type === 'demo_offer'
    ? 'Посмотреть короткое demo на 15 минут'
    : type === 'meeting_request'
      ? 'Согласовать 15-минутный созвон'
      : 'Ответить, актуальна ли задача сейчас'

  const subjects = {
    first_contact: `AI CRM для ${company}`,
    followup_24h: `Следующий шаг по AI CRM`,
    followup_3d: `Актуален ли запрос по AI CRM?`,
    meeting_request: `15 минут про AI CRM и follow-up`,
    demo_offer: `Demo AS6 AI CRM под ваш сценарий`,
  }

  const opener = `${name}, добрый день!`
  const bodyByType = {
    first_contact: `${opener}\n\nУвидел ваш запрос: ${intent}. AS6 AI CRM помогает sales-командам автоматически квалифицировать лидов, готовить Telegram/email черновики и не терять follow-up.\n\nДля ${company} можно начать с простого сценария: лид → AI score → черновик → approval → отправка.`,
    followup_24h: `${opener}\n\nВозвращаюсь к вашему запросу по ${intent}. Похоже, здесь можно быстро снять ручную нагрузку с менеджеров и ускорить первые касания.\n\nГотов предложить короткий план запуска без сложного внедрения.`,
    followup_3d: `${opener}\n\nАккуратно уточню, актуальна ли ещё задача по ${intent}. Если приоритет изменился — всё ок. Если задача в работе, могу помочь выбрать самый быстрый next step.`,
    meeting_request: `${opener}\n\nПредлагаю коротко созвониться и разобрать ваш процесс: источники лидов, Telegram/email, правила follow-up и approval. После встречи будет понятно, где AS6 AI CRM даст быстрый эффект.`,
    demo_offer: `${opener}\n\nМогу показать demo AS6 AI CRM на близком к вашему сценарию примере: AI квалификация, score ${score || '70+'}, ${temp.toUpperCase()} priority, черновики Telegram/email и follow-up jobs.\n\nDemo займёт около 15 минут.`,
  }

  return {
    subject: subjects[type],
    body: `${bodyByType[type]}\n\nCTA: ${cta}`,
    cta,
    demoProposal: ['demo_offer', 'meeting_request'].includes(type) ? 'Предложить demo AS6 AI CRM на 15 минут' : '',
  }
}

function buildRecommendation(type, lead, intelligence = {}) {
  const channel = normalizeChannel(intelligence.recommendedChannel, lead)
  const temp = temperatureFrom(intelligence.score, intelligence.temperature)
  const timings = {
    first_contact: temp === 'hot' ? 'сразу' : 'сегодня',
    followup_24h: 'через 24 часа, если нет ответа',
    followup_3d: 'через 3 дня без ответа',
    meeting_request: 'после первого позитивного ответа',
    demo_offer: 'когда лид подтвердит интерес или попросит детали',
  }
  return `Рекомендуемый канал: ${channel}. Тип: ${type}. Отправить ${timings[type]}. Контекст: ${buildIntent(lead, intelligence)}.`
}

async function ensureOutreachWorker(client, workspaceId) {
  const result = await client.query(
    `INSERT INTO ai_workers(workspace_id, name, type, status, mode, description)
     VALUES($1, 'AI Outreach Engine', 'ai_crm_assistant', 'active', 'approval_required', 'Генерирует Telegram/email outreach drafts и follow-up jobs после AI квалификации лида.')
     ON CONFLICT (workspace_id, type) DO UPDATE SET updated_at = NOW()
     RETURNING id`,
    [workspaceId]
  )
  return result.rows[0]
}

async function hasRecentQueueDraft(client, workspaceId, leadId, outreachType, actionType) {
  const result = await client.query(
    `SELECT id FROM ai_worker_queue
      WHERE workspace_id = $1
        AND lead_id = $2
        AND action_type = $3
        AND payload->>'outreachType' = $4
        AND created_at > NOW() - INTERVAL '24 hours'
        AND status IN ('pending_approval', 'approved', 'executing', 'completed')
      LIMIT 1`,
    [workspaceId, leadId, actionType, outreachType]
  )
  return result.rows[0] || null
}

async function hasRecentFollowupJob(client, workspaceId, leadId, outreachType) {
  const result = await client.query(
    `SELECT id FROM ai_followup_jobs
      WHERE workspace_id = $1
        AND lead_id = $2
        AND rule_type = $3
        AND created_at > NOW() - INTERVAL '24 hours'
        AND status IN ('suggested', 'approved', 'sent')
      LIMIT 1`,
    [workspaceId, leadId, `ai_outreach_${outreachType}`]
  )
  return result.rows[0] || null
}

async function createQueueItem(client, { workerId, workspaceId, userId, lead, outreachType, actionType, title, recommendation, payload }) {
  const existing = await hasRecentQueueDraft(client, workspaceId, lead.id, outreachType, actionType)
  if (existing) return { skipped: true, id: existing.id, actionType, outreachType }
  const result = await client.query(
    `INSERT INTO ai_worker_queue(worker_id, workspace_id, lead_id, action_type, status, title, recommendation, payload)
     VALUES($1, $2, $3, $4, 'pending_approval', $5, $6, $7)
     RETURNING id`,
    [workerId, workspaceId, lead.id, actionType, title, recommendation, payload]
  )
  await addTimelineEvent(client, { workspaceId, leadId: lead.id, userId, eventType: 'ai_draft_created', title: 'AI черновик создан', body: payload.text || payload.message || recommendation, source: 'ai', metadata: { queueId: result.rows[0].id, actionType, outreachType, channel: payload.channel } })
  return { id: result.rows[0].id, actionType, outreachType }
}

function scheduleFor(type) {
  const hours = { first_contact: 0, followup_24h: 24, followup_3d: 72, meeting_request: 2, demo_offer: 4 }[type] ?? 24
  return hours === 0 ? new Date().toISOString() : new Date(Date.now() + hours * 36e5).toISOString()
}

async function createFollowupJob(client, { workspaceId, lead, outreachType, channel, message, recommendation, intelligence }) {
  const existing = await hasRecentFollowupJob(client, workspaceId, lead.id, outreachType)
  if (existing) return { skipped: true, id: existing.id, outreachType }
  const result = await client.query(
    `INSERT INTO ai_followup_jobs(workspace_id, lead_id, rule_type, status, suggested_channel, generated_message, scheduled_for, reason, urgency, metadata)
     VALUES($1, $2, $3, 'suggested', $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [workspaceId, lead.id, `ai_outreach_${outreachType}`, channel, message, scheduleFor(outreachType), recommendation, temperatureFrom(intelligence.score, intelligence.temperature) === 'hot' ? 'high' : 'medium', { source: 'ai_outreach_engine', outreachType, score: intelligence.score, temperature: intelligence.temperature }]
  )
  return { id: result.rows[0].id, outreachType }
}

async function generateOutreachForLead(client, { workspaceId, userId, lead, intelligence }) {
  const score = Number(intelligence.score || 0)
  const temperature = temperatureFrom(score, intelligence.temperature)
  const types = selectedOutreachTypes(score, temperature)
  const worker = await ensureOutreachWorker(client, workspaceId)
  const createdQueueItems = []
  const createdFollowupJobs = []
  const skipped = []

  if (!types.length) {
    const recommendation = `Cold lead: активную отправку не генерировать. Сначала уточнить потребность и контактный канал. Контекст: ${buildIntent(lead, intelligence)}.`
    const job = await createFollowupJob(client, { workspaceId, lead, outreachType: 'recommendation_only', channel: 'crm', message: recommendation, recommendation, intelligence: { ...intelligence, temperature } })
    if (job.skipped) skipped.push(job)
    else createdFollowupJobs.push(job)
    return { temperature, outreachTypes: [], createdQueueItems, createdFollowupJobs, skipped }
  }

  for (const outreachType of types) {
    const telegram = buildTelegramDraft(outreachType, lead, { ...intelligence, temperature })
    const email = buildEmailDraft(outreachType, lead, { ...intelligence, temperature })
    const recommendation = buildRecommendation(outreachType, lead, { ...intelligence, temperature })
    const basePayload = {
      source: 'ai_outreach_engine',
      outreachType,
      leadName: lead.name,
      company: lead.company || '',
      sourceLead: lead.source || '',
      detectedIntent: buildIntent(lead, intelligence),
      recommendedChannel: normalizeChannel(intelligence.recommendedChannel, lead),
      score,
      temperature,
      recommendation,
    }

    const telegramItem = await createQueueItem(client, {
      workerId: worker.id,
      workspaceId,
      userId,
      lead,
      outreachType,
      actionType: 'telegram_draft',
      title: `Telegram draft · ${outreachType} · ${lead.name}`,
      recommendation,
      payload: { ...basePayload, channel: 'telegram', text: telegram.text, message: telegram.text },
    })
    const emailItem = await createQueueItem(client, {
      workerId: worker.id,
      workspaceId,
      userId,
      lead,
      outreachType,
      actionType: 'email_draft',
      title: `Email draft · ${outreachType} · ${lead.name}`,
      recommendation,
      payload: { ...basePayload, channel: 'email', to: lead.email || '', subject: email.subject, text: email.body, message: email.body, cta: email.cta, demoProposal: email.demoProposal },
    })
    for (const item of [telegramItem, emailItem]) item.skipped ? skipped.push(item) : createdQueueItems.push(item)

    const followupMessage = normalizeChannel(intelligence.recommendedChannel, lead) === 'email' ? `${email.subject}\n\n${email.body}` : telegram.text
    const job = await createFollowupJob(client, { workspaceId, lead, outreachType, channel: normalizeChannel(intelligence.recommendedChannel, lead), message: followupMessage, recommendation, intelligence: { ...intelligence, temperature } })
    job.skipped ? skipped.push(job) : createdFollowupJobs.push(job)
  }

  await client.query(
    `INSERT INTO crm_activity(user_id, workspace_id, lead_id, type, title, body, metadata)
     VALUES($1, $2, $3, 'ai_outreach_generated', 'AI outreach drafts generated', $4, $5)`,
    [userId, workspaceId, lead.id, `${createdQueueItems.length} drafts · ${createdFollowupJobs.length} follow-up jobs · ${temperature.toUpperCase()}`, { source: 'ai_outreach_engine', outreachTypes: types, createdQueueItems, createdFollowupJobs, skipped, score, temperature }]
  )
  await addTimelineEvent(client, { workspaceId, leadId: lead.id, userId, eventType: 'ai_outreach_generated', title: 'AI outreach generated', body: `${types.join(', ')} · ${temperature.toUpperCase()}`, source: 'ai', metadata: { createdQueueItems, createdFollowupJobs, skipped, score, temperature } })

  return { temperature, outreachTypes: types, createdQueueItems, createdFollowupJobs, skipped }
}

module.exports = { OUTREACH_TYPES, QUEUE_ACTIONS, buildEmailDraft, buildTelegramDraft, generateOutreachForLead, selectedOutreachTypes, temperatureFrom }
