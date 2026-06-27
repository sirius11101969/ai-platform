# AS6 Docker Frontend Dist Sync Governance

- Rule: production frontend is Docker Nginx /usr/share/nginx/html, not host frontend/dist.
- Rule: UI route is not complete until container bundle contains route markers.
- Rule: every frontend deploy must validate container html/assets markers.
- Failure class: docker-nginx-serving-stale-frontend-build.
- AEC rule: frontend-ui-change-requires-docker-nginx-dist-sync.
