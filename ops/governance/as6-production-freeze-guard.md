# AS6 Production Freeze Guard
Dangerous production operations must be blocked unless rollback readiness is OK.
Blocked operation classes:
- docker compose down
- docker volume rm
- docker system prune
- rm -rf production runtime/data paths
Required signal: AEC_PRODUCTION_FREEZE_GUARD=PASS
