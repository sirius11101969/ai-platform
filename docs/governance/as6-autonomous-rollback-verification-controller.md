# AS6 Autonomous Rollback Verification Controller

Purpose:

Verify that AS6 can safely roll back before autonomous deployment or major production changes.

Controller:

- ops/bin/as6-autonomous-rollback-verification-controller

Result contract:

- ROLLBACK_VERIFICATION=OK
- ROLLBACK_VERIFICATION=FAIL
- AS6_AUTONOMOUS_ROLLBACK_VERIFICATION_RESULT=OK
- AS6_AUTONOMOUS_ROLLBACK_VERIFICATION_RESULT=FAIL

Required evidence:

- runtime/rollback-verification/latest.out

Checks:

- backup artifact presence
- backup artifact plausible size
- SQL backup content signature
- docker-compose restore prerequisite
- .env.example restore prerequisite
- production .env presence without printing values
- postgres runtime target presence
- rollback readiness diagnostic
- restore readiness diagnostic
- backup integrity diagnostic
- rollback documentation references
- restore documentation references
- backup governance references
- .env not tracked by Git
- secret scan execution
