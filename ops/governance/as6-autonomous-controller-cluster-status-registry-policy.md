# AS6 Autonomous Controller Cluster Status Registry Policy

Rule:

Every new autonomous controller diagnostic must be present in the canonical status registry diagnostics array before validation, commit and push.

Required behavior:

- Git tracked diagnostic is required.
- Diagnostic Registry entry is required.
- Coverage Registry entry is required.
- Status Registry diagnostics[] entry is required.
- Missing status registry entry must fail before closure.
