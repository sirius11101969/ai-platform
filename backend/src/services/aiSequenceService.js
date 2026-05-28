const pool = require('../db/pool')

const DEFAULT_TEMPLATE = 'ai_secretary_followup_v1'

const STEPS = [
  {
    step: 1,
    channel: 'telegram',
    delayMinutes: 5,
    title: 'Welcome follow-up',
    text: 'Здравствуйте, {{name}}. Спасибо за интерес к AS6 AI CRM Platform. Могу показать демо и рассчитать подходящий тариф.'
  },
  {
    step: 2,
    channel: 'telegram',
    delayMinutes: 1440,
    title: 'Reminder follow-up',
    text: 'Добрый день, {{name}}. Напоминаю по вашему запросу. Могу отправить коммерческое предложение или ссылку на оплату.'
  },
  {
    step: 3,
    channel: 'email',
    delayMinutes: 2880,
    title: 'Commercial offer follow-up',
    text: 'Здравствуйте, {{name}}. Подготовили варианты внедрения AI-сотрудников для бизнеса. Готов отправить КП и демо-доступ.'
  },
  {
    step: 4,
    channel: 'telegram',
    delayMinutes: 4320,
    title: 'Payment reminder',
    text: 'Для новых клиентов доступна стартовая стоимость и бонусные кредиты. Могу активировать аккаунт после оплаты.'
  }
]

function renderTemplate(text, lead = {}) {
  return String(text || '')
    .replaceAll('{{name}}', lead.name || lead.company || 'коллега')
    .replaceAll('{{email}}', lead.email || '')
    .replaceAll('{{phone}}', lead.phone || '')
}

async function startSequence({ workspaceId, leadId, templateName = DEFAULT_TEMPLATE, metadata = {} }) {
  const existing = await pool.query(`
    SELECT *
    FROM ai_sequences
    WHERE workspace_id=$1::uuid
      AND lead_id=$2::uuid
      AND status IN ('active','paused')
    ORDER BY started_at DESC
    LIMIT 1
  `, [workspaceId, leadId])

  if (existing.rows[0]) {
    return { sequence: existing.rows[0], deduped: true }
  }

  const created = await pool.query(`
    INSERT INTO ai_sequences(
      workspace_id,
      lead_id,
      status,
      current_step,
      template_name,
      metadata,
      started_at
    )
    VALUES(
      $1::uuid,
      $2::uuid,
      'active',
      0,
      $3::text,
      $4::jsonb,
      NOW()
    )
    RETURNING *
  `, [workspaceId, leadId, templateName, JSON.stringify(metadata || {})])

  return { sequence: created.rows[0], deduped: false }
}

async function pauseSequence({ workspaceId, leadId, reason = 'manual' }) {
  const updated = await pool.query(`
    UPDATE ai_sequences
    SET status='paused',
        paused_at=NOW(),
        metadata=COALESCE(metadata,'{}'::jsonb) || jsonb_build_object('pause_reason',$3::text)
    WHERE workspace_id=$1::uuid
      AND lead_id=$2::uuid
      AND status='active'
    RETURNING *
  `, [workspaceId, leadId, reason])

  return updated.rows[0] || null
}

async function resumeSequence({ workspaceId, leadId }) {
  const updated = await pool.query(`
    UPDATE ai_sequences
    SET status='active',
        paused_at=NULL
    WHERE workspace_id=$1::uuid
      AND lead_id=$2::uuid
      AND status='paused'
    RETURNING *
  `, [workspaceId, leadId])

  return updated.rows[0] || null
}

async function stopSequence({ workspaceId, leadId, reason = 'completed' }) {
  const updated = await pool.query(`
    UPDATE ai_sequences
    SET status='stopped',
        completed_at=NOW(),
        metadata=COALESCE(metadata,'{}'::jsonb) || jsonb_build_object('stop_reason',$3::text)
    WHERE workspace_id=$1::uuid
      AND lead_id=$2::uuid
      AND status IN ('active','paused')
    RETURNING *
  `, [workspaceId, leadId, reason])

  return updated.rows[0] || null
}

async function executeNextStep({ workspaceId, leadId }) {
  const sequenceResult = await pool.query(`
    SELECT *
    FROM ai_sequences
    WHERE workspace_id=$1::uuid
      AND lead_id=$2::uuid
      AND status='active'
    ORDER BY started_at DESC
    LIMIT 1
  `, [workspaceId, leadId])

  const sequence = sequenceResult.rows[0]
  if (!sequence) return { skipped: true, reason: 'sequence_not_found' }

  const leadResult = await pool.query(`
    SELECT *
    FROM crm_leads
    WHERE workspace_id=$1::uuid
      AND id=$2::uuid
    LIMIT 1
  `, [workspaceId, leadId])

  const lead = leadResult.rows[0]
  if (!lead) return { skipped: true, reason: 'lead_not_found' }

  if (lead.status === 'won' || lead.stage === 'won' || lead.metadata?.payment_status === 'paid') {
    await stopSequence({ workspaceId, leadId, reason: 'payment_received' })
    return { stopped: true, reason: 'payment_received' }
  }

  const nextStepNumber = Number(sequence.current_step || 0) + 1
  const step = STEPS.find((item) => item.step === nextStepNumber)

  if (!step) {
    await stopSequence({ workspaceId, leadId, reason: 'all_steps_completed' })
    return { completed: true }
  }

  const message = renderTemplate(step.text, lead)

  await pool.query(`
    INSERT INTO lead_timeline_events(
      workspace_id,
      lead_id,
      user_id,
      event_type,
      title,
      body,
      source,
      metadata
    )
    VALUES(
      $1::uuid,
      $2::uuid,
      NULL,
      'ai_sequence_step',
      $3::text,
      $4::text,
      'ai_sequence',
      $5::jsonb
    )
  `, [
    workspaceId,
    leadId,
    `AI Sequence: ${step.title}`,
    message,
    JSON.stringify({
      step: step.step,
      channel: step.channel,
      templateName: sequence.template_name
    })
  ])

  const updated = await pool.query(`
    UPDATE ai_sequences
    SET current_step=$3::int,
        metadata=COALESCE(metadata,'{}'::jsonb) || jsonb_build_object(
          'last_step_at', NOW(),
          'last_step_channel', $4::text,
          'last_step_title', $5::text
        )
    WHERE id=$1::uuid
      AND workspace_id=$2::uuid
    RETURNING *
  `, [sequence.id, workspaceId, step.step, step.channel, step.title])

  return {
    sequence: updated.rows[0],
    step,
    message
  }
}

module.exports = {
  DEFAULT_TEMPLATE,
  STEPS,
  startSequence,
  pauseSequence,
  resumeSequence,
  stopSequence,
  executeNextStep
}
