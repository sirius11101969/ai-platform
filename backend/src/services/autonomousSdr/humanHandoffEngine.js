function buildHandoffRecommendation({ escalation, leadState, actions=[] }={}){ if(!escalation?.recommend) return null; return { required:true, priority:leadState==='enterprise_interest'?'high':'medium', ownerRole:actions.includes('technical_consultation')?'solutions_engineer':'account_executive', rationale:escalation.reasons } }
module.exports={ buildHandoffRecommendation }
