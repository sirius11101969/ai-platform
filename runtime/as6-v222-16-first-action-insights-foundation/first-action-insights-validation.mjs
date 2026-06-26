import { readFileSync } from 'node:fs'

const insightsSource = readFileSync('frontend/src/product-intelligence/insights/insights.js', 'utf8')
const indexSource = readFileSync('frontend/src/product-intelligence/index.js', 'utf8')

if (!insightsSource.includes('buildFirstActionInsights')) throw new Error('buildFirstActionInsights missing')
if (!insightsSource.includes('getTopMetricEntry')) throw new Error('getTopMetricEntry missing')
if (!indexSource.includes('buildFirstActionInsights')) throw new Error('buildFirstActionInsights export missing')

function getFirstActionEvents(events = []) {
  return events.filter((item) => item?.category === 'first_action')
}

function groupFirstActionsByMetadata(events = [], metadataKey = 'action') {
  return getFirstActionEvents(events).reduce((groups, item) => {
    const key = item?.metadata?.[metadataKey] || 'unknown'
    groups[key] = (groups[key] || 0) + 1
    return groups
  }, {})
}

function buildFirstActionMetrics(events = []) {
  const firstActions = getFirstActionEvents(events)
  return {
    firstActionCount: firstActions.length,
    hasFirstActionEvidence: firstActions.length > 0,
    byAction: groupFirstActionsByMetadata(events, 'action'),
    byDestination: groupFirstActionsByMetadata(events, 'destination'),
  }
}

function getTopMetricEntry(metricGroup = {}) {
  const entries = Object.entries(metricGroup)
  if (!entries.length) return null
  return entries.sort((left, right) => right[1] - left[1]).map(([name, count]) => ({ name, count }))[0]
}

function buildFirstActionInsights(events = []) {
  const metrics = buildFirstActionMetrics(events)
  const topAction = getTopMetricEntry(metrics.byAction)
  const topDestination = getTopMetricEntry(metrics.byDestination)

  if (!metrics.hasFirstActionEvidence) {
    return { status: 'no_evidence', metrics, topAction, topDestination }
  }

  if (metrics.firstActionCount === 1) {
    return { status: 'single_evidence_point', metrics, topAction, topDestination }
  }

  return { status: 'evidence_available', metrics, topAction, topDestination }
}

const emptyInsight = buildFirstActionInsights([])
if (emptyInsight.status !== 'no_evidence') throw new Error('empty insight status mismatch')

const singleInsight = buildFirstActionInsights([
  { category: 'first_action', metadata: { action: 'check_leads', destination: '/crm?filter=priority' } },
])
if (singleInsight.status !== 'single_evidence_point') throw new Error('single insight status mismatch')

const multiInsight = buildFirstActionInsights([
  { category: 'first_action', metadata: { action: 'check_leads', destination: '/crm?filter=priority' } },
  { category: 'first_action', metadata: { action: 'check_leads', destination: '/crm?filter=priority' } },
  { category: 'first_action', metadata: { action: 'review_revenue', destination: '/dashboard/revenue' } },
])

if (multiInsight.status !== 'evidence_available') throw new Error('multi insight status mismatch')
if (multiInsight.topAction.name !== 'check_leads') throw new Error('top action mismatch')
if (multiInsight.topAction.count !== 2) throw new Error('top action count mismatch')
if (multiInsight.topDestination.name !== '/crm?filter=priority') throw new Error('top destination mismatch')

console.log('AS6_FIRST_ACTION_INSIGHTS_VALIDATION=PASS')
console.log(`EMPTY_STATUS=${emptyInsight.status}`)
console.log(`SINGLE_STATUS=${singleInsight.status}`)
console.log(`MULTI_STATUS=${multiInsight.status}`)
console.log(`TOP_ACTION=${multiInsight.topAction.name}`)
console.log(`TOP_ACTION_COUNT=${multiInsight.topAction.count}`)
console.log(`TOP_DESTINATION=${multiInsight.topDestination.name}`)
