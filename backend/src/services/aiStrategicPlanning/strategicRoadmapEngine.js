const { withGovernance } = require('./governance')
function generateRoadmap({ quarterlyPlan }) { return withGovernance({ roadmapRecommendations: (quarterlyPlan.priorities||[]).map((p,idx)=>({milestone:`M${idx+1}`,initiative:p.initiative,targetQuarter:p.quarter})) }) }
module.exports = { generateRoadmap }
