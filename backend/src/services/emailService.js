const crypto = require('crypto')
const fs = require('fs')
const net = require('net')
const path = require('path')
const tls = require('tls')
const axios = require('axios')
const pool = require('../db/pool')
const { renderTemplate } = require('./emailTemplates')

const STORAGE_ROOT = process.env.FILE_STORAGE_DIR || path.join(process.cwd(), 'storage', 'attachments')
const MAX_ATTACHMENT_BYTES = Number(process.env.MAX_ATTACHMENT_BYTES || 15 * 1024 * 1024)
const EMAIL_STATUSES = ['queued', 'sending', 'sent', 'failed']

function normalizeText(value) {
  const normalized = String(value || '').trim()
  return normalized || null
}

function ensureStorage() {
  fs.mkdirSync(STORAGE_ROOT, { recursive: true })
}

function sanitizeFileName(fileName) {
  return String(fileName || 'attachment.bin').replace(/[\\/\0]/g, '_').slice(0, 180)
}

function normalizeAttachment(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    workspaceId: row.workspace_id || null,
    leadId: row.lead_id,
    fileName: row.file_name,
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes || 0),
    storagePath: row.storage_path,
    createdAt: row.created_at,
  }
}

function normalizeEmail(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    workspaceId: row.workspace_id || null,
    leadId: row.lead_id,
    to: row.to_email,
    from: row.from_email,
    subject: row.subject,
    text: row.text_body || '',
    html: row.html_body || '',
    template: row.template || '',
    status: row.status,
    provider: row.provider || '',
    retryCount: Number(row.retry_count || 0),
    maxRetries: Number(row.max_retries || 3),
    error: row.error || '',
    openedAt: row.opened_at,
    trackingToken: row.tracking_token || '',
    sentAt: row.sent_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    attachments: Array.isArray(row.attachments) ? row.attachments.map(normalizeAttachment).filter(Boolean) : [],
  }
}

async function logActivity(client, userId, workspaceId, leadId, type, title, body = null, metadata = {}) {
  await client.query(
    `INSERT INTO crm_activity(user_id, workspace_id, lead_id, type, title, body, metadata)
     VALUES($1, $2, $3, $4, $5, $6, $7)`,
    [userId, workspaceId, leadId, type, title, body, metadata]
  )
}

async function logEmailStatus(client, email, status, error = null, metadata = {}) {
  await client.query(
    `INSERT INTO email_logs(user_id, workspace_id, email_id, recipient, subject, status, error, lead_id, metadata)
     VALUES($1, $9, $2, $3, $4, $5, $6, $7, $8)`,
    [email.userId, email.id, email.to, email.subject, status, error, email.leadId, metadata, email.workspaceId || email.workspace_id || null]
  )
}

async function getLead(userId, workspaceId, leadId, client = pool) {
  const result = await client.query('SELECT id, user_id, workspace_id, name, email, company, status, value, source, notes, metadata FROM crm_leads WHERE user_id = $1 AND workspace_id = $2 AND id = $3', [userId, workspaceId, leadId])
  return result.rows[0] || null
}

async function saveAttachment(userId, workspaceId, payload) {
  ensureStorage()
  const fileName = sanitizeFileName(payload.fileName || payload.name)
  const mimeType = normalizeText(payload.mimeType || payload.type) || 'application/octet-stream'
  const leadId = normalizeText(payload.leadId)
  const rawBase64 = String(payload.contentBase64 || payload.base64 || '').replace(/^data:[^;]+;base64,/, '')
  if (!fileName || !rawBase64) throw Object.assign(new Error('Attachment file and content are required'), { statusCode: 400 })
  const buffer = Buffer.from(rawBase64, 'base64')
  if (!buffer.length) throw Object.assign(new Error('Attachment content is empty'), { statusCode: 400 })
  if (buffer.length > MAX_ATTACHMENT_BYTES) throw Object.assign(new Error('Attachment is too large'), { statusCode: 413 })
  const id = crypto.randomUUID()
  const storagePath = path.join(STORAGE_ROOT, `${id}-${fileName}`)
  await fs.promises.writeFile(storagePath, buffer, { flag: 'wx' })
  const result = await pool.query(
    `INSERT INTO email_attachments(id, user_id, workspace_id, lead_id, file_name, mime_type, size_bytes, storage_path)
     VALUES($1, $2, $8, $3, $4, $5, $6, $7)
     RETURNING id, user_id, lead_id, file_name, mime_type, size_bytes, storage_path, created_at`,
    [id, userId, leadId || null, fileName, mimeType, buffer.length, storagePath, workspaceId]
  )
  return normalizeAttachment(result.rows[0])
}

async function listAttachments(userId, workspaceId, leadId = null) {
  const params = [userId, workspaceId]
  let clause = ''
  if (leadId) {
    params.push(leadId)
    clause = `AND (lead_id = $${params.length} OR lead_id IS NULL)`
  }
  const result = await pool.query(
    `SELECT id, user_id, lead_id, file_name, mime_type, size_bytes, storage_path, created_at
       FROM email_attachments
      WHERE user_id = $1 AND workspace_id = $2 ${clause}
      ORDER BY created_at DESC LIMIT 100`,
    params
  )
  return result.rows.map(normalizeAttachment)
}

async function listLeadEmails(userId, workspaceId, leadId) {
  const result = await pool.query(
    `SELECT e.*, COALESCE(json_agg(a.*) FILTER (WHERE a.id IS NOT NULL), '[]'::json) AS attachments
       FROM email_messages e
       LEFT JOIN email_message_attachments ema ON ema.email_id = e.id
       LEFT JOIN email_attachments a ON a.id = ema.attachment_id AND a.user_id = e.user_id
      WHERE e.user_id = $1 AND e.workspace_id = $2 AND e.lead_id = $3
      GROUP BY e.id
      ORDER BY e.created_at DESC`,
    [userId, workspaceId, leadId]
  )
  return result.rows.map(normalizeEmail)
}

async function enqueueEmail(userId, payload) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const workspaceId = payload.workspaceId
    const lead = await getLead(userId, workspaceId, payload.leadId, client)
    if (!lead) throw Object.assign(new Error('Lead not found'), { statusCode: 404 })
    const to = normalizeText(payload.to || lead.email)
    if (!to) throw Object.assign(new Error('Lead email is required'), { statusCode: 400 })
    const rendered = payload.template ? renderTemplate(payload.template, lead, payload) : payload
    const subject = normalizeText(rendered.subject)
    const text = normalizeText(rendered.text || rendered.body)
    const html = normalizeText(rendered.html)
    if (!subject || (!text && !html)) throw Object.assign(new Error('Email subject and body are required'), { statusCode: 400 })
    const from = normalizeText(payload.from || process.env.EMAIL_FROM || process.env.SMTP_FROM || process.env.GMAIL_FROM)
    const trackToken = crypto.randomBytes(24).toString('hex')
    const emailResult = await client.query(
      `INSERT INTO email_messages(user_id, workspace_id, lead_id, to_email, from_email, subject, text_body, html_body, template, status, provider, tracking_token, scheduled_at)
       VALUES($1, $12, $2, $3, $4, $5, $6, $7, $8, 'queued', $9, $10, COALESCE($11::timestamptz, NOW()))
       RETURNING *`,
      [userId, lead.id, to, from, subject, text || '', html || '', payload.template || null, chooseProvider(), trackToken, payload.scheduledAt || null, workspaceId]
    )
    const attachmentIds = Array.isArray(payload.attachmentIds) ? payload.attachmentIds.filter(Boolean) : []
    for (const attachmentId of attachmentIds) {
      const attached = await client.query('SELECT id, file_name FROM email_attachments WHERE id = $1 AND user_id = $2 AND workspace_id = $3', [attachmentId, userId, workspaceId])
      if (!attached.rows[0]) throw Object.assign(new Error('Attachment not found'), { statusCode: 404 })
      await client.query('INSERT INTO email_message_attachments(email_id, attachment_id) VALUES($1, $2) ON CONFLICT DO NOTHING', [emailResult.rows[0].id, attachmentId])
      await logActivity(client, userId, workspaceId, lead.id, 'attachment_added', 'Вложение добавлено к письму', attached.rows[0].file_name, { emailId: emailResult.rows[0].id, attachmentId })
    }
    await logActivity(client, userId, workspaceId, lead.id, 'email_queued', 'Письмо поставлено в очередь', subject, { emailId: emailResult.rows[0].id, to })
    await logEmailStatus(client, normalizeEmail(emailResult.rows[0]), 'queued')
    await client.query('COMMIT')
    if (payload.deliverAsync !== false) processEmailQueue().catch((error) => console.error('Email queue failed', error))
    return normalizeEmail(emailResult.rows[0])
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

function chooseProvider() {
  if (process.env.GMAIL_ACCESS_TOKEN) return 'gmail_api'
  return 'smtp'
}

function boundary() {
  return `----ai-platform-${crypto.randomBytes(12).toString('hex')}`
}

function encodeHeader(value) {
  return /[^\x20-\x7E]/.test(value) ? `=?UTF-8?B?${Buffer.from(value).toString('base64')}?=` : value
}

function addTrackingPixel(html, token) {
  const baseUrl = normalizeText(process.env.PUBLIC_API_URL || process.env.API_BASE_URL || process.env.APP_BASE_URL)
  if (!html || !baseUrl || !token) return html || ''
  const pixel = `<img src="${baseUrl.replace(/\/$/, '')}/api/email/open/${token}" width="1" height="1" alt="" style="display:none" />`
  return html.includes('</body>') ? html.replace('</body>', `${pixel}</body>`) : `${html}${pixel}`
}

async function loadEmail(emailId, client = pool) {
  const result = await client.query(
    `SELECT e.*, COALESCE(json_agg(a.*) FILTER (WHERE a.id IS NOT NULL), '[]'::json) AS attachments
       FROM email_messages e
       LEFT JOIN email_message_attachments ema ON ema.email_id = e.id
       LEFT JOIN email_attachments a ON a.id = ema.attachment_id
      WHERE e.id = $1
      GROUP BY e.id`,
    [emailId]
  )
  return normalizeEmail(result.rows[0])
}

async function buildMime(email) {
  const mixed = boundary()
  const alternative = boundary()
  const from = email.from || process.env.EMAIL_FROM || process.env.SMTP_FROM || process.env.GMAIL_FROM || process.env.SMTP_USER
  const headers = [
    `From: ${from}`,
    `To: ${email.to}`,
    `Subject: ${encodeHeader(email.subject)}`,
    'MIME-Version: 1.0',
    `Message-ID: <${email.id}@ai-platform.local>`,
    `Date: ${new Date().toUTCString()}`,
    `Content-Type: multipart/mixed; boundary="${mixed}"`,
  ]
  const parts = [headers.join('\r\n'), '']
  parts.push(`--${mixed}`)
  parts.push(`Content-Type: multipart/alternative; boundary="${alternative}"`)
  parts.push('')
  parts.push(`--${alternative}`)
  parts.push('Content-Type: text/plain; charset=utf-8')
  parts.push('Content-Transfer-Encoding: base64')
  parts.push('')
  parts.push(Buffer.from(email.text || '').toString('base64'))
  if (email.html) {
    parts.push(`--${alternative}`)
    parts.push('Content-Type: text/html; charset=utf-8')
    parts.push('Content-Transfer-Encoding: base64')
    parts.push('')
    parts.push(Buffer.from(addTrackingPixel(email.html, email.trackingToken)).toString('base64'))
  }
  parts.push(`--${alternative}--`)
  for (const attachment of email.attachments || []) {
    const data = await fs.promises.readFile(attachment.storagePath)
    parts.push(`--${mixed}`)
    parts.push(`Content-Type: ${attachment.mimeType}; name="${encodeHeader(attachment.fileName)}"`)
    parts.push('Content-Transfer-Encoding: base64')
    parts.push(`Content-Disposition: attachment; filename="${encodeHeader(attachment.fileName)}"`)
    parts.push('')
    parts.push(data.toString('base64').replace(/(.{76})/g, '$1\r\n'))
  }
  parts.push(`--${mixed}--`)
  return `${parts.join('\r\n')}\r\n`
}

function smtpRead(socket, timeoutMs = Number(process.env.SMTP_TIMEOUT_MS || 30000)) {
  return new Promise((resolve, reject) => {
    let data = ''
    const cleanup = () => {
      clearTimeout(timer)
      socket.off('data', onData)
      socket.off('error', onError)
      socket.off('timeout', onTimeout)
    }
    const onError = (error) => {
      cleanup()
      reject(error)
    }
    const onTimeout = () => {
      cleanup()
      socket.destroy()
      reject(new Error(`SMTP timeout after ${timeoutMs} ms`))
    }
    const onData = (chunk) => {
      data += chunk.toString('utf8')
      const lines = data.split(/\r?\n/).filter(Boolean)
      if (lines.length && /^\d{3} /.test(lines[lines.length - 1])) {
        cleanup()
        resolve(data)
      }
    }
    const timer = setTimeout(onTimeout, timeoutMs)
    socket.on('data', onData)
    socket.once('error', onError)
    socket.once('timeout', onTimeout)
  })
}

async function smtpCommand(socket, command, expected = /^[23]/) {
  if (command) socket.write(`${command}\r\n`)
  const response = await smtpRead(socket)
  if (!expected.test(response)) throw new Error(`SMTP error after ${command || 'connect'}: ${response}`)
  return response
}

function smtpConnect(port, host, secure, timeoutMs) {
  return new Promise((resolve, reject) => {
    const socket = secure ? tls.connect({ port, host, servername: host }) : net.connect(port, host)
    const cleanup = () => {
      clearTimeout(timer)
      socket.off('error', onError)
      socket.off('connect', onConnect)
      socket.off('secureConnect', onConnect)
    }
    const onError = (error) => {
      cleanup()
      reject(error)
    }
    const onConnect = () => {
      cleanup()
      socket.setTimeout(timeoutMs)
      resolve(socket)
    }
    const timer = setTimeout(() => {
      cleanup()
      socket.destroy()
      reject(new Error(`SMTP connection timeout after ${timeoutMs} ms`))
    }, timeoutMs)
    socket.once('error', onError)
    socket.once(secure ? 'secureConnect' : 'connect', onConnect)
  })
}

async function sendViaSmtp(email, raw) {
  const host = normalizeText(process.env.SMTP_HOST || (process.env.GMAIL_SMTP_USER ? 'smtp.gmail.com' : null))
  const port = Number(process.env.SMTP_PORT || 587)
  const user = normalizeText(process.env.SMTP_USER || process.env.GMAIL_SMTP_USER)
  const pass = normalizeText(process.env.SMTP_PASS || process.env.GMAIL_SMTP_APP_PASSWORD)
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465
  const timeoutMs = Number(process.env.SMTP_TIMEOUT_MS || 30000)
  if (!host || !user || !pass) throw new Error('SMTP/Gmail credentials are not configured')

  let socket = await smtpConnect(port, host, secure, timeoutMs)
  await smtpCommand(socket, null)
  await smtpCommand(socket, `EHLO ${process.env.SMTP_HELO || 'ai-platform.local'}`)
  if (!secure) {
    await smtpCommand(socket, 'STARTTLS')
    socket = tls.connect({ socket, servername: host })
    socket.setTimeout(timeoutMs)
    await smtpCommand(socket, `EHLO ${process.env.SMTP_HELO || 'ai-platform.local'}`)
  }
  await smtpCommand(socket, 'AUTH LOGIN', /^334/)
  await smtpCommand(socket, Buffer.from(user).toString('base64'), /^334/)
  await smtpCommand(socket, Buffer.from(pass).toString('base64'), /^235/)
  await smtpCommand(socket, `MAIL FROM:<${email.from || process.env.EMAIL_FROM || user}>`)
  await smtpCommand(socket, `RCPT TO:<${email.to}>`)
  await smtpCommand(socket, 'DATA', /^354/)
  socket.write(`${raw}\r\n.\r\n`)
  await smtpCommand(socket, null)
  await smtpCommand(socket, 'QUIT', /^[23]/).catch(() => null)
}

function toBase64Url(value) {
  return Buffer.from(value).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function sendViaGmailApi(raw) {
  const token = normalizeText(process.env.GMAIL_ACCESS_TOKEN)
  if (!token) throw new Error('GMAIL_ACCESS_TOKEN is not configured')
  await axios.post('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', { raw: toBase64Url(raw) }, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    timeout: Number(process.env.GMAIL_TIMEOUT_MS || 30000),
  })
}

async function deliverEmail(emailId) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const locked = await client.query("UPDATE email_messages SET status = 'sending', updated_at = NOW() WHERE id = $1 AND status IN ('queued','failed') RETURNING *", [emailId])
    if (!locked.rows[0]) {
      await client.query('ROLLBACK')
      return null
    }
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }

  const email = await loadEmail(emailId)
  const raw = await buildMime(email)
  try {
    if (email.provider === 'gmail_api') await sendViaGmailApi(raw)
    else await sendViaSmtp(email, raw)
    await pool.query("UPDATE email_messages SET status = 'sent', sent_at = NOW(), error = NULL, updated_at = NOW() WHERE id = $1", [emailId])
    await pool.query("INSERT INTO crm_activity(user_id, lead_id, type, title, body, metadata) VALUES($1, $2, 'email_sent', 'Письмо отправлено', $3, $4)", [email.userId, email.leadId, email.subject, { emailId, to: email.to, attachments: email.attachments.length }])
    if (email.attachments.length) {
      await pool.query("INSERT INTO crm_activity(user_id, lead_id, type, title, body, metadata) VALUES($1, $2, 'attachment_sent', 'Вложения отправлены', $3, $4)", [email.userId, email.leadId, email.attachments.map((item) => item.fileName).join(', '), { emailId, to: email.to, attachments: email.attachments.map((item) => item.id) }])
    }
    await logEmailStatus(pool, { ...email, id: emailId }, 'sent', null, { provider: email.provider, attachments: email.attachments.length })
    return { ...email, status: 'sent' }
  } catch (error) {
    const retry = email.retryCount + 1
    const failedPermanent = retry >= email.maxRetries
    const nextStatus = failedPermanent ? 'failed' : 'queued'
    await pool.query(
      `UPDATE email_messages
          SET status = $2, retry_count = retry_count + 1, error = $3, next_retry_at = CASE WHEN $2 = 'queued' THEN NOW() + ($4 || ' minutes')::interval ELSE next_retry_at END, updated_at = NOW()
        WHERE id = $1`,
      [emailId, nextStatus, error.message, Math.min(30, 2 ** retry)]
    )
    await pool.query("INSERT INTO crm_activity(user_id, lead_id, type, title, body, metadata) VALUES($1, $2, 'email_failed', 'Письмо не отправлено', $3, $4)", [email.userId, email.leadId, error.message, { emailId, to: email.to, retry, nextStatus }])
    await logEmailStatus(pool, { ...email, id: emailId }, 'failed', error.message, { retry, nextStatus })
    throw error
  }
}

async function sendEmailNow(userId, payload) {
  const queued = await enqueueEmail(userId, { ...payload, scheduledAt: null, deliverAsync: false })
  const sent = await deliverEmail(queued.id)
  return sent || loadEmail(queued.id)
}

let queueRunning = false
async function processEmailQueue(limit = 10) {
  if (queueRunning) return { skipped: true }
  queueRunning = true
  try {
    const result = await pool.query(
      `SELECT id FROM email_messages
        WHERE status = 'queued' AND scheduled_at <= NOW() AND (next_retry_at IS NULL OR next_retry_at <= NOW())
        ORDER BY created_at ASC LIMIT $1`,
      [limit]
    )
    const processed = []
    for (const row of result.rows) {
      try {
        processed.push(await deliverEmail(row.id))
      } catch (error) {
        console.error('Email delivery failed', row.id, error.message)
      }
    }
    return { processed: processed.filter(Boolean).length }
  } finally {
    queueRunning = false
  }
}

function startEmailQueueWorker() {
  const intervalMs = Number(process.env.EMAIL_QUEUE_INTERVAL_MS || 15000)
  setInterval(() => processEmailQueue().catch((error) => console.error('Email queue worker failed', error)), intervalMs).unref()
  processEmailQueue().catch((error) => console.error('Initial email queue failed', error))
}

async function markOpened(token) {
  const result = await pool.query(
    `UPDATE email_messages
        SET opened_at = COALESCE(opened_at, NOW()), updated_at = NOW()
      WHERE tracking_token = $1
      RETURNING user_id, lead_id, id, subject`,
    [token]
  )
  const row = result.rows[0]
  if (row) {
    await pool.query("INSERT INTO crm_activity(user_id, lead_id, type, title, body, metadata) VALUES($1, $2, 'email_opened', 'Клиент открыл письмо', $3, $4)", [row.user_id, row.lead_id, row.subject, { emailId: row.id }])
  }
}

module.exports = { EMAIL_STATUSES, deliverEmail, enqueueEmail, listAttachments, listLeadEmails, markOpened, processEmailQueue, renderTemplate, saveAttachment, sendEmailNow, startEmailQueueWorker }
