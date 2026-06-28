# AS6 Control Runner DAG AEC V102

Failure classes:
- AS6_CONTROL_RUNNER_DUPLICATE_EXECUTION_DRIFT
- AS6_CONTROL_DAG_CYCLE_RISK
- AS6_CONTROL_DEPENDENCY_MANIFEST_DRIFT
- AS6_CONTROL_LOG_QUADRATIC_GROWTH_RISK
- AS6_CONTROL_SUMMARY_GAP

AEC rules:
- New stages should be registered in the control dependency manifest.
- DAG runner must execute every control at most once per validation run.
- DAG runner must detect dependency cycles.
- Legacy direct control chains may remain for compatibility.
- Compact summary must be produced for long validation chains.
