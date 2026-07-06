# AS6 EPIC023 Architecture Reset Implementation Governance

Stage: AS6_EPIC023_ARCHITECTURE_RESET_IMPLEMENTATION

Root cause:

- AS6_PARALLEL_UI_ARCHITECTURE_DRIFT

Failure classes:

- AS6_MULTIPLE_PRIMARY_SHELLS_GAP
- AS6_MULTIPLE_CRM_ENTRYPOINTS_GAP
- AS6_ROUTE_OWNERSHIP_DRIFT
- AS6_PRODUCTION_VISUAL_VALIDATION_GAP

Architecture rules:

- AS6_SINGLE_PRIMARY_SHELL_RULE: `/` is the only primary AS6 ONE branded shell entrypoint.
- AS6_SINGLE_PUBLIC_CRM_ENTRYPOINT_RULE: `/as6-crm` is the only public CRM Workspace entrypoint.
- AS6_PRODUCTION_VISUAL_VALIDATION_REQUIRED_RULE: route correctness is incomplete without production DOM/visual validation.
- AS6_NO_NEW_SHELL_WITHOUT_ARCHITECTURE_APPROVAL_RULE: new public shells require explicit architecture approval.

Policy:

- `/crm` must redirect to `/as6-crm`.
- `/as6-one` must remain an alias to `/` unless a future approved architecture change reopens it.
- `/as6-sales` remains rollback only and must not be primary navigation.
- CRM business logic must remain unchanged during route ownership alignment.
- Future stages must validate production visually for `/`, `/as6-crm`, `/crm`, `/as6-sales`, and `/as6-one`.
