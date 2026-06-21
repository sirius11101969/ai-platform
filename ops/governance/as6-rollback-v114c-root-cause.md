# AS6 Rollback V114C Root Cause

V114C broke the interface after direct nginx dist deploy.
Root cause: forced production shell was mounted from main.jsx and copied directly into nginx static root.
Rollback: revert broken commit d5ad4a3, rebuild frontend, copy restored dist into nginx, reload nginx, validate health, commit and push.
