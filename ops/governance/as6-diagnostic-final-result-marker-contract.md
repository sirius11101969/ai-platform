# AS6 Diagnostic Final Result Marker Contract

Rule:

Every AS6 diagnostic must print a final AS6_*_RESULT marker before termination.

Required behavior:

- PASS diagnostics must print AS6_*_RESULT=OK and exit 0.
- FAIL diagnostics must print AS6_*_RESULT=FAIL and exit non-zero.
- Optional checks must not terminate diagnostics before the final marker.
- grep/test/git-check-ignore commands must be wrapped when used as optional checks.
