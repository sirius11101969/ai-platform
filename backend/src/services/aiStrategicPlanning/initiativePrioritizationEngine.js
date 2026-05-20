const { withGovernance } = require('./governance')
function prioritizeInitiatives({ okrPlan }) { return withGovernance({ initiatives: (okrPlan.okrs || []).map((o, i) => ({ strategicPriority: o.objective, expectedImpact: i === 0 ? 'high' : 'medium', dependencyCount: i + 2, organizationalAlignmentScore: 0.8 - i * 0.07, resourcePressure: i === 0 ? 'medium' : 'low', confidenceScore: o.confidenceScore })) }) }
module.exports = { prioritizeInitiatives }
