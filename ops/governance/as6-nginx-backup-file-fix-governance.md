# AS6 Nginx Backup File Fix Governance

- Rule: never store backup server configs inside /etc/nginx/sites-enabled.
- Rule: active Nginx configs only: real enabled site files or symlinks.
- Rule: backup files must be stored in runtime artifacts or /etc/nginx/as6-backups.
- Failure class: nginx-backup-file-loaded-as-active-site.
- AEC rule: nginx-backups-must-not-live-in-sites-enabled.
