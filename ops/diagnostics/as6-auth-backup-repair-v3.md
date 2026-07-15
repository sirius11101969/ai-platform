# AS6 Auth and Backup Repair v3

## Root Cause

- signup/login returned workspace but frontend did not persist its id before /app;
- v2 stopped because optional missing backup directories made find return non-zero under pipefail.

## Change

- active workspace id is persisted from auth response;
- backup roots are filtered to existing directories before counting;
- the cycle is resumable after the previous partial change.

## Runtime evidence

- backup status: EVIDENCE_PRESENT
- files in last 4 days: 16
- files in last 8 days: 24
- files in last 32 days: 46
- detailed audit is stored in ignored runtime artifacts.

## Failure classes

- AS6_SIGNUP_WORKSPACE_SESSION_GAP
- AS6_POST_AUTH_WORKSPACE_HEADER_GAP
- AS6_BACKUP_OPTIONAL_DIRECTORY_PIPEFAIL
- AS6_AUTH_REPAIR_PARTIAL_CYCLE
- AS6_BACKUP_RETENTION_COUNTING_GAP
- AS6_BACKUP_RETENTION_POLICY_NOT_EXPLICIT
