function detect({dependencies=[]}){return dependencies.filter((d)=>d.status==='blocked').map((d)=>({conflictKey:`conflict_${d.dependencyKey}`,severity:'high',reason:'dependency_blocked',requiresExecutiveArbitration:true}))}
module.exports={detect}
