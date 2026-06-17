# AS6 Diagnostic Exit Code Contract

Rule:

Every AS6 diagnostic that reports PASS/OK must reach a final result marker and exit with code 0.

Required behavior:

- Diagnostics must not fail silently before final marker.
- Diagnostics must print AS6_*_RESULT=OK on success.
- Diagnostics must exit non-zero only on explicit FAIL.
- Diagnostics must not let optional git-ignore checks break PASS flow.
