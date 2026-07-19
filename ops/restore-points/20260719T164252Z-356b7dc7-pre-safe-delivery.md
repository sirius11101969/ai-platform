# AS6 UI Restore Point

- id: 20260719T164252Z-356b7dc7-pre-safe-delivery
- timestamp_utc: 20260719T164252Z
- mode: pre-safe-delivery
- label: as6-safe-delivery-v1
- branch: feat/as6-safe-delivery-v1
- commit: 356b7dc73edba405db9084a1d68f11e1e8a0d3e6
- short_commit: 356b7dc7
- readiness: 99%
- status: KNOWN_GOOD_CANDIDATE

## Restore command

Safe local restore:

    ops/bin/as6-restore-to-tag AS6_RESTORE_356b7dc7

Direct git restore:

    git fetch origin --tags
    git checkout main
    git reset --hard 356b7dc73edba405db9084a1d68f11e1e8a0d3e6

## Protected UI files snapshot
9cdb54fc8ece7248b194e04ea1617e33f8573a1cd6624326496c15f94dbc15f4  frontend/src/pages/CommandCenterPage.jsx
11c8fd4551afa13419bc4c106bda60a80a6fbf59385ee7ddbecef19fbdb6d560  frontend/src/components/AppShell.jsx
d52a094d9a20e380f204169654895b12b038001f379aaf2987eb922a1e347599  frontend/src/main.jsx
b14128c2a0d108b8ab4ecf2f1b3fc9e53804f3789ec02cf0b898bc4c15c9c359  frontend/src/App.jsx
1e1d03bfbe83ced500153b77192f300857caafcb76ddeea44e0a165846aafd22  frontend/src/styles/as6-command-center-ui-quality-v215.css

## Changed files at restore point creation
 M .github/workflows/as6-validate.yml
 M .github/workflows/deploy.yml
 M .gitignore
 M backend/Dockerfile
 M docker-compose.yml
 M docs/AS6_PROJECT_STATE.md
 M docs/AS6_PROJECT_STATUS.md
 M frontend/Dockerfile
 M ops/bin/as6-pre-commit-secret-scan
 M ops/systemd/as6-production-backup.service
?? .env.staging.example
?? docker-compose.staging.yml
?? docs/governance/as6-safe-delivery-v1.md
?? ops/bin/as6-build-release-v1
?? ops/bin/as6-control-safe-delivery-v1
?? ops/bin/as6-deploy-safe-delivery-v1
?? ops/bin/as6-init-staging-v1
?? ops/bin/as6-production-backup-full-v1
?? ops/bin/as6-promote-production-v1
?? ops/bin/as6-restore-drill-v1
?? ops/bin/as6-staging-deploy-v1
?? ops/bin/as6-staging-smoke-v1
?? ops/bin/as6-validate-staging-config-v1
?? ops/restore-points/20260719T164252Z-356b7dc7-pre-safe-delivery.md
?? ops/staging/
