# AS6 V118 Change Plan

1. Restore frontend/src/pages/CommandCenterPage.jsx from reference commit 155975f.
2. Remove V115-V117 command-center patch files.
3. Remove command-center patch imports from main.jsx and index.html.
4. Keep App.jsx untouched except stale references cleanup.
5. Build frontend.
6. Deploy frontend/dist to nginx.
7. Validate health, runtime staging and secret scan.
8. Register diagnostics, coverage, governance, state and push.
