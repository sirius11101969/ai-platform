const { addTimelineEvent } = require('./timelineService')
const { sanitizeAiCopy, sanitizeAiActionPayload } = require('../utils/aiCopySanitizer')

const OUTREACH_TYPES = ['first_contact', 'followup_24h', 'followup_3d', 'meeting_request', 'demo_offer']
const QUEUE_ACTIONS = ['telegram_draft', 'email_draft']
const INTERNAL_COPY_PATTERNS = [
  /лид\s+проявил\s+интерес\s+к\s+темам:?/gi,
  /intent\s*summary/gi,
  /temperature/gi,
  /score/gi,
  /qualification/gi,
  /ai\s*detected/gi,
  /AI\s*detected/gi,
]

const TAG_MEANINGS = [
  { pattern: /\bcrm\b|срм|воронк|pipeline/i, meaning: 'автоматизации CRM' },
  { pattern: /follow\s*-?up|фоллоу|касани|напомин|догон/i, meaning: 'follow-up с клиентами' },
  { pattern: /telegram|телеграм/i, meaning: 'коммуникаций в Telegram' },
  { pattern: /email|почт|письм/i, meaning: 'email-коммуникаций' },
  { pattern: /\bai\b|ии|нейро|автоматизац/i, meaning: 'AI-автоматизации продаж' },
  { pattern: /интеграц|api|amo|bitrix|битрикс/i, meaning: 'связки с текущими инструментами' },
  { pattern: /демо|demo|презентац|показ/i, meaning: 'демонстрации решения' },
  { pattern: /стоим|цен|тариф|бюджет/i, meaning: 'оценки стоимости внедрения' },
  { pattern: /лид|заявк|обращен/i, meaning: 'обработки входящих лидов' },
]

const PAIN_POINTS = [
  { pattern: /ручн|рутин|оператор|менеджер/i, text: 'снизить ручную нагрузку на менеджеров' },
  { pattern: /теря|пропуск|забы|не отвеч/i, text: 'не терять follow-up и ответы клиентов' },
  { pattern: /скор|быстр|сразу|24/i, text: 'ускорить первые касания' },
  { pattern: /telegram|телеграм|email|почт/i, text: 'вести Telegram/email без разрозненных черновиков' },
  { pattern: /квалиф|приоритет|горяч|lead score/i, text: 'быстрее понимать приоритет лидов' },
]

function clean(value, fallback = '') {
  const normalized = String(value || '').trim()
  return normalized || fallback
}

function isRussianFirstName(value) {
  return /^[А-ЯЁ][а-яё-]+$/.test(clean(value))
}

function looksLikeLeadLabel(name) {
  const value = clean(name)
  if (!value) return false
  const normalized = value.toLowerCase()
  const words = value.split(/\s+/).filter(Boolean)
  const hasCyrillic = /[а-яё]/i.test(value)
  const englishOnly = /^[a-z0-9\s._-]+$/i.test(value) && /[a-z]/i.test(value)
  const technicalPhrase = /\b(copy|quality|test|lead|demo|draft|email|telegram|crm|ai|bot|user|sample|mock|qa)\b/i.test(value)

  return (
    /\btest\b|тест/i.test(normalized) ||
    (words.length > 2 && (technicalPhrase || englishOnly || !hasCyrillic)) ||
    (englishOnly && technicalPhrase)
  )
}

function firstName(name) {
  const value = clean(name)
  if (!value || looksLikeLeadLabel(value)) return ''
  const first = value.split(/\s+/)[0]
  return isRussianFirstName(first) ? first : ''
}

function greetingFor(name) {
  const nameForGreeting = firstName(name)
  return nameForGreeting ? `${nameForGreeting}, добрый день!` : 'Здравствуйте!'
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

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function stripInternalCopy(value) {
  let text = clean(value)
  for (const pattern of INTERNAL_COPY_PATTERNS) text = text.replace(pattern, '')
  return text
    .replace(/\.{2,}/g, '.')
    .replace(/\s+([,.!?])/g, '$1')
    .replace(/[\s:;,-]+$/g, '')
    .replace(/^[\s:;,-]+/g, '')
    .trim()
}

function sourceLabel(source) {
  const normalized = String(source || '').toLowerCase()
  if (normalized === 'telegram') return 'сообщение в Telegram'
  if (normalized === 'landing' || normalized === 'site' || normalized === 'website') return 'заявку с сайта'
  if (normalized === 'email') return 'письмо'
  if (normalized === 'referral') return 'рекомендацию'
  return 'запрос'
}

function textFromLead(lead = {}, intelligence = {}) {
  const metadata = lead.metadata || {}
  return [
    intelligence.intentSummary,
    intelligence.aiSummary,
    intelligence.nextBestAction,
    metadata.businessNeed,
    metadata.intent,
    metadata.message,
    lead.notes,
    lead.notesText,
    lead.first_message,
  ].filter(Boolean).join('\n')
}

function inferBusinessMeanings(text) {
  const source = String(text || '')
  return unique(TAG_MEANINGS.filter((item) => item.pattern.test(source)).map((item) => item.meaning))
}

function inferPainPoints(text, intelligence = {}) {
  const detected = PAIN_POINTS.filter((item) => item.pattern.test(String(text || ''))).map((item) => item.text)
  const objections = Array.isArray(intelligence.objectionsDetected) ? intelligence.objectionsDetected : []
  if (objections.length) detected.push('аккуратно снять вопросы перед следующим шагом')
  return unique(detected).slice(0, 2)
}

function humanJoin(items) {
  const values = unique(items)
  if (!values.length) return ''
  if (values.length === 1) return values[0]
  return `${values.slice(0, -1).join(', ')} и ${values[values.length - 1]}`
}

function buildCopyContext(lead = {}, intelligence = {}) {
  const rawText = textFromLead(lead, intelligence)
  const sanitizedText = stripInternalCopy(rawText)
  const meanings = inferBusinessMeanings(rawText)
  const painPoints = inferPainPoints(rawText, intelligence)
  const inferredNeed = humanJoin(meanings.slice(0, 3)) || stripInternalCopy(sanitizedText) || 'автоматизации продаж и follow-up'
  const businessNeed = inferredNeed.replace(/^интерес\s+к\s+/i, '').replace(/^по\s+/i, '')

  return {
    name: firstName(lead.name),
    greeting: greetingFor(lead.name),
    company: clean(lead.company),
    companyContext: lead.company ? `для компании ${lead.company}` : 'для вашей команды',
    source: sourceLabel(lead.source),
    businessNeed,
    painPoints,
    painPointText: humanJoin(painPoints),
    channel: normalizeChannel(intelligence.recommendedChannel, lead),
  }
}

function buildIntent(lead, intelligence = {}) {
  return buildCopyContext(lead, intelligence).businessNeed
}

function buildTelegramDraft(type, lead, intelligence = {}) {
  const context = buildCopyContext(lead, intelligence)
  const painLine = context.painPointText ? `Можно быстро понять, как ${context.painPointText}.` : 'Можно быстро понять, где автоматизация даст пользу без лишнего внедрения.'
  const firstContactIntro = context.name
    ? `Увидел ${context.source} по ${context.businessNeed}.`
    : context.company
      ? `Видим ваш запрос от компании ${context.company} по ${context.businessNeed}.`
      : `Увидел ${context.source} по ${context.businessNeed}.`

  const templates = {
    first_contact: `${context.greeting}\n${firstContactIntro}\n${painLine}\nАктуально обсудить автоматизацию follow-up?`,
    followup_24h: `${context.greeting}\nВозвращаюсь к вашему запросу по ${context.businessNeed}.\nМогу предложить 2–3 практичных шага ${context.companyContext}.\nУдобно коротко обсудить на этой неделе?`,
    followup_3d: `${context.greeting}\nАккуратно уточню: задача по ${context.businessNeed} ещё актуальна?\nЕсли да — подскажу самый простой следующий шаг.`,
    meeting_request: `${context.greeting}\nПредлагаю 15 минут разобрать ваш сценарий ${context.companyContext}: лиды, Telegram/email и follow-up.\nУдобно созвониться на этой неделе?`,
    demo_offer: `${context.greeting}\nМогу показать короткое демо AS6 AI CRM под задачу по ${context.businessNeed}.\nПокажу, как готовятся черновики и follow-up без спама.\nУдобно посмотреть на этой неделе?`,
  }

  return { text: templates[type], channel: context.channel }
}

function buildEmailDraft(type, lead, intelligence = {}) {
  const context = buildCopyContext(lead, intelligence)
  const ctaByType = {
    first_contact: 'Актуально обсудить автоматизацию follow-up?',
    followup_24h: 'Удобно показать 2–3 подходящих сценария на этой неделе?',
    followup_3d: 'Подскажите, задача ещё актуальна?',
    meeting_request: 'Удобно созвониться на 15 минут на этой неделе?',
    demo_offer: 'Удобно показать демо на этой неделе?',
  }

  const subjects = {
    first_contact: `AS6 AI CRM для ${context.company || 'вашей команды'}`,
    followup_24h: `По вашему запросу про CRM и follow-up`,
    followup_3d: `Актуальна ли автоматизация follow-up?`,
    meeting_request: `15 минут про CRM и follow-up`,
    demo_offer: `Демо AS6 AI CRM под ваш сценарий`,
  }

  const opener = context.greeting
  const firstContactIntro = context.name
    ? `Увидел ${context.source} по ${context.businessNeed}.`
    : context.company
      ? `Видим ваш запрос от компании ${context.company} по ${context.businessNeed}.`
      : `Увидел ${context.source} по ${context.businessNeed}.`
  const painSentence = context.painPointText ? `По описанию может быть полезно ${context.painPointText}.` : 'Можно начать с небольшого сценария без сложного внедрения.'
  const bodyByType = {
    first_contact: `${opener} ${firstContactIntro} ${painSentence}\n\nAS6 AI CRM помогает sales-командам готовить email-черновики, согласовывать отправку и не терять follow-up.`,
    followup_24h: `${opener}\n\nВозвращаюсь к вашему запросу по ${context.businessNeed}. ${painSentence}\n\nМогу предложить короткий план запуска ${context.companyContext}: от входящего лида до согласованного follow-up.`,
    followup_3d: `${opener}\n\nАккуратно уточню, актуальна ли ещё задача по ${context.businessNeed}.\n\nЕсли приоритет сохранился, помогу выбрать самый простой следующий шаг. Если нет — всё ок, вернёмся позже.`,
    meeting_request: `${opener}\n\nПредлагаю коротко созвониться и разобрать ваш процесс: источники лидов, Telegram/email, правила follow-up и согласование черновиков.\n\nПосле разговора будет понятно, какой сценарий можно запустить первым.`,
    demo_offer: `${opener}\n\nМогу показать демо AS6 AI CRM на близком к вашему сценарию примере: входящий лид, черновик сообщения, согласование и follow-up.\n\nДемо займёт около 15 минут и без обещаний «магического ROI» — только практический сценарий.`,
  }
  const cta = ctaByType[type]

  return {
    subject: subjects[type],
    body: `${bodyByType[type]}\n\n${cta}`,
    cta,
    demoProposal: ['demo_offer', 'meeting_request'].includes(type) ? 'Предложить короткое демо AS6 AI CRM под сценарий клиента' : '',
  }
}

function recommendationActionText(type, actionType) {
  if (type === 'meeting_request') return 'Предложить встречу'
  if (type === 'demo_offer') return 'Предложить демо'
  if (actionType === 'telegram_draft') return 'Подготовить короткое сообщение в Telegram'
  if (actionType === 'email_draft') return 'Подготовить email-сообщение'
  return 'Подготовить задачу менеджеру'
}

function buildRecommendation(type, lead, intelligence = {}, actionType = '') {
  const context = buildCopyContext(lead, intelligence)
  const timings = {
    first_contact: 'сегодня',
    followup_24h: 'через 24 часа, если клиент не ответит',
    followup_3d: 'через 3 дня без ответа',
    meeting_request: 'после позитивного ответа клиента',
    demo_offer: 'когда клиент подтвердит интерес к разбору сценария',
  }
  const details = type === 'demo_offer' && actionType === 'email_draft'
    ? ' с коротким планом внедрения'
    : ''
  return `${recommendationActionText(type, actionType)}${details} ${timings[type]}. Фокус: ${context.businessNeed}${context.company ? ` для ${context.company}` : ''}.`
}

async function ensureOutreachWorker(client, workspaceId) {
  const result = await client.query(
    `INSERT INTO ai_workers(workspace_id, name, type, status, mode, description)
     VALUES($1, 'AI Outreach Engine', 'ai_crm_assistant', 'active', 'approval_required', 'Готовит естественные Telegram/email черновики и follow-up задачи после анализа лида.')
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
    [workerId, workspaceId, lead.id, actionType, title, sanitizeAiCopy(recommendation), sanitizeAiActionPayload(payload)]
  )
  await addTimelineEvent(client, { workspaceId, leadId: lead.id, userId, eventType: 'ai_draft_created', title: actionType === 'email_draft' ? 'Черновик письма подготовлен' : 'Черновик Telegram подготовлен', body: payload.text || payload.message || recommendation, source: 'ai', metadata: { queueId: result.rows[0].id, actionType, outreachType, channel: payload.channel } })
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
    const need = buildIntent(lead, intelligence)
    const recommendation = `Пока не отправлять активное сообщение. Лучше уточнить потребность и удобный канал связи. Фокус: ${need}.`
    const job = await createFollowupJob(client, { workspaceId, lead, outreachType: 'recommendation_only', channel: 'crm', message: recommendation, recommendation, intelligence: { ...intelligence, temperature } })
    if (job.skipped) skipped.push(job)
    else createdFollowupJobs.push(job)
    return { temperature, outreachTypes: [], createdQueueItems, createdFollowupJobs, skipped }
  }

  for (const outreachType of types) {
    const copyContext = buildCopyContext(lead, { ...intelligence, temperature })
    const telegram = buildTelegramDraft(outreachType, lead, { ...intelligence, temperature })
    const email = buildEmailDraft(outreachType, lead, { ...intelligence, temperature })
    const telegramRecommendation = buildRecommendation(outreachType, lead, { ...intelligence, temperature }, 'telegram_draft')
    const emailRecommendation = buildRecommendation(outreachType, lead, { ...intelligence, temperature }, 'email_draft')
    const recommendation = buildRecommendation(outreachType, lead, { ...intelligence, temperature }, normalizeChannel(intelligence.recommendedChannel, lead) === 'email' ? 'email_draft' : 'telegram_draft')
    const basePayload = {
      source: 'ai_outreach_engine',
      outreachType,
      leadName: lead.name,
      company: lead.company || '',
      sourceLead: lead.source || '',
      businessNeed: copyContext.businessNeed,
      painPoints: copyContext.painPoints,
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
      title: `Черновик Telegram · ${lead.name}`,
      recommendation: telegramRecommendation,
      payload: { ...basePayload, channel: 'telegram', recommendation: telegramRecommendation, text: telegram.text, message: telegram.text },
    })
    const emailItem = await createQueueItem(client, {
      workerId: worker.id,
      workspaceId,
      userId,
      lead,
      outreachType,
      actionType: 'email_draft',
      title: `Черновик email · ${lead.name}`,
      recommendation: emailRecommendation,
      payload: { ...basePayload, channel: 'email', recommendation: emailRecommendation, to: lead.email || '', subject: email.subject, text: email.body, message: email.body, cta: email.cta, demoProposal: email.demoProposal },
    })
    for (const item of [telegramItem, emailItem]) item.skipped ? skipped.push(item) : createdQueueItems.push(item)

    const followupMessage = normalizeChannel(intelligence.recommendedChannel, lead) === 'email' ? `${email.subject}\n\n${email.body}` : telegram.text
    const job = await createFollowupJob(client, { workspaceId, lead, outreachType, channel: normalizeChannel(intelligence.recommendedChannel, lead), message: followupMessage, recommendation, intelligence: { ...intelligence, temperature } })
    job.skipped ? skipped.push(job) : createdFollowupJobs.push(job)
  }

  await client.query(
    `INSERT INTO crm_activity(user_id, workspace_id, lead_id, type, title, body, metadata)
     VALUES($1, $2, $3, 'ai_outreach_generated', 'Черновики сообщений подготовлены', $4, $5)`,
    [userId, workspaceId, lead.id, `${createdQueueItems.length} черновиков и ${createdFollowupJobs.length} follow-up задач готовы к проверке`, { source: 'ai_outreach_engine', outreachTypes: types, createdQueueItems, createdFollowupJobs, skipped, score, temperature }]
  )
  await addTimelineEvent(client, { workspaceId, leadId: lead.id, userId, eventType: 'ai_outreach_generated', title: 'Черновики сообщений подготовлены', body: `${createdQueueItems.length} черновиков готовы к проверке менеджером`, source: 'ai', metadata: { createdQueueItems, createdFollowupJobs, skipped, score, temperature } })

  return { temperature, outreachTypes: types, createdQueueItems, createdFollowupJobs, skipped }
}

module.exports = { OUTREACH_TYPES, QUEUE_ACTIONS, buildCopyContext, buildEmailDraft, buildIntent, buildTelegramDraft, generateOutreachForLead, selectedOutreachTypes, stripInternalCopy, temperatureFrom }
