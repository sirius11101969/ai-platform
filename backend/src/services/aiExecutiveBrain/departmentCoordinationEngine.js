function buildDepartmentCoordination({ snapshot }) {
  return [{ department: 'Sales', focus: 'Pipeline acceleration', status: snapshot.executionPressure > 70 ? 'stressed' : 'stable' }, { department: 'Workforce', focus: 'Utilization balancing', status: snapshot.workforceUtilization > 85 ? 'overloaded' : 'healthy' }]
}
module.exports = { buildDepartmentCoordination }
