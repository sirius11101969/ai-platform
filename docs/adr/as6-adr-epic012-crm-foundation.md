# ADR: AS6 EPIC012 CRM Foundation

ADR_STATUS=APPROVED

Decision:
AS6_EPIC012_CRM_FOUNDATION is an APPLICATION EPIC.

It must use:
- AS6_OPERATING_SYSTEM_V1
- AS6_WORKSPACE_EXPERIENCE_V1
- AS6_APPLICATION_FOUNDATION_V1

It must not mutate platform baselines.

Rationale:
EPIC009, EPIC010 and EPIC011 completed the stable platform foundation. CRM Foundation is the first application-level foundation and should validate platform usage without changing platform contracts.

Architecture:
CRM Foundation is a declarative application layer composed through Application Foundation contracts, registries and capabilities.

Consequence:
Future CRM modules can be implemented independently after CRM Foundation establishes contracts and diagnostics.
