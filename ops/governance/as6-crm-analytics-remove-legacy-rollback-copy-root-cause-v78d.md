# AS6 V78D Root Cause

V78C diagnostics passed.
V78C control failed because docker compose run node:20-alpine treats node:20-alpine as a Compose service name.
Repair: use docker run node:20-alpine image fallback and avoid docker compose env warning path.
