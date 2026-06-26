import { AS6_RECOMMENDATIONS } from './recommendationRegistry'
import { AS6_RECOMMENDATION_STATUS } from './recommendationTypes'

export function buildProductRecommendation({ enabled = true } = {}) {
  if (!enabled) {
    return {
      status: AS6_RECOMMENDATION_STATUS.DISABLED,
      recommendation: null,
      reason: 'AS6_PRODUCT_RECOMMENDATIONS_DISABLED',
    }
  }

  return {
    status: AS6_RECOMMENDATION_STATUS.ACTIVE,
    recommendation: AS6_RECOMMENDATIONS.CHECK_PRIORITY_LEADS,
    reason: 'AS6_PRODUCT_INTELLIGENCE_FIRST_USER_VALUE_RECOMMENDATION',
  }
}
