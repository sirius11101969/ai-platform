# AS6 Pre-commit Hook Hard Secret Scan Root Cause V91J

Root cause: previous repair added safe markers but did not replace the active pre-commit secret scan block. The hook still blocked safe auth identifiers such as AuthContext token field and localStorage key "as6-token".

Repair: replace local pre-commit hook with explicit zero-context added-line secret scan. Preserve .env blocking and real secret detection.
