function buildForecast({ snapshot }) { return { projectedRevenueExpansion: Math.round((snapshot.pipelineValue || 0) * 0.18), conversionTrend: snapshot.conversionTrendScore, scalingReadinessScore: snapshot.scalingReadinessScore || 0 } }
module.exports = { buildForecast }
