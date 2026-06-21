# AS6 Rollback V114C Plan

1. Revert broken commit d5ad4a3.
2. Rebuild restored frontend.
3. Deploy restored frontend/dist directly to nginx.
4. Reload nginx.
5. Validate health and runtime staging.
6. Register rollback diagnostics.
7. Commit and push rollback.
