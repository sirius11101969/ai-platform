# AS6 V85B Root Cause

V85 passed diagnostics, build, health, runtime staging and enforcement guard.
Commit was blocked by pre-commit secret scan false positive on diagnostic output text containing HIDDEN after a key-like word.
Root cause: diagnostic emitted a token-failure string that matched the repository secret-scan heuristic.
Repair: change diagnostic output wording to avoid key/value secret-scan false positives and register the failure class.
