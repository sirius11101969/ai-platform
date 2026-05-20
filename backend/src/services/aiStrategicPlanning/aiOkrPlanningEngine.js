const { withGovernance } = require('./governance')
function generateOkrs({ signals }) {
  return withGovernance({
    planningHorizon: 'quarterly',
    okrs: [
      { objective: 'Increase qualified pipeline velocity', keyResults: ['+20% qualified leads', '-15% approval SLA', '+10% conversion trend'], confidenceScore: 0.78 },
      { objective: 'Strengthen multi-team execution reliability', keyResults: ['>=95% roadmap milestone health', '<5% blocked strategic initiatives', '+12% organizational alignment'], confidenceScore: 0.74 },
    ],
    sourceSignals: signals,
  })
}
module.exports = { generateOkrs }
