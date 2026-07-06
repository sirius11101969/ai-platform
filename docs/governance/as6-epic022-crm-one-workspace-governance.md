# AS6 EPIC022 CRM ONE Workspace Governance

Stage: AS6_EPIC022_AS6_CRM_ONE_WORKSPACE_MIGRATION

Root cause:

- The previous Design System Adoption line changed CRM internal panels but did not make CRM a primary AS6 ONE workspace.

Failure class:

- AS6_CRM_OLD_SHELL_ADOPTION_DRIFT

Architecture rule:

- AS6_CRM_MUST_USE_AS6_ONE_WORKSPACE

Governance:

- Primary CRM entry must be `/as6-crm`.
- `/as6-crm` must mount through `AS6Shell`.
- The new workspace may reuse CRM API/runtime/data, but must not mount legacy `CRMPage` as the primary UI.
- Legacy rollback remains available through `/as6-sales` and `/crm-workspace`.
- Navigation must point CRM users to `/as6-crm`.
