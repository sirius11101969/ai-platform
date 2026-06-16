# AS6 Autonomous Root Cause Deduplication Diagnostics

Registered diagnostic artifact:

- ops/bin/as6-autonomous-root-cause-deduplication-controller

New diagnostic checks added:

- root_cause_deduplication_controller
- root_cause_duplicate_detection
- root_cause_alias_detection
- root_cause_overlap_detection
- root_cause_unused_class_detection
- root_cause_orphan_class_detection
- root_cause_registry_consistency
- root_cause_governance_consistency
- root_cause_coverage_consistency
- root_cause_prevention_consistency
- root_cause_rollback_consistency
- root_cause_evidence_consistency

New error classes added:

- ROOT_CAUSE_DUPLICATE_CLASS
- ROOT_CAUSE_ALIAS_DRIFT
- ROOT_CAUSE_OVERLAP_DRIFT
- ROOT_CAUSE_UNUSED_CLASS
- ROOT_CAUSE_ORPHAN_CLASS
- ROOT_CAUSE_GOVERNANCE_BLOAT
- ROOT_CAUSE_REGISTRY_BLOAT
- ROOT_CAUSE_COVERAGE_BLOAT
- ROOT_CAUSE_PREVENTION_DRIFT
- ROOT_CAUSE_ROLLBACK_DRIFT

New AEC rules added:

- AEC_ROOT_CAUSE_DUPLICATE_FORBIDDEN
- AEC_ROOT_CAUSE_ALIAS_FORBIDDEN
- AEC_ROOT_CAUSE_OVERLAP_FORBIDDEN
- AEC_ROOT_CAUSE_ORPHAN_FORBIDDEN
- AEC_ROOT_CAUSE_UNUSED_FORBIDDEN
- AEC_ROOT_CAUSE_GOVERNANCE_ALIGNMENT_REQUIRED
- AEC_ROOT_CAUSE_COVERAGE_ALIGNMENT_REQUIRED
- AEC_ROOT_CAUSE_REGISTRY_ALIGNMENT_REQUIRED
