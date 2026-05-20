function buildOrganizationalHealth({ snapshot }) {
  const score = Math.max(0, Math.min(100, Math.round((snapshot.workforceUtilization * 0.25) + ((100 - snapshot.executionPressure) * 0.35) + (snapshot.conversionTrendScore * 0.4))))
  return { organizationalHealthScore: score, teamUtilization: snapshot.workforceUtilization, executionPressure: snapshot.executionPressure }
}
module.exports = { buildOrganizationalHealth }
