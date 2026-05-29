const { runCheckoutRecoveryOnce } = require('./aiCheckoutRecoveryService')

let isRunning = false

async function runCheckoutRecoverySchedulerOnce() {
  if (isRunning) {
    return {
      skipped: true,
      reason: 'checkout_recovery_scheduler_already_running'
    }
  }

  isRunning = true

  try {
    const result = await runCheckoutRecoveryOnce({
      limit: Number(process.env.AI_CHECKOUT_RECOVERY_LIMIT || 20)
    })

    return result
  } finally {
    isRunning = false
  }
}

function startCheckoutRecoveryScheduler() {
  const enabled = String(process.env.AI_CHECKOUT_RECOVERY_SCHEDULER_ENABLED || 'true') === 'true'
  const intervalMs = Number(process.env.AI_CHECKOUT_RECOVERY_INTERVAL_MS || 21600000)

  if (!enabled) {
    console.info('[ai-checkout-recovery-scheduler] disabled')
    return
  }

  console.info('[ai-checkout-recovery-scheduler] started', { intervalMs })

  setInterval(() => {
    runCheckoutRecoverySchedulerOnce()
      .then((result) => {
        console.info('[ai-checkout-recovery-scheduler] tick', {
          count: result.count || 0,
          skipped: result.skipped || false,
          reason: result.reason || null
        })
      })
      .catch((error) => {
        console.error('[ai-checkout-recovery-scheduler] failed', error)
      })
  }, intervalMs)
}

module.exports = {
  runCheckoutRecoverySchedulerOnce,
  startCheckoutRecoveryScheduler
}
