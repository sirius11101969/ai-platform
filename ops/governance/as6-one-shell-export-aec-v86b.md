# AS6 ONE Shell Export AEC V86B

Failure classes:
- AS6_SHELL_EXPORT_INTERFACE_DRIFT
- AS6_ONE_SHELL_IMPORT_STYLE_MISMATCH
- AS6_ONE_ROUTE_BUILD_BLOCKED_BY_EXPORT_DRIFT

AEC rules:
- AS6OneShellAdapter must import AS6Shell according to the actual export style.
- Adapter repairs must not modify AS6OnePage business logic.
- Build validation must run after any shell import/interface repair.
