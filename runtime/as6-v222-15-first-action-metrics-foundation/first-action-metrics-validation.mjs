import { readFileSync } from 'node:fs'

const metricsSource = readFileSync('frontend/src/product-intelligence/metrics/metrics.js', 'utf8')
const indexSource = readFileSync('frontend/src/product-intelligence/index.js', 'utf8')

if (!metricsSource.includes('buildFirstActionMetrics')) throw new Error('buildFirstActionMetrics missing')
if (!metricsSource.includes('groupFirstActionsByMetadata')) throw new Error('groupFirstActionsByMetadata missing')
if (!indexSource.includes('buildFirstActionMetrics')) throw new Error('buildFirstActionMetrics export missing')

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
  const byAction = groupFirstActionsByMetadata(events, 'action')
  const byDestination = groupFirstActionsByMetadata(events, 'destination')

  return {
    firstActionCount: firstActions.length,
    hasFirstActionEvidence: firstActions.length > 0,
    byAction,
    byDestination,
  }
}

const events = [
  {
    event: 'command_center_first_action_clicked',
    category: 'first_action',
    metadata: { action: 'check_leads', destination: '/crm?filter=priority' },
  },
  {
    event: 'command_center_first_action_clicked',
    category: 'first_action',
    metadata: { action: 'review_revenue', destination: '/dashboard/revenue' },
  },
  {
    event: 'command_center_opened',
    category: 'navigation',
    metadata: {},
  },
]

const metrics = buildFirstActionMetrics(events)

if (metrics.firstActionCount !== 2) throw new Error('firstActionCount mismatch')
if (!metrics.hasFirstActionEvidence) throw new Error('hasFirstActionEvidence mismatch')
if (metrics.byAction.check_leads !== 1) throw new Error('check_leads count mismatch')
if (metrics.byAction.review_revenue !== 1) throw new Error('review_revenue count mismatch')
if (metrics.byDestination['/crm?filter=priority'] !== 1) throw new Error('crm destination count mismatch')
if (metrics.byDestination['/dashboard/revenue'] !== 1) throw new Error('revenue destination count mismatch')

console.log('AS6_FIRST_ACTION_METRICS_VALIDATION=PASS')
console.log(`FIRST_ACTION_COUNT=${metrics.firstActionCount}`)
console.log(`HAS_FIRST_ACTION_EVIDENCE=${metrics.hasFirstActionEvidence}`)
console.log(`ACTIONS=${Object.keys(metrics.byAction).join(',')}`)
console.log(`DESTINATIONS=${Object.keys(metrics.byDestination).join(',')}`)
