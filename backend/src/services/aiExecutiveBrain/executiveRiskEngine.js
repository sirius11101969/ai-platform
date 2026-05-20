function detectRisks({ snapshot }) {
  const risks = []
  if ((snapshot.executionPressure || 0) > 75) risks.push({ riskType: 'execution_pressure', severity: 'high', details: 'Execution pressure is elevated.' })
  if ((snapshot.revenueConcentrationRisk || 0) > 60) risks.push({ riskType: 'revenue_concentration', severity: 'high', details: 'Revenue concentration risk increasing.' })
  if ((snapshot.organizationalHealthScore || 0) < 55) risks.push({ riskType: 'organizational_health', severity: 'medium', details: 'Organizational health needs intervention.' })
  return risks
}
module.exports = { detectRisks }
