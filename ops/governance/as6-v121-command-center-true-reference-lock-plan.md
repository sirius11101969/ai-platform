# AS6 V121 Change Plan

1. Rewrite CommandCenterPage.jsx as AppShell workspace-only reference page.
2. Do not render internal sidebar or internal logo panel.
3. Add React useEffect to hide exact external overlay root IDs with inline style while page is mounted.
4. Restore overlay root styles on unmount.
5. Add isolated CSS for the workspace reference layout.
6. Add diagnostics to prevent duplicate sidebar, global overlay reappearance and non-reference layout drift.
7. Build, deploy, validate, secret scan, commit and push.
