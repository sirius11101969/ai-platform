# AS6 Production Mission Control Shell V114C

Base commit: 457f23d.
Purpose: real visible production shell migration.
Mount point: frontend/src/main.jsx.
Deploy method: npm/docker build plus direct docker cp frontend/dist into nginx html root.

Failure classes:
- MAIN_ENTRY_SHELL_MOUNT_MISSING
- PRODUCTION_STATIC_BUNDLE_NOT_REPLACED
- LEGACY_AI_OS_VISIBLE_AFTER_DEPLOY
- NGINX_STATIC_RELOAD_MISSING
- REAL_VISUAL_MIGRATION_NOT_VISIBLE
