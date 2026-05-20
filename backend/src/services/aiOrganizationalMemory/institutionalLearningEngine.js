function build({ recommendationOutcomes = [], driftEvents = [] }) { const wins = recommendationOutcomes.filter((x)=>x.outcome==='improved').length; return [{ learningKey:'learning-core', insight:`${wins} recommendations improved outcomes`, driftRisk:driftEvents[0]?.driftLevel||'low', recommendation:'Keep human review checkpoints on all strategic decisions.' }] }
module.exports={ build }
