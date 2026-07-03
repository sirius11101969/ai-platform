# ADR: AS6 EPIC011 Application Foundation

ADR_STATUS=APPROVED

Context:
AS6 Operating System V1 and Workspace Experience V1 are baselined. Future modules require a stable application foundation layer.

Decision:
EPIC011 will create Application Foundation as an application-level infrastructure layer above Workspace Experience V1.

Rules:
- Build on AS6_OPERATING_SYSTEM_V1.
- Build on AS6_WORKSPACE_EXPERIENCE_V1.
- Do not mutate existing platform baselines.
- Business modules register through Application Foundation.
- Business modules do not own platform lifecycle.
- Platform baseline changes require separate EPIC and ADR.

Consequences:
- Slice 01 starts with Application Foundation Runtime.
- Future CRM and other modules must depend on Application Foundation.
