# AS6 Nginx SPA Routing Fix Root Cause

- Root cause: Nginx default site serves /var/www/html and uses try_files $uri $uri/ =404.
- Effect: direct SPA routes like /crm-v2 are not reliably served by React Router.
- Resolution: configure Nginx root to /var/www/ai-platform/frontend/dist and fallback to /index.html.
- Page changed: /crm-v2 production routing.
- Page not changed: /crm UI code.
