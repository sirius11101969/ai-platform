const { withGovernance } = require('./governance')
function buildDependencyGraph({ initiatives }) { const nodes=(initiatives.initiatives||[]).map((x,i)=>({id:`init_${i+1}`,label:x.strategicPriority})); const edges=nodes.slice(1).map((n,i)=>({from:nodes[i].id,to:n.id,type:'sequence'})); return withGovernance({ nodes, edges, dependencyCount: edges.length }) }
module.exports = { buildDependencyGraph }
