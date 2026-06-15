# AS6 Autonomous Repair Controller

The repair controller governs autonomous fixes.

Required signals:
- AS6_REPAIR_ROOT_CAUSE=PASS
- AS6_REPAIR_PLAN=PASS
- AS6_REPAIR_VALIDATION=PASS
- AS6_REPAIR_ROLLBACK=PASS
- AS6_REPAIR_EVIDENCE=PASS
- AS6_REPAIR_CHANGE_PIPELINE=PASS
- AS6_REPAIR_AUTO_APPLY_GUARD=PASS
- AS6_REPAIR_ALLOWED=YES
- AEC_AUTONOMOUS_REPAIR_CONTROLLER=PASS

Auto-apply policy:
- Repairs may be proposed automatically.
- Repairs may not be applied unless change pipeline, rollback readiness, freeze guard, and diagnostics are OK.
- Secrets must never be printed.
