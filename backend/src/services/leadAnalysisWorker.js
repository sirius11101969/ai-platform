const pool = require('../db/pool')
const crmModel = require('../models/crmModel')

let intervalId = null
let running = false

async function runLeadAnalysisCycle() {
  if (running) return
  running = true
  try {
    const workspaces = await pool.query(
      `SELECT DISTINCT wm.workspace_id, wm.user_id
         FROM workspace_members wm
         JOIN crm_leads l ON l.workspace_id = wm.workspace_id
        WHERE wm.role = 'owner'
        LIMIT 20`
    )
    for (const row of workspaces.rows) {
      await crmModel.analyzeWorkspaceLeads(row.user_id, row.workspace_id, Number(process.env.AI_LEAD_ANALYSIS_BATCH_SIZE || 10))
    }
  } catch (error) {
    console.error('AI lead analysis worker failed', error)
  } finally {
    running = false
  }
}

function startLeadAnalysisWorker() {
  if (process.env.AI_LEAD_ANALYSIS_WORKER === 'false' || intervalId) return
  const intervalMs = Number(process.env.AI_LEAD_ANALYSIS_INTERVAL_MS || 15 * 60 * 1000)
  intervalId = setInterval(runLeadAnalysisCycle, intervalMs)
  intervalId.unref?.()
}

module.exports = { runLeadAnalysisCycle, startLeadAnalysisWorker }
