const { withGovernance } = require('./governance')
function generateGrowthPlan({ signals }) { return withGovernance({ scalingPriorities:['Segment expansion','Cross-sell automation','Partner motion'], growthPlanningRecommendations:[`Target ${Math.max(5, Math.round((signals.leadQuality||10)*0.3))} enterprise accounts`, 'Protect margin via approval-gated campaigns'] }) }
module.exports = { generateGrowthPlan }
