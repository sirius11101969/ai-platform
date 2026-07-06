# AS6 EPIC022 CRM ONE Workspace Migration Root Cause

Root cause:

- The old Design System Adoption line changed internal CRM panels, but did not translate CRM into the AS6 ONE shell as the primary workspace experience.

Repair:

- Added `/as6-crm` as the primary CRM living-space route.
- Added `AS6CrmShellAdapter` and `AS6CrmOneWorkspace`.
- Reused CRM API/runtime/live-data sources while avoiding legacy CRM UI as the main interface.
- Kept `/as6-sales` and `/crm-workspace` as legacy rollback paths.

Failure class:

- AS6_CRM_OLD_SHELL_ADOPTION_DRIFT

Architecture rule:

- AS6_CRM_MUST_USE_AS6_ONE_WORKSPACE
