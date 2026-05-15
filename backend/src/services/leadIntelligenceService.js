const STAGE_WEIGHTS = { new: 8, qualified: 22, proposal: 42, booked: 58, won: 100, lost: 3 }

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(Number(value) || 0)))
}

function hoursSince(value) {
  if (!value) return 9999
  return Math.max(0, (Date.now() - new Date(value).getTime()) / 36e5)
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
  const lastTouch = [lead.updatedAt, lead.lastMessageAt, ...telegramMessages.map((message) => message.createdAt), ...emails.map((email) => email.openedAt || email.sentAt || email.createdAt), ...activity.map((event) => event.createdAt)].filter(Boolean).sort((a, b) => new Date(b) - new Date(a))[0]
  const positiveIntent = /(готов|интерес|оплат|счет|счёт|договор|встреч|демо|кп|предлож)/i.test(text)
  const negativeIntent = /(не интересно|отказ|дорого|позже|не актуально|нет бюджета)/i.test(text)
  const objections = detectObjections(text)
  return { lead, notes, telegramMessages, emails, activity, text, lastTouch, hoursInactive: hoursSince(lastTouch || lead.updatedAt || lead.createdAt), positiveIntent, negativeIntent, objections }
}

function scoreLeadContext(context, aiOutput = {}) {
  const signals = buildLeadSignals(context)
  const { lead, telegramMessages, emails, activity, hoursInactive, positiveIntent, negativeIntent, objections } = signals
  let score = STAGE_WEIGHTS[lead.stage || lead.status] ?? 10
  score += Math.min(16, telegramMessages.length * 2)
  score += Math.min(10, emails.filter((email) => email.openedAt).length * 4 + emails.filter((email) => email.sentAt).length)
  score += Math.min(10, activity.length)
  if (lead.value > 0) score += 6
  if (positiveIntent) score += 16
  if (negativeIntent) score -= 22
  if (hoursInactive <= 6) score += 10
  else if (hoursInactive <= 24) score += 4
  else if (hoursInactive >= 72) score -= 16
  if (Number.isFinite(Number(aiOutput.conversionProbability))) score = (score * 0.55) + (Number(aiOutput.conversionProbability) * 0.45)

  const normalizedScore = clamp(score)
  const dealProbability = clamp(Number.isFinite(Number(aiOutput.conversionProbability)) ? aiOutput.conversionProbability : normalizedScore * 0.92)
  const urgencyLevel = hoursInactive >= 48 || (lead.stage === 'proposal' && hoursInactive >= 24) ? 'high' : hoursInactive >= 24 || objections.length ? 'medium' : 'low'
  const engagementLevel = normalizedScore >= 70 ? 'hot' : normalizedScore >= 40 ? 'warm' : 'cold'
  const riskLevel = dealProbability >= 70 && hoursInactive < 48 ? 'low' : hoursInactive >= 48 || negativeIntent ? 'high' : 'medium'
  const recommendedChannel = telegramMessages.length || lead.telegram ? 'Telegram' : lead.email ? 'Email' : 'Задача менеджеру'
  const nextBestAction = aiOutput.nextBestAction || aiOutput.followUpRecommendation || (urgencyLevel === 'high' ? `Срочно связаться через ${recommendedChannel} сегодня` : `Подготовить персональный follow-up через ${recommendedChannel}`)
  const idealContactTiming = urgencyLevel === 'high' ? 'в ближайшие 2 часа' : hoursInactive >= 24 ? 'сегодня до конца дня' : 'завтра утром'
  const recommendedCta = lead.stage === 'proposal' ? 'Подтвердить оплату или следующий шаг по КП' : lead.stage === 'booked' ? 'Зафиксировать итог встречи и дату решения' : 'Назначить короткий созвон / демо'
  const aiSummary = aiOutput.reasoning || aiOutput.content || (positiveIntent ? 'Клиент демонстрирует интерес и готов к следующему шагу.' : negativeIntent ? 'Есть риск потери: обнаружены сомнения или отложенное решение.' : 'AI оценил активность по CRM, Telegram, задачам, timeline и email.')
  const riskAlert = riskLevel === 'high' ? 'Риск потери через 48 часов' : riskLevel === 'medium' ? 'Нужен контроль следующего касания' : 'Клиент активно вовлечён'

  return { score: normalizedScore, temperature: engagementLevel, dealProbability, urgencyLevel, engagementLevel, riskLevel, aiSummary, nextBestAction, idealContactTiming, objectionsDetected: objections, recommendedCta, recommendedChannel, riskAlert }
}

function buildFollowUpDraft(context, intelligence) {
  const lead = context.lead || context
  const company = lead.company ? ` из ${lead.company}` : ''
  const message = intelligence.urgencyLevel === 'high'
    ? `Здравствуйте, ${lead.name}! Возвращаюсь к нашему обсуждению${company}: подскажите, актуально ли двинуться дальше сегодня? Могу быстро зафиксировать следующий шаг и ответить на вопросы.`
    : `Здравствуйте, ${lead.name}! Подготовил следующий шаг по вашему запросу${company}. Удобно сегодня коротко сверить детали и понять, что нужно для решения?`
  const scheduledFor = new Date(Date.now() + (intelligence.urgencyLevel === 'high' ? 2 : 24) * 36e5).toISOString()
  return { message, scheduledFor, followupType: intelligence.recommendedChannel === 'Email' ? 'email' : intelligence.recommendedChannel === 'Telegram' ? 'telegram' : 'reminder_task' }
}

module.exports = { buildFollowUpDraft, scoreLeadContext }
