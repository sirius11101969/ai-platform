function suggestCrmActions({ objection, meetingIntent, leadScore = 0, pricingInterest = false }) {
  const suggestions = []
  if (meetingIntent?.intents?.includes('wants_demo')) suggestions.push('schedule_demo')
  if (meetingIntent?.intents?.includes('wants_pricing') || pricingInterest) suggestions.push('send_pricing')
  if (meetingIntent?.intents?.includes('wants_human_manager') || objection?.category === 'trust_objection') suggestions.push('assign_human_manager')
  if (objection?.category === 'timing_objection') suggestions.push('create_followup_task')
  if (leadScore >= 85) suggestions.push('mark_hot_lead')
  if (leadScore >= 90 && meetingIntent?.intents?.includes('wants_technical_consultation')) suggestions.push('escalate_enterprise_lead')
  return [...new Set(suggestions)].map((type) => ({ type, automated: false }))
}

module.exports = { suggestCrmActions }
