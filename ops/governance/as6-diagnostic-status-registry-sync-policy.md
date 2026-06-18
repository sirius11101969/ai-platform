# AS6 Diagnostic Status Registry Sync Policy

Rule:

Every executable ops/bin/as6-diagnose-* diagnostic must have a status registry entry.

Required behavior:

- Diagnostic Registry entry is required.
- Coverage Registry entry is required.
- Status Registry entry is required.
- Missing status entries must be auto-synchronized before closure.
- Status Registry drift must fail diagnostics until repaired.
