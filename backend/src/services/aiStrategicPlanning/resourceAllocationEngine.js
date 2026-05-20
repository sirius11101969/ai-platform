const { withGovernance } = require('./governance')
function allocateResources({ initiatives }) { return withGovernance({ allocations: (initiatives.initiatives||[]).map((x)=>({initiative:x.strategicPriority, engineeringPct:35, salesPct:25, opsPct:20, dataPct:20, resourcePressure:x.resourcePressure})) }) }
module.exports = { allocateResources }
