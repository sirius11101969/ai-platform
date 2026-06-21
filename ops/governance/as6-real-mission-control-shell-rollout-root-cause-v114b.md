# AS6 V114B Root Cause

V114 committed and pushed shell adapter, but user saw no visual changes in production.
Root cause: V114 validated frontend build and git push, but did not enforce production nginx/container rebuild and cache-bust verification.
Repair: add forced production shell CSS, import it globally, rebuild frontend, redeploy nginx container, validate production health and register deployment visibility drift.
