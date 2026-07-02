# AS6 Tooling Maintenance Rule

RULE=AS6_GOVERNANCE_TOOLING_MAINTENANCE_RULE
CHANGE_CLASS=MAINTENANCE
SCOPE=TOOLING

Tooling-only maintenance that does not change architecture, runtime behavior, validation criteria, public contracts, persistent storage, baseline artifacts, or compatibility guarantees does not require a new baseline version, baseline re-validation, or baseline restore tag rotation.

Such changes shall be classified as:

- CHANGE_CLASS=MAINTENANCE
- SCOPE=TOOLING

Required invariants:

- BASELINE_IMPACT=NONE
- ARCHITECTURE_IMPACT=NONE
- EXECUTIVE_INTELLIGENCE_IMPACT=NONE
- RUNTIME_IMPACT=NONE
- VALIDATION_IMPACT=NONE
- COMPATIBILITY=UNCHANGED
- BASELINE_REVALIDATION_REQUIRED=FALSE
- BASELINE_TAG_ROTATION_REQUIRED=FALSE
- COMPATIBILITY_RECHECK_REQUIRED=FALSE
