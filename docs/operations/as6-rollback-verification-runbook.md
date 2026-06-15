# AS6 Rollback Verification Operations

Operational rule:

Before autonomous deployment or major production changes, the rollback verification controller must report:

- ROLLBACK_VERIFICATION=OK
- AS6_AUTONOMOUS_ROLLBACK_VERIFICATION_RESULT=OK

Evidence path:

- runtime/rollback-verification/latest.out

Secrets:

Do not print real secret values. If a restore requires a secret, document only this placeholder:

<INSERT_SECRET_HERE>
