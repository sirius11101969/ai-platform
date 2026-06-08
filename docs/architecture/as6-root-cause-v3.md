# AS6 Root Cause V3

## Goal

Single-command incident investigation.

Workflow:

1. Detect anomaly
2. Collect evidence
3. Correlate evidence
4. Calculate confidence
5. Determine probable root cause
6. Generate remediation plan
7. Generate automation candidate

## Evidence Sources

- runtime/health/history
- health cache
- diagnostics cache
- docker events
- systemd
- journalctl
- nginx
- postgres
- redis
- ssh
- network
- filesystem

## Output

SAFE_TO_FIX=
SAFE_TO_CHANGE=
ROOT_CAUSE=
CONFIDENCE=
IMPACT=
RECOMMENDED_ACTION=
AUTOMATION_TO_ADD=

## Future Diagnostics

- as6-diagnose-freeze-correlation
- as6-diagnose-network-correlation
- as6-diagnose-docker-correlation
- as6-diagnose-postgres-correlation
- as6-diagnose-redis-correlation
- as6-diagnose-security-correlation

## Constitution

Diagnostics first.
No blind production changes.
Every incident becomes automation.