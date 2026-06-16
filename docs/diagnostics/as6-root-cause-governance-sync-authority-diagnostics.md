# AS6 Root Cause Governance Sync Authority Diagnostics

Added checks:

- root_cause_governance_sync_authority_controller
- root_cause_registry_sync
- root_cause_coverage_sync
- root_cause_state_sync
- root_cause_governance_sync
- root_cause_route_registry_matrix
- root_cause_route_coverage_matrix
- root_cause_route_state_matrix
- root_cause_registry_generation
- root_cause_coverage_generation
- root_cause_governance_autofix

Added root cause classes:

- ROOT_CAUSE_REGISTRY_SYNC_DRIFT
- ROOT_CAUSE_COVERAGE_SYNC_DRIFT
- ROOT_CAUSE_STATE_SYNC_DRIFT
- ROOT_CAUSE_GOVERNANCE_SYNC_DRIFT
- ROOT_CAUSE_ROUTE_REGISTRATION_GAP
- ROOT_CAUSE_ROUTE_COVERAGE_GAP
- ROOT_CAUSE_ROUTE_STATE_GAP
- ROOT_CAUSE_CANONICAL_MAP_DRIFT

Added AEC rules:

- AEC_ROOT_CAUSE_REGISTRY_SYNC_REQUIRED
- AEC_ROOT_CAUSE_COVERAGE_SYNC_REQUIRED
- AEC_ROOT_CAUSE_STATE_SYNC_REQUIRED
- AEC_ROOT_CAUSE_GOVERNANCE_SYNC_REQUIRED
- AEC_ROOT_CAUSE_ROUTE_CANONICAL_MAP_REQUIRED
