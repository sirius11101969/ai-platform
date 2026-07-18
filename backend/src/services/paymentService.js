const pool = require('../db/pool')
const axios = require('axios')
const revenueService = require('./revenueService')
const { issuePaymentCredits } = require('./execution/creditLedgerService')
const { createSandboxPayment, createMockPayment, fetchYooKassaPayment } = require('./providers/yookassaProvider')
const { getPlanLimits, getPurchasablePlan } = require('../plans')

async function loadProvider(provider, client = pool) {
  const r = await client.query('SELECT * FROM payment_providers WHERE provider = $1 LIMIT 1', [provider])
  const row = r.rows[0]
  if (!row || !row.enabled) throw Object.assign(new Error('payment provider is not enabled'), { statusCode: 400 })
  if (provider === 'yookassa') {
    return { ...row, mode: String(process.env.YOOKASSA_MODE || row.mode || 'disabled').toLowerCase() }
  }
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

function assertMatchingPaymentValue(transaction, amount, currency) {
  const expectedAmount = Number(transaction.amount || 0)
  const actualAmount = Number(amount || 0)
  const expectedCurrency = String(transaction.currency || '').toUpperCase()
  const actualCurrency = String(currency || '').toUpperCase()
  if (Math.abs(expectedAmount - actualAmount) > 0.001 || expectedCurrency !== actualCurrency) {
    throw Object.assign(new Error('Сумма или валюта платежа не совпадает с заказом'), {
      statusCode: 409,
      code: 'PAYMENT_VALUE_MISMATCH',
    })
  }
}

async function verifyYooKassaWebhook({ transaction, externalPaymentId, allowMockVerification }) {
  const mode = String(process.env.YOOKASSA_MODE || 'mock').toLowerCase()
  if (mode === 'mock') {
    if (!allowMockVerification) {
      throw Object.assign(new Error('Публичный webhook недоступен в mock-режиме'), { statusCode: 403 })
    }
    return null
  }

  const verified = await fetchYooKassaPayment(externalPaymentId)
  if (String(verified.id || '') !== String(externalPaymentId || '') || verified.status !== 'succeeded' || verified.paid !== true) {
    throw Object.assign(new Error('YooKassa не подтвердила успешную оплату'), {
      statusCode: 409,
      code: 'PAYMENT_NOT_CONFIRMED',
    })
  }
  assertMatchingPaymentValue(transaction, verified.amount?.value, verified.amount?.currency)
  return verified
}

async function processWebhook({ workspaceId, provider, event, externalPaymentId, status, amount, currency, metadata = {}, allowMockVerification = false }) {
  const paymentProvider = await loadProvider(provider)
  let normalizedStatus = status || (event === 'payment.succeeded' ? 'paid' : status)
  let verifiedPayment = null

  if (paymentProvider.mode === 'mock' && provider === 'yookassa') {
    if (event !== 'payment.succeeded' || normalizedStatus !== 'paid' || !externalPaymentId) {
      throw Object.assign(new Error('invalid mock webhook payload'), { statusCode: 400 })
    }
  }

  const known = await pool.query('SELECT * FROM payment_transactions WHERE provider=$1 AND external_payment_id=$2 LIMIT 1', [provider, externalPaymentId])
  const knownTransaction = known.rows[0]
  if (!knownTransaction) {
    console.warn('webhook_payment_not_found', { workspaceId, provider, externalPaymentId })
    return { ignored: true, reason: 'payment transaction not found', externalPaymentId }
  }

  if (knownTransaction.status === 'paid') return { deduped: true, transaction: knownTransaction }

  if (provider === 'yookassa' && normalizedStatus === 'paid') {
    verifiedPayment = await verifyYooKassaWebhook({
      transaction: knownTransaction,
      externalPaymentId,
      allowMockVerification,
    })
    if (verifiedPayment) {
      normalizedStatus = 'paid'
      amount = Number(verifiedPayment.amount?.value)
      currency = verifiedPayment.amount?.currency
      metadata = { ...(metadata || {}), ...(verifiedPayment.metadata || {}) }
    }
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    console.info('webhook_received', { workspaceId, provider, externalPaymentId, status: normalizedStatus, event })
    const existing = await client.query('SELECT * FROM payment_transactions WHERE provider=$1 AND external_payment_id=$2 LIMIT 1 FOR UPDATE', [provider, externalPaymentId])
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
      const targetWorkspaceId = tx.workspace_id
      const isPlanCheckout = tx.metadata?.source === 'plan_checkout'
      const planDefinition = isPlanCheckout ? getPurchasablePlan(tx.metadata?.plan) : null
      const plan = planDefinition?.key || String(tx.metadata?.plan || metadata?.plan || 'starter').toLowerCase()

      if (isPlanCheckout) {
        assertMatchingPaymentValue(tx, planDefinition.price, planDefinition.currency)
      }

      const credits = isPlanCheckout
        ? getPlanLimits(plan).monthlyAiCredits
        : Math.max(1, Math.round(Number(amount || tx.amount || 0)))

      let ownerUserId = null
      if (isPlanCheckout) {
        const owner = await client.query('SELECT owner_user_id FROM workspaces WHERE id=$1::uuid LIMIT 1', [targetWorkspaceId])
        ownerUserId = owner.rows[0]?.owner_user_id
        if (!ownerUserId || (tx.metadata?.userId && String(tx.metadata.userId) !== String(ownerUserId))) {
          throw Object.assign(new Error('Владелец платежа не совпадает с владельцем пространства'), {
            statusCode: 409,
            code: 'PAYMENT_OWNER_MISMATCH',
          })
        }
      }

      await revenueService.completePayment({ workspaceId: targetWorkspaceId, orderId: metadata.orderId }).catch(() => null)

      await issuePaymentCredits({
        workspaceId: targetWorkspaceId,
        provider,
        externalPaymentId,
        amount: credits,
        currency: currency || tx.currency,
      }, client)

      if (isPlanCheckout) {
        await client.query('UPDATE users SET plan=$1 WHERE id=$2::uuid', [plan, ownerUserId])
        await client.query(
          `UPDATE workspaces
           SET plan=$1,
               updated_at=NOW()
           WHERE owner_user_id=$2::uuid`,
          [plan, ownerUserId]
        )
        console.info('account_plan_updated', { ownerUserId, workspaceId: targetWorkspaceId, plan })
      }
      console.info('payment_confirmed', { workspaceId: targetWorkspaceId, provider, externalPaymentId })
      console.info('credit_granted', { workspaceId: targetWorkspaceId, provider, externalPaymentId, credits })

      const sourceLeadId = tx.metadata?.leadId || metadata?.leadId || null

      if (sourceLeadId) {
        try {
          const sourceLead = await client.query(`
            UPDATE crm_leads
            SET
              status = 'won',
              stage = 'won',
              value = $1::numeric,
              metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
                'payment_status', 'paid',
                'payment_id', $2::text,
                'provider', $3::text,
                'paid_amount', $4::numeric,
                'paid_currency', $5::text,
                'paid_at', NOW()
              ),
              updated_at = NOW()
            WHERE id = $6::uuid
              AND workspace_id = $7::uuid
            RETURNING id, name, email
          `, [
            Number(amount || tx.amount || 0),
            externalPaymentId,
            provider,
            Number(amount || tx.amount || 0),
            currency || tx.currency,
            sourceLeadId,
            targetWorkspaceId
          ])

          if (sourceLead.rows[0]) {
            await client.query(`
              UPDATE crm_leads
              SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
                    'sequence_payment_status', 'paid'
                  ),
                  updated_at = NOW()
              WHERE id = $1::uuid
                AND workspace_id = $2::uuid
                AND metadata->>'sequence_payment_id' = $3::text
                AND metadata->>'payment_status' = 'paid'
            `, [sourceLeadId, targetWorkspaceId, externalPaymentId])

            const existingEvent = await client.query(`
              SELECT id
              FROM lead_timeline_events
              WHERE lead_id = $1::uuid
                AND event_type = 'payment_received'
                AND metadata->>'paymentId' = $2::text
              LIMIT 1
            `, [sourceLeadId, externalPaymentId])

            if (!existingEvent.rows[0]) {
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
                  NULL,
                  'payment_received',
                  '💰 Payment received from AI Secretary lead',
                  $3::text,
                  'payments',
                  $4::jsonb
                )
              `, [
                targetWorkspaceId,
                sourceLeadId,
                `Paid ${amount || tx.amount} ${currency || tx.currency}\nProvider ${provider}\nPayment ${externalPaymentId}\nCredits +${credits}`,
                JSON.stringify({
                  paymentId: externalPaymentId,
                  provider,
                  amount: Number(amount || tx.amount || 0),
                  currency: currency || tx.currency,
                  credits,
                  source: 'ai_secretary'
                })
              ])

              console.info('ai_secretary_payment_timeline_created', {
                workspaceId: targetWorkspaceId,
                leadId: sourceLeadId,
                externalPaymentId
              })
            } else {
              console.info('ai_secretary_payment_timeline_skipped_duplicate', {
                workspaceId: targetWorkspaceId,
                leadId: sourceLeadId,
                externalPaymentId
              })
            }

            console.info('ai_secretary_lead_marked_won', {
              workspaceId: targetWorkspaceId,
              leadId: sourceLeadId,
              externalPaymentId
            })
          }
        } catch (e) {
          console.error('ai_secretary_lead_payment_sync_failed', e.message)
        }
      }

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
          const customerName =
            metadata?.customerName ||
            metadata?.name ||
            metadata?.fullName ||
            tx.metadata?.customerName ||
            tx.metadata?.name ||
            tx.metadata?.fullName ||
            metadata?.leadName ||
            tx.metadata?.leadName ||
            '—'
          const customerEmail = metadata?.customerEmail || metadata?.email || tx.metadata?.customerEmail || tx.metadata?.email || '—'
          const customerPhone =
            metadata?.customerPhone ||
            metadata?.phone ||
            tx.metadata?.customerPhone ||
            tx.metadata?.phone ||
            '—'
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
            `👤 Клиент: ${customerName}`,
            `📧 Email: ${customerEmail}`,
            `📱 Телефон: ${customerPhone}`,
            `📍 Источник: ${sourceLabel}`,
            `🏢 Workspace: ${targetWorkspaceId}`,
            `🧾 Payment: ${externalPaymentId}`,
            sourceLeadId ? `🧠 Lead: ${sourceLeadId}` : null
          ].filter(Boolean).join('\n')

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

async function refreshPaymentStatus({ workspaceId }) {
  const current = await getPaymentStatus({ workspaceId })
  if (!current || current.provider !== 'yookassa' || ['paid', 'canceled', 'cancelled', 'failed'].includes(String(current.status || '').toLowerCase())) {
    return current
  }

  try {
    const verified = await fetchYooKassaPayment(current.external_payment_id)
    const providerStatus = String(verified.status || '').toLowerCase()

    if (providerStatus === 'succeeded' && verified.paid === true) {
      await processWebhook({
        workspaceId,
        provider: 'yookassa',
        event: 'payment.succeeded',
        externalPaymentId: current.external_payment_id,
        status: 'paid',
        amount: Number(verified.amount?.value),
        currency: verified.amount?.currency,
        metadata: verified.metadata || {},
      })
      return getPaymentStatus({ workspaceId })
    }

    if (providerStatus === 'canceled') {
      await processWebhook({
        workspaceId,
        provider: 'yookassa',
        event: 'payment.canceled',
        externalPaymentId: current.external_payment_id,
        status: 'canceled',
        amount: Number(verified.amount?.value),
        currency: verified.amount?.currency,
        metadata: verified.metadata || {},
      })
      return getPaymentStatus({ workspaceId })
    }
  } catch (error) {
    console.warn('payment_status_reconciliation_failed', {
      workspaceId,
      externalPaymentId: current.external_payment_id,
      message: error.message,
    })
  }

  return current
}

async function getDashboard({ workspaceId }) {
  const [providers, transactions] = await Promise.all([
    pool.query('SELECT provider, currency, enabled, mode, created_at FROM payment_providers ORDER BY provider ASC'),
    pool.query('SELECT id, provider, external_payment_id, status, amount, currency, metadata, created_at FROM payment_transactions WHERE workspace_id=$1::uuid ORDER BY created_at DESC LIMIT 50', [workspaceId]),
  ])
  const health = providers.rows.map((p) => ({ provider: p.provider, status: p.enabled ? 'healthy' : 'disabled', mode: p.mode }))
  return { providers: providers.rows, transactions: transactions.rows, health }
}

module.exports = { createProviderPayment, createPayment, processWebhook, getPaymentStatus, refreshPaymentStatus, getDashboard }
