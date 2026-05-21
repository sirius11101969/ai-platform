const { getOverview: getExecutiveOverview } = require('./aiExecutiveUnifiedDashboardService')
const { getSystemHealth } = require('./aiSystemHealthService')

async function getOverview({ workspaceId }) {
  const [executive, healthCenter] = await Promise.all([
    getExecutiveOverview({ workspaceId }),
    getSystemHealth({ workspaceId })
  ])

  const generatedAt = new Date().toISOString()
  const health = {
    READY: healthCenter?.summary?.readyCount || 0,
    DEGRADED: healthCenter?.summary?.degradedCount || 0,
    MISSING: healthCenter?.summary?.missingCount || 0,
  }

  const executiveFeed = {
    recentDecisions: (executive?.strategy?.latestPlan?.decisions || []).slice(0, 5),
    escalations: executive?.approvals?.openExecutiveEscalations || 0,
    bottlenecks: executive?.cards?.approvalBottlenecks || 0,
  }

  const liveMetrics = {
    workforceUtilization: executive?.cards?.workforceUtilization || 0,
    throughput: executive?.revenue?.forecast?.throughput || executive?.revenue?.throughput || 0,
    approvalQueue: executive?.approvals?.openQueue || 0,
  }

  const actions = [
    { label: 'Run Planning', status: 'disabled', note: 'Coming in v1.2' },
    { label: 'Run Simulation', status: 'disabled', note: 'Coming in v1.2' },
    { label: 'Run Revenue Review', status: 'disabled', note: 'Coming in v1.2' },
    { label: 'Run Coordination', status: 'disabled', note: 'Coming in v1.2' },
  ]

  const response = {
    commandCenterVersion: 'v1.1',
    generatedAt,
    overview: {
      organizationalHealthScore: executive?.cards?.organizationalHealthScore || 0,
      governanceMode: executive?.cards?.governanceMode || 'recommendation_only',
      generatedAt,
      recentStrategicActions: (executive?.governance?.strategicRisks || []).slice(0, 5),
    },
    health,
    executiveFeed,
    liveMetrics,
    actions,
    governance: executive?.governance || { mode: 'recommendation_only' },
  }

  console.info('command_center_loaded', { workspaceId, generatedAt })
  console.info('command_center_health_loaded', { workspaceId, health })
  console.info('command_center_feed_loaded', { workspaceId, feedSize: executiveFeed.recentDecisions.length })

  return response
}

module.exports = { getOverview }
