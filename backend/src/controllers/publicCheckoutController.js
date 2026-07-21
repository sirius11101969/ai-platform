const { getPublicPlanCatalog } = require('../plans')
const { getStagingPaymentSimulationDescriptor } = require('../services/stagingPaymentSimulationPolicy')

async function listPlans(_req, res, next) {
  try {
    const checkout = getStagingPaymentSimulationDescriptor()
    return res.json({
      plans: getPublicPlanCatalog(),
      billing: {
        type: 'one_time_upgrade',
        autoRenewal: false,
        notice: checkout.simulationOnly
          ? 'Тестовая активация в staging. Деньги не списываются и ЮKassa не вызывается.'
          : 'Разовая оплата за повышение тарифа. Автопродление не подключено.',
      },
      checkout,
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
