# AS6 EPIC023 Architecture Reset Audit Governance

Stage: AS6_EPIC023_ARCHITECTURE_RESET_AUDIT

Root cause:

- AS6_PARALLEL_UI_ARCHITECTURE_DRIFT

Failure classes:

- AS6_MULTIPLE_PRIMARY_SHELLS_GAP
- AS6_MULTIPLE_CRM_ENTRYPOINTS_GAP
- AS6_PRODUCTION_VISUAL_VALIDATION_GAP
- AS6_ROUTE_OWNERSHIP_DRIFT

Architecture rules:

- AS6_SINGLE_PRIMARY_SHELL_RULE
- AS6_SINGLE_PUBLIC_CRM_ENTRYPOINT_RULE
- AS6_PRODUCTION_VISUAL_VALIDATION_REQUIRED_RULE
- AS6_NO_NEW_SHELL_WITHOUT_ARCHITECTURE_APPROVAL_RULE

Governance decisions:

- `/` is the AS6 ONE branded landing and product shell.
- `/as6-crm` is the single public CRM workspace entrypoint.
- `/crm` is legacy redirect or rollback only; it must not remain primary navigation ownership.
- `/as6-sales` is legacy rollback only.
- `/as6-one` is an alias only if needed.
- Existing CRM business logic and diagnostics must be preserved during UI reset.

Controls required in next plan:

- Route ownership registry for every public route.
- Shell ownership registry with one primary shell.
- Workspace ownership registry with one primary CRM workspace.
- Production visual validation for `/`, `/as6-crm`, `/crm`, `/as6-sales`, `/as6-one`.
- Explicit redirect/rollback decisions before any deletion.

Release policy:

- No UI code changes were made in this audit.
- Any future route deletion or redirect requires separate validation, frontend build, Architecture Guardian and Secret Scan.
