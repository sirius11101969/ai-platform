const PLAN_LIMITS = {
  free: { monthlyAiCredits: 100, leadsLimit: 100, teamMembersLimit: 1, telegramAutomation: false, emailActions: false },
  starter: { monthlyAiCredits: 1000, leadsLimit: 1000, teamMembersLimit: 3, telegramAutomation: true, emailActions: true },
  pro: { monthlyAiCredits: 5000, leadsLimit: 10000, teamMembersLimit: 10, telegramAutomation: true, emailActions: true },
  business: { monthlyAiCredits: 20000, leadsLimit: 50000, teamMembersLimit: 50, telegramAutomation: true, emailActions: true },
  enterprise: { monthlyAiCredits: 100000, leadsLimit: 250000, teamMembersLimit: 250, telegramAutomation: true, emailActions: true },
}

const PLAN_KEYS = Object.keys(PLAN_LIMITS)

function getPlanLimits(plan = 'free') {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free
}

module.exports = { PLAN_KEYS, PLAN_LIMITS, getPlanLimits }
