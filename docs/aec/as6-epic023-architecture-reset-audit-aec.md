# AS6 EPIC023 Architecture Reset Audit AEC

Stage: AS6_EPIC023_ARCHITECTURE_RESET_AUDIT

AEC root cause:

- AS6_PARALLEL_UI_ARCHITECTURE_DRIFT

AEC controls:

- AS6_SINGLE_PRIMARY_SHELL_RULE: a public UI shell cannot be introduced or promoted without architecture approval and registry ownership.
- AS6_SINGLE_PUBLIC_CRM_ENTRYPOINT_RULE: CRM has one public primary entrypoint, `/as6-crm`.
- AS6_PRODUCTION_VISUAL_VALIDATION_REQUIRED_RULE: deploy validation must prove what users actually see on the public root and CRM routes.
- AS6_NO_NEW_SHELL_WITHOUT_ARCHITECTURE_APPROVAL_RULE: new shell/workspace surfaces are blocked unless the architecture reset registry is updated.

Prevention mapping:

- AS6_MULTIPLE_PRIMARY_SHELLS_GAP -> shell ownership registry and guardian rule.
- AS6_MULTIPLE_CRM_ENTRYPOINTS_GAP -> CRM route ownership registry and redirect plan.
- AS6_PRODUCTION_VISUAL_VALIDATION_GAP -> production screenshot/DOM validation after deploy.
- AS6_ROUTE_OWNERSHIP_DRIFT -> route map must be updated before route changes.

Rollback mapping:

- `/crm` and `/as6-sales` stay available as rollback until the reset plan validates redirects.
- CRM business logic remains in place and must not be deleted during route consolidation.

Result:

- AS6_EPIC023_ARCHITECTURE_RESET_AUDIT_AEC=PASS
