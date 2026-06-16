# AS6 Root Cause Governance Bulk Repair

Purpose: repair mass root-cause registry/coverage drift discovered by root-cause governance diagnostics.

Detected pattern:

- AS6_ROOT_CAUSE_DIAGNOSTIC=PASS
- AS6_ROOT_CAUSE_REGISTRY=FAIL
- AS6_ROOT_CAUSE_COVERAGE=FAIL
- AS6_ROOT_CAUSE_PREVENTION=PASS
- AS6_ROOT_CAUSE_ROLLBACK=PASS

Runtime evidence:

- runtime/root-cause-governance-bulk/pre-root-cause-governance.out
- runtime/root-cause-governance-bulk/root-cause-governance-failures.tsv
