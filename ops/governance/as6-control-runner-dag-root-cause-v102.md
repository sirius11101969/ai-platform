# AS6 Control Runner DAG Root Cause V102

Root cause: controls are currently chained directly, so later controls repeatedly call earlier controls and produce very long duplicated PASS logs.

Risk: validation log size and execution time can grow quadratically as stages increase.

Repair: add AS6 Control Runner with a dependency manifest, visited-set execution, one-run-per-control guarantee and compact summary output.
