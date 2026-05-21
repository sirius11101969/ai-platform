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

async function getTimeline({ workspaceId }) {
  const [executive, healthCenter] = await Promise.all([
    getExecutiveOverview({ workspaceId }),
    getSystemHealth({ workspaceId })
  ])

  const generatedAt = new Date().toISOString()
  const systemSeverity = (healthCenter?.summary?.degradedCount || 0) > 0 ? 'warning' : ((healthCenter?.summary?.missingCount || 0) > 0 ? 'warning' : 'info')
  const openQueue = executive?.approvals?.openQueue || 0
  const bottlenecks = executive?.cards?.approvalBottlenecks || 0
  const strategicRisks = executive?.governance?.strategicRisks || []
  const decisions = executive?.strategy?.latestPlan?.decisions || []
  const syncConflicts = executive?.coordination?.crossTeamSync?.openConflicts || 0

  const timeline = [
    { timestamp: generatedAt, event: `Executive dashboard refresh (health score ${executive?.cards?.organizationalHealthScore || 0})`, severity: 'info', source: 'Executive Dashboard' },
    { timestamp: generatedAt, event: `Approval queue open items: ${openQueue}; bottlenecks: ${bottlenecks}`, severity: openQueue > 0 ? 'warning' : 'info', source: 'Approval Queue' },
    { timestamp: generatedAt, event: `Strategy risks observed: ${strategicRisks.length}; latest decisions tracked: ${decisions.length}`, severity: strategicRisks.length > 0 ? 'warning' : 'info', source: 'Strategy' },
    { timestamp: generatedAt, event: `Coordination conflicts: ${syncConflicts}`, severity: syncConflicts > 0 ? 'critical' : 'info', source: 'Coordination' },
    { timestamp: generatedAt, event: `System health READY:${healthCenter?.summary?.readyCount || 0} DEGRADED:${healthCenter?.summary?.degradedCount || 0} MISSING:${healthCenter?.summary?.missingCount || 0}`, severity: systemSeverity, source: 'Executive Dashboard' },
  ]

  const recentEvents = [...timeline]
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    .slice(0, 20)

  console.info('command_center_navigation_loaded', { workspaceId, generatedAt })
  console.info('command_center_timeline_loaded', { workspaceId, items: timeline.length })
  console.info('command_center_events_loaded', { workspaceId, items: recentEvents.length })

  return { version: 'v1.1', generatedAt, timeline, recentEvents }
}

module.exports = { getOverview, getTimeline }
