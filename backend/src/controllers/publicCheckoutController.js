const { getPublicPlanCatalog } = require('../plans')

async function listPlans(_req, res, next) {
  try {
    return res.json({
      plans: getPublicPlanCatalog(),
      billing: {
        type: 'one_time_upgrade',
        autoRenewal: false,
        notice: 'Разовая оплата за повышение тарифа. Автопродление не подключено.',
      },
    })
  } catch (error) {
    next(error)
  }
}

async function createCheckout(req, res, next) {
  try {
    return res.status(410).json({
      error: 'Для оплаты войдите в AS6 и выберите тариф для своего рабочего пространства',
      code: 'AUTHENTICATED_CHECKOUT_REQUIRED',
      checkoutUrl: '/pricing',
    })
  } catch (e) {
    next(e)
  }
}

module.exports = { createCheckout, listPlans }
