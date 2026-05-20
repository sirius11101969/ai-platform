function generate({dependencies=[]}){const blocked=dependencies.filter((d)=>d.status==='blocked').length;return {scalingReadiness:Math.max(0,85-blocked*12),status:blocked>2?'at_risk':'ready_with_approval'}}
module.exports={generate}
