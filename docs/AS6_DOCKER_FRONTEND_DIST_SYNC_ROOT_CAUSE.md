# AS6 Docker Frontend Dist Sync Root Cause

- Root cause: Docker Nginx container serves stale frontend build from /usr/share/nginx/html.
- Source code and local frontend/dist contain /crm-v2, but container html/assets do not.
- Effect: public /crm-v2 cannot render CRMBrandV2Page and browser falls back to old app behavior.
- Resolution: rebuild frontend and sync frontend/dist into ai-platform-nginx-1:/usr/share/nginx/html.
- Page changed: /crm-v2.
- Page not changed: /crm.
