const GOVERNANCE_FLAGS = {
  planning_only: true,
  no_autonomous_execution: true,
  no_customer_contact: true,
  no_pricing_changes: true,
  requires_human_approval: true,
}
function withGovernance(payload = {}) { return { ...payload, ...GOVERNANCE_FLAGS } }
module.exports = { GOVERNANCE_FLAGS, withGovernance }
