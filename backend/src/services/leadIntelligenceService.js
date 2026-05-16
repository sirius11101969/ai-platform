const STAGE_WEIGHTS = { new: 18, qualified: 32, proposal: 52, booked: 68, won: 100, lost: 3 }

const BUYING_KEYWORDS = ['demo', 'crm', 'automation', 'ai', 'sales', 'integration', 'команда', 'внедрение', 'тариф', 'стоимость', 'budget', 'proposal', 'telegram', 'demo', 'демо', 'бюджет', 'кп']
const KEYWORD_BUSINESS_MEANINGS = {
  demo: 'демонстрацию решения',
  crm: 'автоматизацию CRM',
  automation: 'автоматизацию продаж',
  ai: 'AI-помощника для продаж',
  sales: 'процесс продаж',
  integration: 'интеграцию с текущими инструментами',
  'команда': 'работу отдела продаж',
  'внедрение': 'запуск решения',
  'тариф': 'стоимость и формат подключения',
  'стоимость': 'стоимость и формат подключения',
}
const DISPOSABLE_DOMAINS = ['mailinator.com', '10minutemail.com', 'tempmail.com', 'guerrillamail.com', 'yopmail.com', 'trashmail.com']
const FREE_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'mail.ru', 'yandex.ru', 'icloud.com']

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(Number(value) || 0)))
}

function hoursSince(value) {
  if (!value) return 9999
  return Math.max(0, (Date.now() - new Date(value).getTime()) / 36e5)
}

function humanJoin(values) {
  const unique = [...new Set(values.filter(Boolean))]
  if (!unique.length) return ''
  if (unique.length === 1) return unique[0]
  return `${unique.slice(0, -1).join(', ')} и ${unique[unique.length - 1]}`
}

function buildHumanLeadSummary({ keywordHits, positiveIntent, negativeIntent, spamLike }) {
  const meanings = humanJoin(keywordHits.map((keyword) => KEYWORD_BUSINESS_MEANINGS[keyword] || keyword))
  if (meanings) return `Запрос связан с ${meanings}.`
  if (positiveIntent) return 'Клиент заинтересован в следующем шаге и готов обсудить детали.'
  if (negativeIntent) return 'Есть сомнения или отложенное решение — лучше аккуратно уточнить актуальность.'
  if (spamLike) return 'Сообщение похоже на нерелевантное обращение; лучше проверить вручную.'
  return 'Контекст собран из CRM, Telegram, задач и email; стоит уточнить бизнес-потребность.'
}

function detectObjections(text) {
  const source = String(text || '').toLowerCase()
  const objections = []
  if (/дорог|цена|бюджет|стоим/.test(source)) objections.push('Цена / бюджет')
  if (/подума|позже|не сейчас|верн/.test(source)) objections.push('Отложенное решение')
  if (/конкур|сравн|альтернатив/.test(source)) objections.push('Сравнение с конкурентами')
  if (/не уверен|сомнен|риск/.test(source)) objections.push('Недостаточно доверия')
  return objections
}

function buildLeadSignals(context) {
  const lead = context.lead || context
  const notes = context.notes || []
  const telegramMessages = context.telegramMessages || []
  const emails = context.emails || []
  const activity = context.activity || []
  const text = [lead.notesText, ...notes.map((note) => note.body), ...telegramMessages.map((message) => message.message), ...emails.map((email) => `${email.subject} ${email.text || ''}`), ...activity.map((event) => `${event.title} ${event.body || ''}`)].join('\n')
  const outboundTouches = [
    ...telegramMessages.filter((message) => message.role !== 'user').map((message) => message.createdAt),
    ...emails.filter((email) => email.sentAt || email.createdAt).map((email) => email.sentAt || email.createdAt),
    ...activity.filter((event) => /follow|proposal|предлож|email|telegram|demo|meeting|встреч/i.test(`${event.title || ''} ${event.body || ''}`)).map((event) => event.createdAt),
  ].filter(Boolean)
  const inboundTouches = [
    lead.lastMessageAt,
    ...telegramMessages.filter((message) => message.role === 'user').map((message) => message.createdAt),
    ...activity.filter((event) => /replied|ответ|inbound|opened|открыл/i.test(`${event.title || ''} ${event.body || ''}`)).map((event) => event.createdAt),
  ].filter(Boolean)
  const lastOutboundAt = outboundTouches.sort((a, b) => new Date(b) - new Date(a))[0] || null
  const lastInboundAt = inboundTouches.sort((a, b) => new Date(b) - new Date(a))[0] || null
  const lastTouch = [lead.updatedAt, lead.lastMessageAt, ...telegramMessages.map((message) => message.createdAt), ...emails.map((email) => email.openedAt || email.sentAt || email.createdAt), ...activity.map((event) => event.createdAt)].filter(Boolean).sort((a, b) => new Date(b) - new Date(a))[0]
  const normalizedText = String(text || '').toLowerCase()
  const emailDomain = String(lead.email || '').split('@')[1]?.toLowerCase() || ''
  const positiveIntent = /(готов|интерес|оплат|счет|счёт|договор|встреч|демо|кп|предлож)/i.test(text)
  const negativeIntent = /(не интересно|отказ|дорого|позже|не актуально|нет бюджета|stop|unsubscribe|конкурент|не подходит)/i.test(text)
  const keywordHits = BUYING_KEYWORDS.filter((keyword) => normalizedText.includes(keyword))
  const hasBusinessEmail = Boolean(emailDomain && !FREE_EMAIL_DOMAINS.includes(emailDomain) && !DISPOSABLE_DOMAINS.includes(emailDomain))
  const hasDisposableEmail = DISPOSABLE_DOMAINS.includes(emailDomain)
  const isLongMessage = normalizedText.length >= 120
  const emptyMessage = normalizedText.trim().length === 0
  const spamLike = /(https?:\/\/.*https?:\/\/|casino|viagra|crypto pump|заработок без вложений|seo backlinks|forex)/i.test(text)
  const objections = detectObjections(text)
  const proposalSent = /(proposal|предлож|кп|commercial offer|смет|договор)/i.test(text) || emails.some((email) => /(proposal|предлож|кп|commercial offer|смет|договор)/i.test(`${email.subject || ''} ${email.text || ''}`))
  const meetingMentioned = /(meeting|встреч|demo|демо|созвон|call)/i.test(text)
  const followupCount = activity.filter((event) => /follow|дожим|напомин|telegram|email/i.test(`${event.title || ''} ${event.body || ''}`)).length
  const inboundAfterOutbound = lastInboundAt && lastOutboundAt && new Date(lastInboundAt) > new Date(lastOutboundAt)
  return { lead, notes, telegramMessages, emails, activity, text, lastTouch, lastOutboundAt, lastInboundAt, hoursInactive: hoursSince(lastTouch || lead.updatedAt || lead.createdAt), hoursSinceOutbound: hoursSince(lastOutboundAt), inboundAfterOutbound, positiveIntent, negativeIntent, keywordHits, hasBusinessEmail, hasDisposableEmail, isLongMessage, emptyMessage, spamLike, objections, proposalSent, meetingMentioned, followupCount }
}

function scoreLeadContext(context, aiOutput = {}) {
  const signals = buildLeadSignals(context)
  const { lead, telegramMessages, emails, activity, hoursInactive, positiveIntent, negativeIntent, keywordHits, hasBusinessEmail, hasDisposableEmail, isLongMessage, emptyMessage, spamLike, objections } = signals
  let score = STAGE_WEIGHTS[lead.stage || lead.status] ?? 10
  score += Math.min(16, telegramMessages.length * 2)
  score += Math.min(10, emails.filter((email) => email.openedAt).length * 4 + emails.filter((email) => email.sentAt).length)
  score += Math.min(10, activity.length)
  if (lead.value > 0) score += 6
  if (hasBusinessEmail) score += 14
  if (lead.company) score += 12
  else score -= 10
  if (lead.telegram) score += 10
  if (isLongMessage) score += 10
  if (keywordHits.length) score += Math.min(24, keywordHits.length * 5)
  if (hasDisposableEmail) score -= 24
  if (emptyMessage) score -= 18
  if (spamLike) score -= 30
  if (positiveIntent) score += 16
  if (negativeIntent) score -= 22
  if (hoursInactive <= 6) score += 10
  else if (hoursInactive <= 24) score += 4
  else if (hoursInactive >= 72) score -= 16
  if (Number.isFinite(Number(aiOutput.conversionProbability))) score = (score * 0.55) + (Number(aiOutput.conversionProbability) * 0.45)

  const riskSignals = []
  if (signals.hoursSinceOutbound >= 24 && !signals.inboundAfterOutbound) riskSignals.push(signals.hoursSinceOutbound >= 168 ? 'no_reply_7d' : signals.hoursSinceOutbound >= 72 ? 'no_reply_3d' : 'no_reply_24h')
  if (signals.proposalSent && signals.hoursSinceOutbound >= 24 && !signals.inboundAfterOutbound) riskSignals.push('proposal_ignored')
  if (signals.meetingMentioned && hoursInactive >= 24 && !signals.inboundAfterOutbound) riskSignals.push('meeting_without_next_step')
  if (signals.followupCount >= 3 && !signals.inboundAfterOutbound) riskSignals.push('repeated_followups_without_engagement')
  if (hoursInactive >= 72) riskSignals.push('low_activity')
  if (negativeIntent || (objections.length && !positiveIntent)) riskSignals.push('negative_signals')
  const normalizedScore = clamp(score - (riskSignals.includes('no_reply_7d') ? 18 : riskSignals.includes('no_reply_3d') ? 10 : 0) - (riskSignals.includes('negative_signals') ? 10 : 0))
  const dealProbability = clamp(Number.isFinite(Number(aiOutput.conversionProbability)) ? aiOutput.conversionProbability : normalizedScore * 0.92)
  const budgetProbability = clamp((lead.value > 0 ? 72 : 42) + (lead.company ? 12 : 0) + (keywordHits.some((keyword) => ['тариф', 'стоимость', 'budget', 'бюджет'].includes(keyword)) ? 18 : 0) - (hasDisposableEmail ? 25 : 0))
  const urgencyLevel = normalizedScore >= 75 || riskSignals.length || hoursInactive >= 48 || (lead.stage === 'proposal' && hoursInactive >= 24) ? 'high' : normalizedScore >= 45 || hoursInactive >= 24 || objections.length ? 'medium' : 'low'
  const engagementScore = clamp(normalizedScore + Math.min(12, telegramMessages.length * 2) + (signals.inboundAfterOutbound ? 12 : 0) - (riskSignals.length * 8))
  const engagementLevel = engagementScore >= 75 ? 'hot' : engagementScore >= 45 ? 'warm' : 'cold'
  const riskLevel = riskSignals.includes('no_reply_7d') || riskSignals.includes('proposal_ignored') || riskSignals.includes('negative_signals') || hoursInactive >= 168 ? 'high' : riskSignals.length || hoursInactive >= 48 ? 'medium' : 'low'
  const forecastCategory = lead.stage === 'lost' ? 'lost_risk' : riskLevel === 'high' ? 'lost_risk' : riskLevel === 'medium' ? 'at_risk' : dealProbability >= 80 ? 'committed' : dealProbability >= 60 ? 'likely' : 'possible'
  const expectedRevenue = Math.round(Number(lead.value || 0) * (dealProbability / 100))
  const recommendedChannel = telegramMessages.length || lead.telegram ? 'telegram' : lead.email ? 'email' : lead.phone ? 'phone' : 'crm_task'
  const actionCode = riskLevel === 'high' && dealProbability < 20 ? 'close_as_lost' : riskLevel === 'high' ? 'escalate_to_manager' : recommendedChannel === 'telegram' && riskSignals.length ? 'follow_up_in_telegram' : lead.stage === 'new' || lead.stage === 'qualified' ? 'schedule_demo' : lead.stage === 'proposal' ? 'request_budget_info' : 'send_proposal'
  const actionLabels = { schedule_demo: 'Назначить demo', send_proposal: 'Отправить proposal', follow_up_in_telegram: 'Написать follow-up в Telegram', escalate_to_manager: 'Эскалировать менеджеру', close_as_lost: 'Закрыть как lost', request_budget_info: 'Уточнить бюджет' }
  const nextBestAction = aiOutput.nextBestAction || aiOutput.followUpRecommendation || actionLabels[actionCode]
  const idealContactTiming = urgencyLevel === 'high' ? 'в ближайшие 2 часа' : hoursInactive >= 24 ? 'сегодня до конца дня' : 'завтра утром'
  const recommendedCta = lead.stage === 'proposal' ? 'Подтвердить оплату или следующий шаг по КП' : lead.stage === 'booked' ? 'Зафиксировать итог встречи и дату решения' : 'Назначить короткий созвон / демо'
  let aiSummary = aiOutput.reasoning || aiOutput.content || buildHumanLeadSummary({ keywordHits, positiveIntent, negativeIntent, spamLike })
  if (riskSignals.includes('proposal_ignored')) aiSummary = 'Клиент перестал отвечать после отправки предложения.'
  else if (riskSignals.includes('low_activity')) aiSummary = `Сделка без активности ${Math.round(hoursInactive / 24)} дней.`
  else if (telegramMessages.length && signals.inboundAfterOutbound) aiSummary = 'Есть Telegram engagement и быстрые ответы.'
  else if (keywordHits.includes('demo') || keywordHits.includes('демо') || keywordHits.includes('внедрение')) aiSummary = 'Высокий интерес к demo и внедрению.'
  const riskAlert = riskLevel === 'high' ? 'Риск потери сделки' : riskLevel === 'medium' ? 'Нужен контроль следующего касания' : 'Клиент активно вовлечён'

  const confidence = clamp(55 + (lead.email ? 8 : 0) + (lead.company ? 8 : 0) + (lead.telegram ? 6 : 0) + Math.min(16, keywordHits.length * 3) + (isLongMessage ? 7 : 0) - (spamLike ? 20 : 0) - (riskSignals.length * 3))

  return { score: normalizedScore, temperature: engagementLevel, budgetProbability, dealProbability, urgencyLevel, engagementLevel, engagementScore, riskLevel, forecastCategory, expectedRevenue, riskSignals, aiSummary, aiReasoning: aiSummary, nextBestAction, nextBestActionCode: actionCode, idealContactTiming, objectionsDetected: objections, recommendedCta, recommendedChannel, confidence, riskAlert }
}

function buildFollowUpDraft(context, intelligence) {
  const lead = context.lead || context
  const company = lead.company ? ` из ${lead.company}` : ''
  const message = intelligence.urgencyLevel === 'high'
    ? `Здравствуйте, ${lead.name}! Возвращаюсь к нашему обсуждению${company}: подскажите, актуально ли двинуться дальше сегодня? Могу быстро зафиксировать следующий шаг и ответить на вопросы.`
    : `Здравствуйте, ${lead.name}! Подготовил следующий шаг по вашему запросу${company}. Удобно сегодня коротко сверить детали и понять, что нужно для решения?`
  const scheduledFor = new Date(Date.now() + (intelligence.urgencyLevel === 'high' ? 2 : 24) * 36e5).toISOString()
  return { message, scheduledFor, followupType: intelligence.recommendedChannel === 'email' || intelligence.recommendedChannel === 'Email' ? 'email' : intelligence.recommendedChannel === 'telegram' || intelligence.recommendedChannel === 'Telegram' ? 'telegram' : 'reminder_task' }
}

module.exports = { buildFollowUpDraft, scoreLeadContext }
