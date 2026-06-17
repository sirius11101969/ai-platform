# AS6 Diagnostics-First Operating Standard Runbook

Canonical sequence:
1. Run diagnostics.
2. Identify root cause.
3. Patch only the minimal required surface.
4. Register new artifacts/checks/controls/errors/AEC rules.
5. Refresh diagnostic status registry.
6. Run secret scan.
7. Run as6-diagnose-all-watch.
8. Update AS6_PROJECT_STATE.md.
9. Commit and push after green result.
