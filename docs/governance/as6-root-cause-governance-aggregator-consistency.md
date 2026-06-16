# AS6 Root Cause Governance Aggregator Consistency

Purpose: ensure final AS6_ROOT_CAUSE_GOVERNANCE_RESULT matches child evidence.

Detected pattern:

- child dimensions PASS
- final governance FAIL

Controller:

- ops/bin/as6-root-cause-governance-aggregator-consistency

Evidence:

- runtime/root-cause-governance-aggregator-consistency/latest.out
- runtime/root-cause-governance-aggregator-consistency/fail-source-matrix.tsv
