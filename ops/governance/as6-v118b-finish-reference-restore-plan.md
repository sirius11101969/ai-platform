# AS6 V118B Change Plan

1. Restore CommandCenterPage.jsx from reference commit 155975f.
2. Remove all temporary command-center CSS/JS patch layers.
3. Remove stale imports and final CSS link.
4. Stage changes safely with git add -A.
5. Re-diagnose.
6. Build frontend.
7. Deploy dist to nginx.
8. Validate health, runtime staging and secret scan.
9. Commit and push.
