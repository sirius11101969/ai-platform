# AS6 EPIC022 CRM ONE Workspace AEC

AEC rule: AS6_CRM_MUST_USE_AS6_ONE_WORKSPACE

Controls:

- Block CRM primary-route changes if `/as6-crm` is missing from living-space registry.
- Block CRM primary UI if it mounts the old CRM shell as the main interface.
- Allow legacy CRM only as rollback or logic/data source.
- Require frontend production build, Architecture Guardian and Secret Scan before release.

Failure class:

- AS6_CRM_OLD_SHELL_ADOPTION_DRIFT
