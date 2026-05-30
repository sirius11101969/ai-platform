const aiSequenceService = require("./aiSequenceService")
const pool = require("../db/pool")

let isRunning = false

async function runAiSequenceSchedulerOnce() {
  if (isRunning) {
    return { skipped: true, reason: "scheduler_already_running" }
  }

  isRunning = true

  try {
    const result = await pool.query(`
      SELECT
        s.id,
        s.workspace_id,
        s.lead_id,
        s.status,
        s.current_step,
        s.template_name,
        s.started_at,
        s.metadata,
        l.name,
        l.status AS lead_status,
        l.stage AS lead_stage,
        l.metadata AS lead_metadata
      FROM ai_sequences s
      JOIN crm_leads l ON l.id = s.lead_id
      WHERE s.status = 'active'
        AND COALESCE(l.status, '') <> 'won'
        AND COALESCE(l.stage, '') <> 'won'
        AND COALESCE(l.metadata->>'payment_status', '') <> 'paid'
        AND (
          (COALESCE(s.current_step, 0) = 0 AND s.started_at <= NOW() - INTERVAL '5 minutes')
          OR (COALESCE(s.current_step, 0) = 1 AND COALESCE((s.metadata->>'last_step_at')::timestamptz, s.started_at) <= NOW() - INTERVAL '1440 minutes')
          OR (COALESCE(s.current_step, 0) = 2 AND COALESCE((s.metadata->>'last_step_at')::timestamptz, s.started_at) <= NOW() - INTERVAL '2880 minutes')
          OR (COALESCE(s.current_step, 0) = 3 AND COALESCE((s.metadata->>'last_step_at')::timestamptz, s.started_at) <= NOW() - INTERVAL '4320 minutes')
        )
      ORDER BY s.started_at ASC
      LIMIT 10
    `)

    const processed = []

    for (const sequence of result.rows) {
      try {
        const stepResult = await aiSequenceService.executeNextStep({
          workspaceId: sequence.workspace_id,
          leadId: sequence.lead_id
        })

        processed.push({
          sequenceId: sequence.id,
          leadId: sequence.lead_id,
          ok: true,
          result: stepResult
        })
      } catch (error) {
        processed.push({
          sequenceId: sequence.id,
          leadId: sequence.lead_id,
          ok: false,
          error: error.message
        })
      }
    }

    return { ok: true, count: processed.length, processed }
  } finally {
    isRunning = false
  }
}

function startAiSequenceScheduler() {
  const enabled = String(process.env.AI_SEQUENCE_SCHEDULER_ENABLED || "true") === "true"
  const intervalMs = Number(process.env.AI_SEQUENCE_SCHEDULER_INTERVAL_MS || 300000)

  if (!enabled) {
    console.info("[ai-sequence-scheduler] disabled")
    return
  }

  console.info("[ai-sequence-scheduler] started", { intervalMs })

  setInterval(() => {
    runAiSequenceSchedulerOnce()
      .then((result) => {
        console.info("[ai-sequence-scheduler] tick", {
          count: result.count || 0,
          skipped: result.skipped || false,
          reason: result.reason || null
        })
      })
      .catch((error) => {
        console.error("[ai-sequence-scheduler] failed", error)
      })
  }, intervalMs)
}

module.exports = {
  runAiSequenceSchedulerOnce,
  startAiSequenceScheduler
}
