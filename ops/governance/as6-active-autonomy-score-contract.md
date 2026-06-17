# AS6 Active Autonomy Score Contract

Rule:

Autonomy score validation must use active runtime calculation, not historical logs or archived evidence.

Required behavior:

- Run the active unified autonomy orchestrator when available.
- Extract the current AS6_UNIFIED_AUTONOMY_SCORE_PERCENT value from active output.
- PASS only when current score is numeric and between 0 and 100.
- Do not scan historical runtime logs for score overflow.
- Historical evidence may be audited separately, but must not fail active readiness.
