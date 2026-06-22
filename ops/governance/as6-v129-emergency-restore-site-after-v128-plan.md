# AS6 V129 Emergency Restore Plan

1. Remove V128 public hard runtime script.
2. Remove V128 script tag from frontend/index.html.
3. Remove V128 diagnostics/governance artifacts if present.
4. Build frontend.
5. Deploy dist to nginx.
6. Validate health.
7. Commit and push emergency restore.
