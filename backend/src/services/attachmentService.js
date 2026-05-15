const fs = require('fs')
const FormData = require('form-data')
const axios = require('axios')
const pool = require('../db/pool')
const { resolveMaterials } = require('./materialService')
const emailService = require('./emailService')
const { addTimelineEvent } = require('./timelineService')

const TELEGRAM_API_BASE = 'https://api.telegram.org'

async function getLead(userId, workspaceId, leadId) {
  const result = await pool.query('SELECT * FROM crm_leads WHERE id = $1 AND user_id = $2 AND workspace_id = $3', [leadId, userId, workspaceId])
  const lead = result.rows[0]
  if (!lead) throw Object.assign(new Error('Lead not found'), { statusCode: 404 })
  return lead
}

function getTelegramToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_TOKEN
  if (!token) throw Object.assign(new Error('Telegram bot token is not configured'), { statusCode: 503 })
  return token
}

async function sendTelegramMaterial(chatId, material) {
  const form = new FormData()
  form.append('chat_id', String(chatId))
  form.append(material.telegramField, fs.createReadStream(material.path), material.fileName)
  form.append('caption', material.title)
  const { data } = await axios.post(`${TELEGRAM_API_BASE}/bot${getTelegramToken()}/${material.telegramMethod}`, form, {
    headers: form.getHeaders(),
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: Number(process.env.TELEGRAM_FILE_TIMEOUT_MS || 30000),
  })
  return data
}

async function recordAttachment(client, { userId, workspaceId, leadId, material, channel, status, error = null, metadata = {} }) {
  const result = await client.query(
    `INSERT INTO lead_attachments(workspace_id, lead_id, user_id, material_key, file_name, mime_type, file_type, channel, status, storage_path, metadata, sent_at, error)
     VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CASE WHEN $9 = 'sent' THEN NOW() ELSE NULL END, $12)
     RETURNING *`,
    [workspaceId, leadId, userId, material.key, material.fileName, material.mimeType, material.fileType, channel, status, material.path, metadata, error]
  )
  return result.rows[0]
}

async function sendLeadAttachments({ userId, workspaceId, leadId, channel, materialKeys = [], email = {} }) {
  const lead = await getLead(userId, workspaceId, leadId)
  const materials = resolveMaterials(materialKeys)
  const deliveryChannel = channel || (lead.telegram_id || lead.metadata?.telegramChatId ? 'telegram' : 'email')

  if (deliveryChannel === 'telegram') {
    const chatId = lead.metadata?.telegramChatId || lead.telegram_id
    if (!chatId) throw Object.assign(new Error('Lead has no Telegram chat id'), { statusCode: 400 })
    const sent = []
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      for (const material of materials) {
        const response = await sendTelegramMaterial(chatId, material)
        const record = await recordAttachment(client, { userId, workspaceId, leadId, material, channel: 'telegram', status: 'sent', metadata: { telegramMessageId: response?.result?.message_id || null } })
        sent.push(record)
      }
      await addTimelineEvent(client, { workspaceId, leadId, userId, eventType: 'attachments_sent', title: 'Материалы отправлены', body: materials.map((item) => item.fileName).join(', '), source: 'telegram', metadata: { channel: 'telegram', materialKeys } })
      await client.query('COMMIT')
      return { channel: 'telegram', attachments: sent }
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  const attachmentIds = []
  for (const material of materials) {
    const attachment = await emailService.registerExistingAttachment(userId, workspaceId, { leadId, fileName: material.fileName, mimeType: material.mimeType, sizeBytes: material.sizeBytes, storagePath: material.path, metadata: { materialKey: material.key } })
    attachmentIds.push(attachment.id)
  }
  const sentEmail = await emailService.sendEmailNow(userId, {
    workspaceId,
    leadId,
    to: email.to || lead.email,
    subject: email.subject || 'Материалы AS6 AI CRM Platform',
    text: email.text || 'Здравствуйте! Направляем материалы по AS6 AI CRM Platform.',
    html: email.html || '',
    attachmentIds,
  })
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    for (const material of materials) await recordAttachment(client, { userId, workspaceId, leadId, material, channel: 'email', status: 'sent', metadata: { emailId: sentEmail.id, to: sentEmail.to } })
    await addTimelineEvent(client, { workspaceId, leadId, userId, eventType: 'attachments_sent', title: 'Материалы отправлены', body: materials.map((item) => item.fileName).join(', '), source: 'email', metadata: { emailId: sentEmail.id, materialKeys } })
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
  return { channel: 'email', email: sentEmail, attachmentIds }
}

async function listLeadAttachments(userId, workspaceId, leadId) {
  await getLead(userId, workspaceId, leadId)
  const result = await pool.query('SELECT * FROM lead_attachments WHERE workspace_id = $1 AND lead_id = $2 ORDER BY created_at DESC LIMIT 100', [workspaceId, leadId])
  return result.rows
}

module.exports = { listLeadAttachments, sendLeadAttachments }
