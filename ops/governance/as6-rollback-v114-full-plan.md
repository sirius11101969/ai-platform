# AS6 Full Rollback V114 Plan

1. Revert V114 shell rollout commit 457f23d.
2. Remove residual V114C untracked governance leftovers if present.
3. Rebuild frontend.
4. Deploy frontend/dist directly to nginx.
5. Reload nginx.
6. Validate health, runtime staging, secret scan, commit and push.
