# AS6 Diagnostic Self-Match Rule

RULE=AS6_GOVERNANCE_DIAGNOSTIC_SELF_MATCH_RULE
FAILURE_CLASS=AS6_DIAGNOSTIC_SELF_MATCH

Diagnostics must not validate their own implementation by matching literal detection patterns against themselves.

Self-matching diagnostics are prohibited.

Diagnostic controls must either:
- exclude their own diagnostic/control implementation files, or
- use a scoped target set that cannot include the diagnostic implementation itself.

CHANGE_CLASS=MAINTENANCE
SCOPE=DIAGNOSTICS
BASELINE_IMPACT=NONE
ARCHITECTURE_IMPACT=NONE
EXECUTIVE_INTELLIGENCE_IMPACT=NONE
COMPATIBILITY=UNCHANGED
