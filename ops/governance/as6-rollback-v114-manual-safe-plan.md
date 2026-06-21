# AS6 Manual Safe Rollback V114 Plan

1. Abort failed revert state.
2. Remove V114 shell overlay component, CSS, diagnostics, controls and governance files.
3. Remove V114 shell imports from App.jsx and main.jsx.
4. Rebuild frontend.
5. Copy restored dist into nginx.
6. Reload nginx.
7. Validate health and secret scan.
8. Commit and push.
