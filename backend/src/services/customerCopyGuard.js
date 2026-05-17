const COPY_GUARD_BLOCK_MESSAGE = 'Blocked by copy guard: internal AI context leak'

const FORBIDDEN_COPY_PATTERNS = [
  /Контекст:/i,
  /Плюсы:/i,
  /Минусы:/i,
  /Итог:/i,
  /ai_score/i,
  /aiScore/i,
  /ai_priority/i,
  /aiPriority/i,
  /ai_risk_level/i,
  /aiRiskLevel/i,
  /ai_scoring_reason/i,
  /aiScoringReason/i,
  /\+\d+/,
  /\b(intent|stage|priority|urgent|risk|confidence|score)\b/i,
]

const PRIORITY_INBOX_ACTION_COPY = {
  confirm_meeting: 'Здравствуйте! Подтверждаю встречу. Если время нужно изменить — просто напишите, я подстроюсь.',
  send_pricing: 'Здравствуйте! Могу отправить краткую информацию по тарифам и показать, какой вариант лучше подойдёт под вашу задачу.',
  needs_follow_up: 'Здравствуйте! Возвращаюсь к нашему диалогу по AS6 AI CRM. Актуально ещё обсудить автоматизацию продаж?',
  risk_follow_up: 'Здравствуйте! Возвращаюсь к нашему диалогу по AS6 AI CRM. Актуально ещё обсудить автоматизацию продаж?',
  urgent_follow_up: 'Здравствуйте! Возвращаюсь к нашему диалогу по AS6 AI CRM. Актуально ещё обсудить автоматизацию продаж?',
  meeting_follow_up: 'Здравствуйте! Возвращаюсь к нашей встрече по AS6 AI CRM. Удобно обсудить следующие шаги?',
  prepare_meeting: 'Здравствуйте! Подтверждаю встречу. Если время нужно изменить — просто напишите, я подстроюсь.',
  align_demo: 'Здравствуйте! Подтверждаю встречу. Если время нужно изменить — просто напишите, я подстроюсь.',
  reply_today: 'Здравствуйте! Спасибо за сообщение. Готов(а) помочь и ответить на вопросы по AS6 AI CRM.',
  contact_today: 'Здравствуйте! Возвращаюсь к вашему запросу по AS6 AI CRM. Удобно обсудить, какая автоматизация лучше подойдёт под вашу задачу?',
  deal_loss_risk: 'Здравствуйте! Возвращаюсь к нашему диалогу по AS6 AI CRM. Удобно обсудить следующие шаги?',
  nurture: 'Здравствуйте! Возвращаюсь к вашему запросу по AS6 AI CRM. Если тема ещё актуальна, буду рад(а) помочь.',
}

function containsForbiddenCustomerCopy(value) {
  const text = String(value || '')
  return FORBIDDEN_COPY_PATTERNS.some((pattern) => pattern.test(text))
}

function assertCustomerSafeText(value, context = {}) {
  const text = String(value || '').trim()
  if (!text || containsForbiddenCustomerCopy(text)) {
    console.warn('[copy-guard] blocked internal context leak', context)
    throw Object.assign(new Error(COPY_GUARD_BLOCK_MESSAGE), { statusCode: 400, code: 'COPY_GUARD_BLOCKED' })
  }
  return text
}

const assertSafeCustomerCopy = assertCustomerSafeText

function getPriorityInboxCustomerText({ nextBestActionCode = '', nextBestAction = '' } = {}) {
  const code = String(nextBestActionCode || '').trim()
  if (PRIORITY_INBOX_ACTION_COPY[code]) return PRIORITY_INBOX_ACTION_COPY[code]

  const action = String(nextBestAction || '').trim().toLowerCase()
  if (action.includes('подтвердить встреч') || action.includes('подготовиться к встреч') || action.includes('согласовать demo')) return PRIORITY_INBOX_ACTION_COPY.confirm_meeting
  if (action.includes('pricing') || action.includes('тариф') || action.includes('цен')) return PRIORITY_INBOX_ACTION_COPY.send_pricing
  if (action.includes('follow-up') || action.includes('связаться') || action.includes('ответить')) return PRIORITY_INBOX_ACTION_COPY.needs_follow_up
  return PRIORITY_INBOX_ACTION_COPY.nurture
}

function getSafePriorityInboxCustomerText(payload = {}) {
  const existing = payload.customerText || payload.customer_text
  if (existing && !containsForbiddenCustomerCopy(existing)) return String(existing).trim()
  return getPriorityInboxCustomerText({ nextBestActionCode: payload.nextBestActionCode || payload.next_best_action_code, nextBestAction: payload.nextBestAction || payload.next_best_action })
}

module.exports = {
  COPY_GUARD_BLOCK_MESSAGE,
  FORBIDDEN_COPY_PATTERNS,
  assertCustomerSafeText,
  assertSafeCustomerCopy,
  containsForbiddenCustomerCopy,
  getPriorityInboxCustomerText,
  getSafePriorityInboxCustomerText,
}
