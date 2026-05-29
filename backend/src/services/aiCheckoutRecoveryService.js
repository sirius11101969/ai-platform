const pool = require('../db/pool')

const RECOVERY_MESSAGE = `Здравствуйте, {{name}}. Вижу, что оплата ещё не завершена. Если удобно, могу помочь с запуском AS6 AI CRM Platform и сохранить для вас стартовые условия.`

function render(text, lead = {}) {
  return String(text || '').replaceAll('{{name}}', lead.name || lead.email || 'коллега')
}

async function runCheckoutRecoveryOnce({ workspaceId = null, limit = 20 } = {}) {
  const params = []
  let workspaceFilter = ''

  if (workspaceId) {
    params.push(workspaceId)
    workspaceFilter = `AND l.workspace_id = $${params.length}::uuid`
  }

  params.push(Number(limit || 20))

  const result = await pool.query(`
    SELECT
      l.id AS lead_id,
      l.workspace_id,
      l.name,
      l.email,
      l.metadata,
      pt.external_payment_id,
      pt.checkout_url,
      pt.created_at AS payment_created_at
    FROM crm_leads l
    JOIN payment_transactions pt
      ON pt.metadata->>'leadId' = l.id::text
    WHERE pt.status IN ('pending','created')
      AND COALESCE(l.metadata->>'payment_status', '') <> 'paid'
      AND COALESCE(l.status, '') <> 'won'
      AND COALESCE(l.stage, '') <> 'won'
      AND COALESCE(l.metadata->>'checkout_recovery_status', '') <> 'sent'
      ${workspaceFilter}
    ORDER BY pt.created_at ASC
    LIMIT $${params.length}
  `, params)

  const processed = []

  for (const row of result.rows) {
    const message = render(RECOVERY_MESSAGE, row)

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
        'checkout_recovery_followup',
        '💬 AI Checkout Recovery follow-up',
        $3::text,
        'ai_checkout_recovery',
        $4::jsonb
      )
    `, [
      row.workspace_id,
      row.lead_id,
      `${message}\n\nСсылка оплаты: ${row.checkout_url || '-'}`,
      JSON.stringify({
        paymentId: row.external_payment_id,
        checkoutUrl: row.checkout_url,
        recoveryStep: 1,
        source: 'ai_checkout_recovery'
      })
    ])

    await pool.query(`
      UPDATE crm_leads
      SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
            'checkout_recovery_status', 'sent',
            'checkout_recovery_step', 1,
            'checkout_recovery_payment_id', $3::text,
            'checkout_recovery_last_at', NOW()
          ),
          updated_at = NOW()
      WHERE id = $1::uuid
        AND workspace_id = $2::uuid
    `, [row.lead_id, row.workspace_id, row.external_payment_id])

    processed.push({
      leadId: row.lead_id,
      workspaceId: row.workspace_id,
      paymentId: row.external_payment_id,
      checkoutUrl: row.checkout_url,
      message
    })
  }

  return {
    ok: true,
    count: processed.length,
    processed
  }
}

module.exports = {
  runCheckoutRecoveryOnce
}
