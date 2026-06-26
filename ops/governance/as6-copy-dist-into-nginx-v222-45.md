# AS6 V222_45 Governance — Copy Fresh Dist Into Running Nginx

- Failure class: FRONTEND_PACKAGE_LOCK_DRIFT_BLOCKED_IMAGE_REBUILD
- Root cause: docker_no_cache_nginx_rebuild_failed_because_frontend_package_lock_was_not_in_sync
- AEC rule: if image rebuild is blocked by package-lock drift, deploy repair may copy verified fresh dist into nginx and must register package-lock drift.
- Readiness: 99%.
