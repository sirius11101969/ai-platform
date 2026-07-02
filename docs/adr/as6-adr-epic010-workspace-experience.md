# ADR: AS6 EPIC010 Workspace Experience

ADR_STATUS=APPROVED

Context:
AS6 Operating System V1 is baselined. The next major EPIC must build on this baseline without mutating it unless a separate engineering decision is approved.

Decision:
EPIC010 will implement Workspace Experience as an application-layer experience on top of AS6 Operating System V1.

Rules:
- Build on AS6_OPERATING_SYSTEM_V1.
- Do not mutate Operating System V1 baseline during planning.
- Platform changes require separate ADR.
- Business modules do not own platform service lifecycle.
- Workspace Experience must use existing OS layers instead of creating parallel infrastructure.

Consequences:
- EPIC010 starts with Workspace Experience Foundation.
- Implementation begins only after Planning approval.
- Diagnostics must verify control scope and prevent historical artifact false positives.
