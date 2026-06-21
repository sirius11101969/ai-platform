# AS6 V120 Change Plan

1. Replace CommandCenterPage.jsx with AppShell-compatible reference content.
2. Remove internal duplicate sidebar from CommandCenterPage.jsx.
3. Keep existing global AppShell sidebar.
4. Add isolated workspace-only reference CSS.
5. Suppress external Mission Control/Cockpit/root overlays only on the Command Center route.
6. Build frontend.
7. Deploy frontend/dist to nginx.
8. Validate health, runtime staging and secret scan.
9. Register diagnostics, coverage, governance, state, commit and push.
