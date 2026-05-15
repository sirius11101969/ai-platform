const pool = require('../db/pool')

const CRM_STATUSES = ['new', 'qualified', 'proposal', 'booked', 'won', 'lost']
const LEAD_COLUMNS = [
  'id',
  'user_id',
  'name',
  'email',
  'phone',
  'company',
  'status',
  'value',
  'source',
  'created_at',
  'updated_at',
]

const LEAD_SELECT = LEAD_COLUMNS.join(', ')

function leadSelect(alias) {
  return LEAD_COLUMNS.map((column) => `${alias}.${column}`).join(', ')
}

function normalizeLead(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    email: row.email || '',
    phone: row.phone || '',
    company: row.company || '',
    status: row.status,
    value: Number(row.value || 0),
    source: row.source || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    notes: Array.isArray(row.notes) ? row.notes.map(normalizeNote) : [],
  }
}

function normalizeNote(row) {
  if (!row) return null
  return {
    id: row.id,
    leadId: row.lead_id,
    userId: row.user_id,
    body: row.body,
    createdAt: row.created_at,
  }
}

function normalizeStatus(status) {
  const normalized = String(status || '').trim().toLowerCase()
  return CRM_STATUSES.includes(normalized) ? normalized : null
}

function normalizeOptionalText(value) {
  const normalized = String(value || '').trim()
  return normalized || null
}

function normalizeValue(value) {
  if (value === undefined || value === null || value === '') return 0
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount < 0) return null
  return amount
}

async function listLeads(userId) {
  const result = await pool.query(
    `SELECT ${leadSelect('l')},
            COALESCE(
              json_agg(
                json_build_object(
                  'id', n.id,
                  'lead_id', n.lead_id,
                  'user_id', n.user_id,
                  'body', n.body,
                  'created_at', n.created_at
                ) ORDER BY n.created_at DESC
              ) FILTER (WHERE n.id IS NOT NULL),
              '[]'::json
            ) AS notes
       FROM crm_leads AS l
       LEFT JOIN crm_notes AS n ON n.lead_id = l.id AND n.user_id = l.user_id
      WHERE l.user_id = $1
      GROUP BY l.id
      ORDER BY l.updated_at DESC, l.created_at DESC`,
    [userId]
  )

  return result.rows.map(normalizeLead)
}

async function createLead(userId, payload) {
  const name = normalizeOptionalText(payload.name)
  const email = normalizeOptionalText(payload.email)
  const phone = normalizeOptionalText(payload.phone)
  const company = normalizeOptionalText(payload.company)
  const source = normalizeOptionalText(payload.source) || 'manual'
  const status = normalizeStatus(payload.status) || 'new'
  const value = normalizeValue(payload.value)

  if (!name) {
    const error = new Error('Lead name is required')
    error.statusCode = 400
    throw error
  }

  if (!email && !phone) {
    const error = new Error('Lead email or phone is required')
    error.statusCode = 400
    throw error
  }

  if (value === null) {
    const error = new Error('Lead value must be a non-negative number')
    error.statusCode = 400
    throw error
  }

  const result = await pool.query(
    `INSERT INTO crm_leads(user_id, name, email, phone, company, status, value, source, contact, stage)
     VALUES($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($4, $3), $6)
     RETURNING ${LEAD_SELECT}`,
    [userId, name, email, phone, company, status, value, source]
  )

  return normalizeLead({ ...result.rows[0], notes: [] })
}

async function updateLead(userId, leadId, payload) {
  const updates = []
  const values = [userId, leadId]

  function addUpdate(column, value) {
    values.push(value)
    updates.push(`${column} = $${values.length}`)
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'name')) {
    const name = normalizeOptionalText(payload.name)
    if (!name) {
      const error = new Error('Lead name cannot be blank')
      error.statusCode = 400
      throw error
    }
    addUpdate('name', name)
  }

  for (const field of ['email', 'phone', 'company', 'source']) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      addUpdate(field, normalizeOptionalText(payload[field]))
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'status')) {
    const status = normalizeStatus(payload.status)
    if (!status) {
      const error = new Error(`Status must be one of: ${CRM_STATUSES.join(', ')}`)
      error.statusCode = 400
      throw error
    }
    addUpdate('status', status)
    addUpdate('stage', status)
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'value')) {
    const value = normalizeValue(payload.value)
    if (value === null) {
      const error = new Error('Lead value must be a non-negative number')
      error.statusCode = 400
      throw error
    }
    addUpdate('value', value)
  }

  if (!updates.length) {
    const lead = await findLead(userId, leadId)
    if (!lead) {
      const error = new Error('Lead not found')
      error.statusCode = 404
      throw error
    }
    return lead
  }

  updates.push('updated_at = NOW()')

  const result = await pool.query(
    `UPDATE crm_leads
        SET ${updates.join(', ')}, contact = COALESCE(phone, email, contact)
      WHERE user_id = $1 AND id = $2
      RETURNING ${LEAD_SELECT}`,
    values
  )

  if (!result.rows[0]) {
    const error = new Error('Lead not found')
    error.statusCode = 404
    throw error
  }

  return normalizeLead({ ...result.rows[0], notes: [] })
}

async function deleteLead(userId, leadId) {
  const result = await pool.query('DELETE FROM crm_leads WHERE user_id = $1 AND id = $2 RETURNING id', [userId, leadId])
  if (!result.rows[0]) {
    const error = new Error('Lead not found')
    error.statusCode = 404
    throw error
  }
}

async function findLead(userId, leadId) {
  const result = await pool.query(`SELECT ${LEAD_SELECT} FROM crm_leads WHERE user_id = $1 AND id = $2`, [userId, leadId])
  return result.rows[0] ? normalizeLead({ ...result.rows[0], notes: [] }) : null
}

async function createNote(userId, leadId, body) {
  const normalizedBody = normalizeOptionalText(body)
  if (!normalizedBody) {
    const error = new Error('Note body is required')
    error.statusCode = 400
    throw error
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const lead = await client.query('SELECT id FROM crm_leads WHERE id = $1 AND user_id = $2 FOR UPDATE', [leadId, userId])
    if (!lead.rows[0]) {
      const error = new Error('Lead not found')
      error.statusCode = 404
      throw error
    }

    const note = await client.query(
      `INSERT INTO crm_notes(lead_id, user_id, body)
       VALUES($1, $2, $3)
       RETURNING id, lead_id, user_id, body, created_at`,
      [leadId, userId, normalizedBody]
    )
    await client.query('UPDATE crm_leads SET updated_at = NOW() WHERE id = $1 AND user_id = $2', [leadId, userId])
    await client.query('COMMIT')
    return normalizeNote(note.rows[0])
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function getStats(userId) {
  const [summaryResult, statusResult, recentNotesResult] = await Promise.all([
    pool.query(
      `SELECT COUNT(*)::int AS total_leads,
              COALESCE(SUM(value), 0)::numeric AS pipeline_value,
              COALESCE(SUM(value) FILTER (WHERE status = 'won'), 0)::numeric AS won_value,
              COALESCE(SUM(value) FILTER (WHERE status IN ('new', 'qualified', 'proposal', 'booked')), 0)::numeric AS open_value
         FROM crm_leads
        WHERE user_id = $1`,
      [userId]
    ),
    pool.query(
      `SELECT status, COUNT(*)::int AS count, COALESCE(SUM(value), 0)::numeric AS value
         FROM crm_leads
        WHERE user_id = $1
        GROUP BY status`,
      [userId]
    ),
    pool.query(
      `SELECT crm_notes.id, crm_notes.lead_id, crm_notes.user_id, crm_notes.body, crm_notes.created_at,
              crm_leads.name AS lead_name
         FROM crm_notes
         JOIN crm_leads ON crm_leads.id = crm_notes.lead_id
        WHERE crm_notes.user_id = $1 AND crm_leads.user_id = $1
        ORDER BY crm_notes.created_at DESC
        LIMIT 5`,
      [userId]
    ),
  ])

  const byStatus = CRM_STATUSES.reduce((acc, status) => {
    acc[status] = { count: 0, value: 0 }
    return acc
  }, {})

  for (const row of statusResult.rows) {
    byStatus[row.status] = { count: row.count, value: Number(row.value || 0) }
  }

  const summary = summaryResult.rows[0] || {}
  return {
    totalLeads: Number(summary.total_leads || 0),
    pipelineValue: Number(summary.pipeline_value || 0),
    openValue: Number(summary.open_value || 0),
    wonValue: Number(summary.won_value || 0),
    byStatus,
    recentNotes: recentNotesResult.rows.map((row) => ({ ...normalizeNote(row), leadName: row.lead_name })),
  }
}

module.exports = {
  CRM_STATUSES,
  createLead,
  createNote,
  deleteLead,
  getStats,
  listLeads,
  updateLead,
}
