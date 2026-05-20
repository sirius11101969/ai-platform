function generate({ workspaceId }) { return [{ decisionKey:`exec-${workspaceId}-capital-plan`, owner:'CEO', decision:'Prioritize enterprise AI memory', approval:'pending_human_review', createdAt:new Date().toISOString() }] }
module.exports={ generate }
