const PLAN_LIMITS = {
  free: { monthlyAiCredits: 100, leadsLimit: 100, teamMembersLimit: 1, workspacesLimit: 1, telegramAutomation: false, emailActions: false },
  starter: { monthlyAiCredits: 1000, leadsLimit: 1000, teamMembersLimit: 3, workspacesLimit: 1, telegramAutomation: true, emailActions: true },
  pro: { monthlyAiCredits: 5000, leadsLimit: 10000, teamMembersLimit: 10, workspacesLimit: 3, telegramAutomation: true, emailActions: true },
  business: { monthlyAiCredits: 20000, leadsLimit: 50000, teamMembersLimit: 50, workspacesLimit: 10, telegramAutomation: true, emailActions: true },
  enterprise: { monthlyAiCredits: 100000, leadsLimit: 250000, teamMembersLimit: 250, workspacesLimit: 1000, telegramAutomation: true, emailActions: true },
}

const PLAN_KEYS = Object.keys(PLAN_LIMITS)

const PLAN_CATALOG = {
  free: {
    key: 'free',
    name: 'Базовый',
    rank: 0,
    price: 0,
    currency: 'RUB',
    purchasable: false,
    description: 'Для знакомства с живым пространством AS6.',
  },
  starter: {
    key: 'starter',
    name: 'Старт',
    rank: 1,
    price: 3900,
    currency: 'RUB',
    purchasable: true,
    description: 'Для владельца и небольшой команды, которые собирают бизнес в одном контексте.',
  },
  pro: {
    key: 'pro',
    name: 'Про',
    rank: 2,
    price: 9900,
    currency: 'RUB',
    purchasable: true,
    featured: true,
    description: 'Для растущего бизнеса с несколькими рабочими пространствами и активной CRM.',
  },
  business: {
    key: 'business',
    name: 'Бизнес',
    rank: 3,
    price: 24900,
    currency: 'RUB',
    purchasable: true,
    description: 'Для компании с большой командой, объёмом данных и расширенной автоматизацией.',
  },
  enterprise: {
    key: 'enterprise',
    name: 'Корпоративный',
    rank: 4,
    price: null,
    currency: 'RUB',
    purchasable: false,
    description: 'Индивидуальные лимиты, внедрение, безопасность и сопровождение.',
  },
}

function getPlanLimits(plan = 'free') {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free
}

function normalizePlanKey(plan = 'free') {
  const value = String(plan || 'free').trim().toLowerCase()
  if (value === 'start') return 'starter'
  return PLAN_KEYS.includes(value) ? value : 'free'
}

function getPlanDefinition(plan = 'free') {
  const key = normalizePlanKey(plan)
  return { ...PLAN_CATALOG[key], limits: { ...getPlanLimits(key) } }
}

function getPublicPlanCatalog() {
  return PLAN_KEYS.map(getPlanDefinition)
}

function getPurchasablePlan(plan) {
  const definition = getPlanDefinition(plan)
  if (!definition.purchasable || !Number.isFinite(definition.price) || definition.price <= 0) {
    throw Object.assign(new Error('Этот тариф нельзя оплатить онлайн'), {
      statusCode: 400,
      code: 'PLAN_NOT_PURCHASABLE',
    })
  }
  return definition
}

function assertPlanUpgrade(currentPlan, targetPlan) {
  const current = getPlanDefinition(currentPlan)
  const target = getPurchasablePlan(targetPlan)
  if (target.rank <= current.rank) {
    throw Object.assign(new Error('Выберите тариф выше текущего'), {
      statusCode: 409,
      code: 'PLAN_UPGRADE_REQUIRED',
      details: { currentPlan: current.key, targetPlan: target.key },
    })
  }
  return target
}

module.exports = {
  PLAN_KEYS,
  PLAN_LIMITS,
  PLAN_CATALOG,
  getPlanLimits,
  normalizePlanKey,
  getPlanDefinition,
  getPublicPlanCatalog,
  getPurchasablePlan,
  assertPlanUpgrade,
}
