function generate({conflicts=[]}){return conflicts.map((c)=>({escalationKey:`esc_${c.conflictKey}`,escalationLevel:c.severity==='high'?'executive':'director',action:'review_and_approve_coordination_plan'}))}
module.exports={generate}
