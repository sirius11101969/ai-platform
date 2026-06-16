# AS6 Root Cause Addendum: Autonomy Score

## AUTONOMY_SCORE_MISSING
Severity: medium
Symptoms: autonomy level is claimed without measured score.
Verification: run ops/bin/as6-autonomy-score-controller.
Fix: generate autonomy score evidence.
Rollback: keep previous autonomy level.
Prevention: enforce AEC_AUTONOMY_SCORE_REQUIRED.

## AUTONOMY_SCORE_BELOW_L7
Severity: high
Symptoms: score drops below L7 threshold.
Verification: inspect runtime/autonomy-score/latest.out.
Fix: restore missing gates.
Rollback: downgrade autonomy class.
Prevention: require score check before L7+ promotion.

## AUTONOMY_HUMAN_DEPENDENCY_TOO_HIGH
Severity: medium
Symptoms: manual dependency remains too high for target autonomy level.
Verification: inspect AS6_AUTONOMY_HUMAN_DEPENDENCY_PERCENT.
Fix: automate safe gates without enabling unsafe production auto-apply.
Rollback: keep human approval required.
Prevention: enforce explicit human dependency calculation.
