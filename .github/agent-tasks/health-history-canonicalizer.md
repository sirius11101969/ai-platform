# AS6 Task: Health History Canonicalizer + Post-Merge Validation

Goal:
Implement production-safe diagnostics and automation to permanently suppress historical health-history noise without hiding real active incidents.

Requirements:
1. Add `ops/bin/as6-diagnose-health-history-canonicalizer`.
2. Detect historical recovered FAIL streaks, historical gap markers, historical_noncanonical_root_cause, and resolved historical incidents.
3. Never mark active fresh failures as OK unless recovery-window and timer freshness prove recovery.
4. Add `ops/bin/as6-post-merge-validation`.
5. Add checks to `ops/bin/as6-diagnose-all`.
6. Refresh `ops/status/diagnostic-status-registry.json`.
7. Keep secrets masked; never print .env values.
8. Validate with:
   - bash -n changed scripts
   - ./ops/bin/as6-diagnose-all
   - ./ops/bin/as6-root-cause-v3-refresh-cache
   - ./ops/bin/as6-owner-dashboard-root-cause-v3
   - ./ops/bin/as6-pre-commit-secret-scan

Acceptance:
- DIAGNOSTIC_FLOW_RESULT=OK
- DIAGNOSTIC_COVERAGE_RESULT=OK
- DIAGNOSTIC_STATUS_REGISTRY_RESULT=OK
- ROOT_CAUSE=none unless a real active incident exists
- SAFE_TO_CHANGE=YES unless a real active incident exists
- AS6_DIAGNOSE_ALL_RESULT=OK or only documented non-production warnings
