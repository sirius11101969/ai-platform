function buildConversionInsights(snapshot = {}) {
  return {
    conversionImprovementPotential: snapshot.conversionRate < 0.2 ? 'high' : 'moderate',
    recommendedCadenceDays: snapshot.stalledOpportunities > 0 ? 2 : 4,
    suggestion: 'Tune follow-up timing by lead stage and move high-intent leads to human-first outreach.',
  }
}
module.exports = { buildConversionInsights }
