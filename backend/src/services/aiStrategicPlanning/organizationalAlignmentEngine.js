const { withGovernance } = require('./governance')
function buildOrganizationalAlignment({ initiatives }) { return withGovernance({ departmentPlans: ['Sales','Marketing','Operations','Product'].map((d,i)=>({department:d,alignmentScore:0.84-i*0.05,topInitiative:initiatives.initiatives?.[0]?.strategicPriority||'N/A'})) }) }
module.exports = { buildOrganizationalAlignment }
