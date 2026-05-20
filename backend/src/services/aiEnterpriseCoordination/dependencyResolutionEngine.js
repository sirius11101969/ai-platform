function generate({routes=[]}){return routes.map((r,i)=>({dependencyKey:`dep_${r.initiativeKey}`,initiativeKey:r.initiativeKey,status:i%2===0?'ready':'blocked',resolutionPlan:i%2===0?'monitor':'escalate_for_approval',dependencyPressure:r.dependencyPressure}))}
module.exports={generate}
