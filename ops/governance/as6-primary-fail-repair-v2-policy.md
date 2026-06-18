# AS6 Primary FAIL Repair V2 Policy

Rules:
- ops/bin/as6-diagnose-all must have only one final exit at the end.
- Any diagnostics appended to diagnose-all must be before the final exit.
- autonomous coverage must validate explicit diagnostic, registry, coverage, prevention, rollback, evidence and AEC linkage.
