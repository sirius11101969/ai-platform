# AS6 Root Cause Addendum: Root Cause Deduplication

## ROOT_CAUSE_DUPLICATE_CLASS
Severity: medium
Symptoms: same root-cause class appears redundantly across catalog or registries.
Verification: run root cause deduplication controller.
Fix: consolidate only after preserving diagnostics, coverage, rollback, prevention, and evidence.
Rollback: keep both classes until manual review is complete.
Prevention: enforce AEC_ROOT_CAUSE_DUPLICATE_FORBIDDEN.

## ROOT_CAUSE_ALIAS_DRIFT
Severity: medium
Symptoms: multiple names appear to describe the same failure family.
Verification: inspect root-cause-aliases.tsv.
Fix: define canonical class and alias mapping.
Rollback: do not remove aliases automatically.
Prevention: enforce AEC_ROOT_CAUSE_ALIAS_FORBIDDEN.

## ROOT_CAUSE_ORPHAN_CLASS
Severity: high
Symptoms: root-cause class is not linked to diagnostics, coverage, registry, or governance.
Verification: inspect root-cause-orphans.tsv.
Fix: add missing registry/coverage/governance links.
Rollback: block promotion.
Prevention: enforce AEC_ROOT_CAUSE_ORPHAN_FORBIDDEN.

## ROOT_CAUSE_GOVERNANCE_BLOAT
Severity: medium
Symptoms: catalog grows without consolidation or lifecycle review.
Verification: inspect deduplication summary.
Fix: review classes and consolidate where safe.
Rollback: preserve original classes until review.
Prevention: run deduplication controller before L7+ promotion.
