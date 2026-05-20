const { withGovernance } = require('./governance')
function generateQuarterlyPlan({ initiatives }) { return withGovernance({ priorities: (initiatives.initiatives || []).map((x, i) => ({ quarter: 'Q' + ((i % 4) + 1), initiative: x.strategicPriority, planningHorizon: '90_days' })) }) }
module.exports = { generateQuarterlyPlan }
