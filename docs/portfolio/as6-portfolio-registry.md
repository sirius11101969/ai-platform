# AS6 Portfolio Registry

## Required Fields

- EPIC_ID
- TITLE
- STATUS
- CHANGE_TYPE
- BUSINESS_OBJECTIVE
- EXPECTED_VALUE
- OWNING_BASELINE
- TARGET_BASELINE
- VALIDATED_BASELINES
- AFFECTED_COMPONENTS
- ARCHITECTURE_IMPACT
- COMPATIBILITY_LEVEL
- DEPENDENCIES
- ADR
- EPIC_CHARTER
- DIAGNOSTICS_PLAN
- VALIDATION_PLAN
- DEFINITION_OF_DONE
- OBSERVABILITY_REQUIREMENTS
- ROLLBACK_STRATEGY
- SUCCESS_METRICS
- EXPECTED_RUNTIME_IMPACT
- RISK_LEVEL
- IMPLEMENTATION_STATUS
- BASELINE_STATUS

## EPIC011

EPIC_ID=AS6_EPIC011_APPLICATION_FOUNDATION
TITLE=AS6 Application Foundation
STATUS=SELECTED_FOR_PLANNING
CHANGE_TYPE=Application
BUSINESS_OBJECTIVE=Start building application-level capabilities on top of AS6 Operating System V1 and Workspace Experience V1.
EXPECTED_VALUE=Provide the first stable application foundation for future CRM, Documents, Finance, AI and client-facing modules.
OWNING_BASELINE=AS6_WORKSPACE_EXPERIENCE_V1
TARGET_BASELINE=AS6_APPLICATION_FOUNDATION_V1
VALIDATED_BASELINES=AS6_OPERATING_SYSTEM_V1,AS6_WORKSPACE_EXPERIENCE_V1
AFFECTED_COMPONENTS=Application Shell, Application Registry, Application Runtime, Workspace Integration
ARCHITECTURE_IMPACT=Extends existing baselines without mutating them.
COMPATIBILITY_LEVEL=Requires AS6_OPERATING_SYSTEM_V1 and AS6_WORKSPACE_EXPERIENCE_V1.
DEPENDENCIES=EPIC009,EPIC010
ADR=docs/adr/as6-adr-epic011-application-foundation.md
EPIC_CHARTER=docs/epic011/as6-epic011-application-foundation-charter.md
DIAGNOSTICS_PLAN=docs/epic011/as6-epic011-application-foundation-diagnostics-plan.md
VALIDATION_PLAN=docs/epic011/as6-epic011-application-foundation-validation-plan.md
DEFINITION_OF_DONE=docs/epic011/as6-epic011-application-foundation-definition-of-done.md
OBSERVABILITY_REQUIREMENTS=Runtime tracer, health snapshot, diagnostic registry, coverage registry.
ROLLBACK_STRATEGY=Restore to AS6_RESTORE_WORKSPACE_EXPERIENCE_V1_20260703T021612Z.
SUCCESS_METRICS=Application foundation runtime exists, no baseline mutation, diagnostics and controls pass.
EXPECTED_RUNTIME_IMPACT=Low
RISK_LEVEL=Medium
IMPLEMENTATION_STATUS=NOT_STARTED
BASELINE_STATUS=NOT_BASELINED
