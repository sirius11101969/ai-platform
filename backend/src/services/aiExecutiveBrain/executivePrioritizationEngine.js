function assignPriorities(recommendations) { return recommendations.map((r, i) => ({ ...r, strategicPriority: i === 0 ? 'P1' : i < 3 ? 'P2' : 'P3' })) }
module.exports = { assignPriorities }
