import { buildProductRecommendation } from './recommendationEngine'

export function getCommandCenterRecommendation(options = {}) {
  return buildProductRecommendation(options)
}
