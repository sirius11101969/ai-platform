# AS6 Nginx Backup File Fix Root Cause

- Root cause: backup Nginx config file was created inside /etc/nginx/sites-enabled.
- Effect: Nginx loaded backup as an active site and failed with duplicate default_server.
- Resolution: move backup files out of sites-enabled into runtime backup storage.
- Page expected after fix: /crm-v2.
- Page not changed: /crm UI.
