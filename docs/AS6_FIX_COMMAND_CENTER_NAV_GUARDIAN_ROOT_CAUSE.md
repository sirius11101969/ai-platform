# AS6 Fix Command Center Nav Guardian Root Cause

- Failure: AS6 Architecture Guardian blocks merge with COMMAND_CENTER_NAV=FAIL.
- Root cause: primary AppShell navigation no longer exposes the exact Command Center navigation marker expected by the guardian.
- Build and Docker build pass; this is a governance/navigation-marker failure, not a frontend compilation failure.
- Resolution: restore explicit /command-center navigation item in AppShell while keeping AS6 ONE preview routes isolated.
- Page changed: global AppShell navigation marker only.
- Pages not changed: /crm, /crm-v2, /as6-one UI implementation.
