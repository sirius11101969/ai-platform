function buildPipelineForecast(snapshot = {}) {
  const open = Number(snapshot.openPipelineValue || 0)
  const conversion = Number(snapshot.conversionRate || 0)
  return {
    projectedRevenueOpportunity: Number((open * Math.max(0.05, conversion)).toFixed(2)),
    stalledRevenue: Number((snapshot.stalledRevenue || 0).toFixed?.(2) || snapshot.stalledRevenue || 0),
  }
}
module.exports = { buildPipelineForecast }
