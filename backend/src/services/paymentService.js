const pool = require('../db/pool')
const axios = require('axios')
const revenueService = require('./revenueService')
const { issuePaymentCredits } = require('./execution/creditLedgerService')
const { createSandboxPayment, createMockPayment } = require('./providers/yookassaProvider')

async function loadProvider(provider, client = pool) {
  const r = await client.query('SELECT * FROM payment_providers WHERE provider = $1 LIMIT 1', [provider])
  const row = r.rows[0]
  if (!row || !row.enabled) throw Object.assign(new Error('payment provider is not enabled'), { statusCode: 400 })
  return row
}

async function createProviderPayment({ provider, amount, currency, metadata = {}, workspaceId }) {
  const mode = String(process.env.YOOKASSA_MODE || 'mock').toLowerCase()
  if (provider !== 'yookassa') {
    const paymentId = `mock_${provider}_${Date.now()}`
    return { paymentId, status: 'created', confirmationUrl: null, providerMetadata: { mode: 'mock' } }
  }
  if (mode === 'test') return createSandboxPayment({ amount, currency, metadata, workspaceId })
  if (mode === 'mock') return createMockPayment({ provider, amount, currency, metadata, workspaceId })
  if (['live', 'production', 'real', 'yookassa'].includes(mode)) {
    return createSandboxPayment({ amount, currency, metadata, workspaceId })
  }
  throw Object.assign(new Error(`unsupported YOOKASSA_MODE: ${mode}`), { statusCode: 400 })
}

async function createPayment({ workspaceId, provider, amount, currency, metadata = {} }) {
  const p = await loadProvider(provider)
  const normalizedCurrency = String(currency || p.currency).toUpperCase()
  const providerPayment = await createProviderPayment({
    provider,
    amount,
    currency: normalizedCurrency,
    metadata,
    workspaceId,
  })

  const created = await pool.query(
    `INSERT INTO payment_transactions(workspace_id, provider, external_payment_id, status, amount, currency, metadata, provider_metadata, checkout_url)
     VALUES($1::uuid,$2::text,$3::text,$4::text,$5::numeric,$6::text,$7::jsonb,$8::jsonb,$9::text) RETURNING *`,
    [workspaceId, provider, providerPayment.paymentId, providerPayment.status, Number(amount || 0), normalizedCurrency, JSON.stringify(metadata || {}), JSON.stringify(providerPayment.providerMetadata || {}), providerPayment.confirmationUrl]
  )
  console.info('payment_created', { workspaceId, provider, externalPaymentId: providerPayment.paymentId, mode: p.mode })
  return {
    transaction: created.rows[0],
    mode: p.mode,
    paymentId: providerPayment.paymentId,
    status: providerPayment.status,
    confirmationUrl: providerPayment.confirmationUrl,
  }
}

async function processWebhook({ workspaceId, provider, event, externalPaymentId, status, amount, currency, metadata = {} }) {
  const paymentProvider = await loadProvider(provider)
  const normalizedStatus = status || (event === 'payment.succeeded' ? 'paid' : status)

  if (paymentProvider.mode === 'mock' && provider === 'yookassa') {
    if (event !== 'payment.succeeded' || normalizedStatus !== 'paid' || !externalPaymentId) {
      throw Object.assign(new Error('invalid mock webhook payload'), { statusCode: 400 })
    }
  }
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    console.info('webhook_received', { workspaceId, provider, externalPaymentId, status: normalizedStatus, event })
    const existing = await client.query('SELECT * FROM payment_transactions WHERE provider=$1 AND external_payment_id=$2 LIMIT 1', [provider, externalPaymentId])
    const tx = existing.rows[0]
    if (!tx) {
      console.warn('webhook_payment_not_found', { workspaceId, provider, externalPaymentId })
      await client.query('COMMIT')
      return {
        ignored: true,
        reason: 'payment transaction not found',
        externalPaymentId,
      }
    }

    if (tx.status === 'paid') {
      await client.query('COMMIT')
      return { deduped: true, transaction: tx }
    }

    const next = await client.query(
      `UPDATE payment_transactions
       SET status=$1::text, metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb
       WHERE id=$3::uuid RETURNING *`,
      [normalizedStatus, JSON.stringify(metadata || {}), tx.id]
    )

    if (normalizedStatus === 'paid') {
      const targetWorkspaceId = workspaceId || tx.workspace_id

      const plan = String(
        metadata.plan ||
        tx.metadata?.plan ||
        'starter'
      ).toLowerCase()

      const planCredits = {
        starter: 60,
        pro: 180,
        business: 450
      }

      const credits =
        planCredits[plan] ||
        Math.max(1, Math.round(Number(amount || tx.amount || 0)))

      await revenueService.completePayment({ workspaceId: targetWorkspaceId, orderId: metadata.orderId }).catch(() => null)

      await issuePaymentCredits({
        workspaceId: targetWorkspaceId,
        provider,
        externalPaymentId,
        amount: credits,
        currency: currency || tx.currency,
      }, client)

      await client.query(
        `UPDATE workspaces
         SET plan=$1,
             updated_at=NOW()
         WHERE id=$2::uuid`,
        [plan, targetWorkspaceId]
      )

      console.info('workspace_plan_updated', { workspaceId: targetWorkspaceId, plan })
      console.info('payment_confirmed', { workspaceId: targetWorkspaceId, provider, externalPaymentId })
      console.info('credit_granted', { workspaceId: targetWorkspaceId, provider, externalPaymentId, credits })

      let paymentCrmLeadId = null

      try {
        const lead = await client.query(`
          SELECT id, user_id
          FROM crm_leads
          WHERE workspace_id = $1::uuid
            AND metadata->>'payment_id' = $2::text
          ORDER BY created_at DESC
          LIMIT 1
        `, [targetWorkspaceId, externalPaymentId])

        let paymentLead = lead.rows[0]

        if (!paymentLead) {
          const createdLead = await client.query(`
            INSERT INTO crm_leads(
              workspace_id,
              name,
              status,
              stage,
              source,
              value,
              metadata,
              notes,
              created_at,
              updated_at
            )
            VALUES(
              $1::uuid,
              $2::text,
              'booked',
              'booked',
              'payment',
              $3::numeric,
              jsonb_build_object(
                'payment_status', 'paid',
                'plan', $4::text,
                'credits', $5::int,
                'payment_id', $6::text,
                'provider', $7::text
              ),
              $8::text,
              NOW(),
              NOW()
            )
            RETURNING id, user_id
          `, [
            targetWorkspaceId,
            `Payment ${String(plan || 'plan').toUpperCase()} ${amount || tx.amount} ${currency || tx.currency}`,
            Number(amount || tx.amount || 0),
            plan,
            credits,
            externalPaymentId,
            provider,
            `Auto-created from paid ${provider} payment ${externalPaymentId}`
          ])

          paymentLead = createdLead.rows[0]
          console.info('crm_payment_lead_created', { workspaceId: targetWorkspaceId, leadId: paymentLead.id, externalPaymentId })
        }

        if (paymentLead) {
          const leadId = paymentLead.id
          paymentCrmLeadId = leadId
          const userId = paymentLead.user_id

          await client.query(`
            UPDATE crm_leads
            SET
              value = $1::numeric,
              metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
                'payment_status', 'paid',
                'plan', $2::text,
                'credits', $3::int,
                'payment_id', $4::text,
                'provider', $5::text
              ),
              updated_at = NOW()
            WHERE id = $6::uuid
          `, [
            Number(amount || tx.amount || 0),
            plan,
            credits,
            externalPaymentId,
            provider,
            leadId
          ])

          await client.query(`
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
              $3::uuid,
              'payment_received',
              '💰 Payment received',
              $4::text,
              'payments',
              $5::jsonb
            )
          `, [
            targetWorkspaceId,
            leadId,
            userId,
            `Paid ${amount || tx.amount} ${currency || tx.currency}\nPlan ${plan}\nCredits +${credits}`,
            JSON.stringify({
              paymentId: externalPaymentId,
              provider,
              plan,
              credits,
              amount: Number(amount || tx.amount || 0),
              currency: currency || tx.currency
            })
          ])

          console.info('crm_payment_synced', { workspaceId: targetWorkspaceId, leadId, externalPaymentId })
        }
      } catch (e) {
        console.error('crm_payment_sync_failed', e.message)
      }

      try {
        if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_MANAGER_CHAT_ID) {
          const paidAmount = Number(amount || tx.amount || 0)
          const paidCurrency = String(currency || tx.currency || '').toUpperCase()
          const providerLabel =
            provider === 'yookassa'
              ? 'YooKassa'
              : provider === 'stripe'
              ? 'Stripe'
              : provider === 'usdt_trc20'
              ? 'USDT TRC20'
              : provider

          const sourceLabel = metadata?.source || tx.metadata?.source || 'unknown'
          const customerEmail = metadata?.customerEmail || metadata?.email || tx.metadata?.customerEmail || tx.metadata?.email || '—'
          const usdRate = Number(process.env.USD_RUB_RATE || 90)
          const usdEquivalent =
            paidCurrency === 'USD' || paidCurrency === 'USDT'
              ? `$${paidAmount.toFixed(2)}`
              : paidCurrency === 'RUB'
              ? `≈ $${(paidAmount / usdRate).toFixed(2)} при USD/RUB ${usdRate}`
              : '—'

          const crmUrl = `${process.env.APP_URL || 'https://www.as6.ru'}/crm?workspaceId=${targetWorkspaceId}${paymentCrmLeadId ? `&leadId=${paymentCrmLeadId}` : ''}`

          const text = [
            '💰 НОВАЯ ОПЛАТА AS6',
            '',
            `📦 Тариф: ${plan.toUpperCase()}`,
            `🏦 Провайдер: ${providerLabel}`,
            `🌍 Валюта: ${paidCurrency}`,
            `💳 Сумма: ${paidAmount} ${paidCurrency}`,
            `💵 USD эквивалент: ${usdEquivalent}`,
            `⚡ Кредиты: +${credits}`,
            `👤 Email клиента: ${customerEmail}`,
            `📍 Источник: ${sourceLabel}`,
            `🏢 Workspace: ${targetWorkspaceId}`,
            `🧾 Payment: ${externalPaymentId}`
          ].join('\n')

          await axios.post(
            `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
              chat_id: process.env.TELEGRAM_MANAGER_CHAT_ID,
              text,
              reply_markup: {
                inline_keyboard: [[{ text: 'Открыть CRM карточку', url: crmUrl }]]
              }
            }
          )

          console.info('telegram_payment_notification_sent')
        }
      } catch (e) {
        console.error('telegram_payment_notification_failed', e.message)
      }
    }

    await client.query('COMMIT')
    return { deduped: false, transaction: next.rows[0] }
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally { client.release() }
}

async function getPaymentStatus({ workspaceId }) {
  const result = await pool.query(
    `SELECT id, provider, external_payment_id, status, amount, currency, metadata, created_at
     FROM payment_transactions
     WHERE workspace_id = $1::uuid
     ORDER BY created_at DESC
     LIMIT 1`,
    [workspaceId]
  )
  return result.rows[0] || null
}

async function getDashboard({ workspaceId }) {
  const [providers, transactions] = await Promise.all([
    pool.query('SELECT provider, currency, enabled, mode, created_at FROM payment_providers ORDER BY provider ASC'),
    pool.query('SELECT id, provider, external_payment_id, status, amount, currency, metadata, created_at FROM payment_transactions WHERE workspace_id=$1::uuid ORDER BY created_at DESC LIMIT 50', [workspaceId]),
  ])
  const health = providers.rows.map((p) => ({ provider: p.provider, status: p.enabled ? 'healthy' : 'disabled', mode: p.mode }))
  return { providers: providers.rows, transactions: transactions.rows, health }
}

module.exports = { createProviderPayment, createPayment, processWebhook, getPaymentStatus, getDashboard }
