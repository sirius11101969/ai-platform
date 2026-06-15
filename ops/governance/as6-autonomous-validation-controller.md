# AS6 Autonomous Validation Controller

The validation controller proves that a repair or change is safe after execution.

Required signals:
- AS6_VALIDATION_PLAN=PASS
- AS6_VALIDATION_POST_CHANGE_DIAGNOSTICS=PASS
- AS6_VALIDATION_PRODUCTION_HEALTH=PASS
- AS6_VALIDATION_ROLLBACK_VERIFICATION=PASS
- AS6_VALIDATION_EVIDENCE=PASS
- AS6_VALIDATION_REPAIR_CONTROLLER=PASS
- AS6_VALIDATION_CHANGE_PIPELINE=PASS
- AS6_VALIDATION_ALLOWED=YES
- AEC_AUTONOMOUS_VALIDATION_CONTROLLER=PASS

Validation policy:
- Every repair must have post-change diagnostics.
- Every production-impacting change must confirm production health.
- Every change must leave evidence artifacts.
- Every change must have rollback verification.
