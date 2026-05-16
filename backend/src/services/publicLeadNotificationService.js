const axios = require('axios')
const emailService = require('./emailService')

const TELEGRAM_API_BASE = 'https://api.telegram.org'
const CRM_BASE_URL = 'https://www.as6.ru/crm'

function normalizeText(value) {
  const normalized = String(value || '').trim()
  return normalized || null
}

function hasSmtpConfig() {
  return Boolean(
    (process.env.SMTP_HOST || process.env.GMAIL_SMTP_USER) &&
    (process.env.SMTP_USER || process.env.GMAIL_SMTP_USER) &&
    (process.env.SMTP_PASS || process.env.GMAIL_SMTP_APP_PASSWORD)
  )
}

function getAdminEmail() {
  return normalizeText(process.env.ADMIN_EMAIL || process.env.SMTP_ADMIN_EMAIL || process.env.EMAIL_ADMIN || process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.GMAIL_FROM)
}

function buildCrmLink(leadId) {
  return `${CRM_BASE_URL}?leadId=${encodeURIComponent(leadId)}`
}

function formatValue(value) {
  return normalizeText(value) || '—'
}

function buildLandingLeadNotificationMessage({ lead, aiScore = 'в очереди', recommendedNextStep = 'Связаться с лидом и подтвердить удобное время демо.' }) {
  const crmLink = buildCrmLink(lead.id)
  return [
    'Новая заявка с сайта',
    '',
    `name: ${formatValue(lead.name)}`,
    `company: ${formatValue(lead.company)}`,
    `phone: ${formatValue(lead.phone)}`,
    `email: ${formatValue(lead.email)}`,
    `telegram: ${formatValue(lead.telegram)}`,
    `message: ${formatValue(lead.notes || lead.metadata?.message)}`,
    `priority: ${formatValue(aiScore)}`,
    `next step: ${formatValue(recommendedNextStep)}`,
    `CRM link: ${crmLink}`,
  ].join('\n')
}

async function sendTelegramNotification(text) {
  const token = normalizeText(process.env.TELEGRAM_BOT_TOKEN)
  const chatId = normalizeText(process.env.TELEGRAM_MANAGER_CHAT_ID)
  if (!token || !chatId) return null

  const { data } = await axios.post(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
  }, { timeout: Number(process.env.TELEGRAM_TIMEOUT_MS || 15000) })
  return data
}

async function sendEmailNotification({ userId, workspaceId, leadId, text }) {
  const to = getAdminEmail()
  const from = normalizeText(process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.GMAIL_FROM)
  if (!to || !hasSmtpConfig()) return null
  return emailService.sendEmailNow(userId, {
    workspaceId,
    leadId,
    to,
    from,
    subject: 'Новая заявка с сайта',
    text,
  })
}

async function notifyLandingLeadManager({ userId, workspaceId, lead, recommendedNextStep }) {
  const text = buildLandingLeadNotificationMessage({ lead, recommendedNextStep })
  if (process.env.TELEGRAM_MANAGER_CHAT_ID) {
    try {
      const telegramResult = await sendTelegramNotification(text)
      if (telegramResult) return telegramResult
    } catch (error) {
      console.warn('Landing lead Telegram notification failed, trying email fallback', error.message || error)
    }
  }
  return sendEmailNotification({ userId, workspaceId, leadId: lead.id, text })
}

module.exports = {
  buildCrmLink,
  buildLandingLeadNotificationMessage,
  notifyLandingLeadManager,
  _private: { getAdminEmail, hasSmtpConfig },
}
