const pool = require('../db/pool')
const crmModel = require('../models/crmModel')
const aiTaskModel = require('../models/aiTaskModel')
const emailService = require('./emailService')

const AI_TOOLS = [
  { name: 'send_email', title: 'Отправить email', description: 'Ставит письмо клиенту в email queue с вложениями и CRM логом.' },
  { name: 'create_task', title: 'Создать AI задачу', description: 'Создаёт AI task для генерации текста, ответа или follow‑up.' },
  { name: 'move_lead', title: 'Переместить лид', description: 'Меняет этап лида в CRM.' },
  { name: 'schedule_meeting', title: 'Запланировать встречу', description: 'Создаёт follow‑up событие встречи в CRM activity.' },
]

function normalizeToolName(name) {
  return String(name || '').trim().toLowerCase()
}

async function scheduleMeeting(userId, input = {}) {
  const leadId = input.leadId
  const startsAt = input.startsAt || input.date
  const title = input.title || 'Встреча с клиентом'
  if (!leadId || !startsAt) throw Object.assign(new Error('leadId and startsAt are required'), { statusCode: 400 })
  const lead = await crmModel.updateLead(userId, leadId, { status: input.moveToStatus || 'booked' })
  await pool.query(
    `INSERT INTO crm_activity(user_id, lead_id, type, title, body, metadata)
     VALUES($1, $2, 'meeting_scheduled', 'Встреча запланирована', $3, $4)`,
    [userId, leadId, `${title}: ${new Date(startsAt).toISOString()}`, { startsAt, title, source: 'ai_tool' }]
  )
  await pool.query(
    `INSERT INTO crm_activity(user_id, lead_id, type, title, body, metadata)
     VALUES($1, $2, 'follow_up_scheduled', 'Follow‑up запланирован', $3, $4)`,
    [userId, leadId, input.followUpNote || 'Проверить результат встречи и отправить follow‑up.', { startsAt, source: 'ai_tool' }]
  )
  return { lead, startsAt, title }
}

async function executeTool(userId, { tool, input = {} }) {
  const name = normalizeToolName(tool || input.tool)
  if (name === 'send_email') {
    return { tool: name, result: await emailService.enqueueEmail(userId, input) }
  }
  if (name === 'create_task') {
    return { tool: name, result: await aiTaskModel.createTask(userId, input) }
  }
  if (name === 'move_lead') {
    if (!input.leadId || !input.status) throw Object.assign(new Error('leadId and status are required'), { statusCode: 400 })
    return { tool: name, result: await crmModel.updateLead(userId, input.leadId, { status: input.status }) }
  }
  if (name === 'schedule_meeting') {
    return { tool: name, result: await scheduleMeeting(userId, input) }
  }
  throw Object.assign(new Error(`Unsupported AI tool: ${name}`), { statusCode: 400 })
}

module.exports = { AI_TOOLS, executeTool }
