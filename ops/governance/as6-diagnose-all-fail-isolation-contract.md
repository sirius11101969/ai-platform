# AS6 Diagnose-All Fail Isolation Contract

Rule:

as6-diagnose-all must never stop at the first failed diagnostic controller.

Required behavior:

- Every controller must be isolated.
- A failed controller must be recorded as AS6_DIAGNOSE_ALL_CHECK=FAIL:<name>.
- diagnose-all must continue running remaining controllers after a controller failure.
- The final output must allow operators to see all current FAIL classes.
- set -e must not bypass failure aggregation inside run_check.
