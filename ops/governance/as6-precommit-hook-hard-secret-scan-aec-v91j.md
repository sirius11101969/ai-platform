# AS6 Pre-commit Hook Hard Secret Scan AEC V91J

Failure classes:
- AS6_PRECOMMIT_ACTIVE_HOOK_SECRET_SCAN_DRIFT
- AS6_SAFE_AUTH_IDENTIFIER_SECRET_SCAN_FALSE_POSITIVE
- AS6_PRECOMMIT_HOOK_PATCH_NOT_APPLIED

AEC rules:
- Active local pre-commit hook must use zero-context added-line scan.
- .env files must remain blocked.
- Real added secrets must remain blocked.
- Safe auth storage key names must not block commit.
