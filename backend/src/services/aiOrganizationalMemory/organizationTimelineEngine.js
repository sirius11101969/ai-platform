function build({ executiveDecisions = [], initiativeHistory = [], recommendationOutcomes = [] }) { return [
  ...executiveDecisions.map((x)=>({ eventType:'executive_decision', eventPayload:x, occurredAt:x.createdAt })),
  ...initiativeHistory.map((x)=>({ eventType:'initiative_update', eventPayload:x, occurredAt:new Date().toISOString() })),
  ...recommendationOutcomes.map((x)=>({ eventType:'recommendation_outcome', eventPayload:x, occurredAt:new Date().toISOString() })),
].sort((a,b)=>new Date(b.occurredAt)-new Date(a.occurredAt)) }
module.exports={ build }
