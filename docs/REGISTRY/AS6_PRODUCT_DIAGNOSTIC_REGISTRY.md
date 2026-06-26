
## V222.1B Product Diagnostic
- Artifact: docs/PRODUCT/AS6_PRODUCT_DIAGNOSTIC_PASSPORT_V222_1B.md
- Stage Passport: docs/STAGE_PASSPORTS/V222_1B_PRODUCT_DIAGNOSTIC.md
- Runtime: runtime/as6-v222-1b-product-diagnostic
- Status: ops/status/as6-v222-1b-product-diagnostic-status.md

## V222.1B Repair Diagnostic
- Failure Class: FRONTEND_IMPORT_BLOCK_SYNTAX_BREAK
- Artifact: runtime/as6-v222-1b-product-diagnostic/root-cause-build-blocker.txt
- Evidence: runtime/as6-v222-1b-product-diagnostic/crm-imports.before.txt, runtime/as6-v222-1b-product-diagnostic/crm-imports.after.txt

## V222.1B Finalization Diagnostic
- Failure Class: DIAGNOSTIC_RUNTIME_ARTIFACT_IGNORED_BY_GIT
- Artifact: runtime/as6-v222-1b-product-diagnostic/finalize-packaging-root-cause.txt
- Control: scoped git add -f for intended V222 runtime diagnostic artifacts.

## V222.2 First Experience Clarity
- Artifact: docs/PRODUCT/AS6_FIRST_EXPERIENCE_CLARITY_V222_2.md
- Stage Passport: docs/STAGE_PASSPORTS/V222_2_FIRST_EXPERIENCE_CLARITY.md
- Runtime: runtime/as6-v222-2-first-experience-clarity
- Status: ops/status/as6-v222-2-first-experience-clarity-status.md
- Failure Classes: PRODUCT_FIRST_EXPERIENCE_CLARITY_GAP, PRODUCT_TECHNICAL_PROOF_LABEL_LEAK, PRODUCT_COPY_REPLACEMENT_PATTERN_GAP

## V222.3 First Experience Effect Review
- Artifact: docs/PRODUCT/AS6_FIRST_EXPERIENCE_EFFECT_REVIEW_V222_3.md
- Stage Passport: docs/STAGE_PASSPORTS/V222_3_FIRST_EXPERIENCE_EFFECT_REVIEW.md
- Runtime: runtime/as6-v222-3-first-experience-effect-review
- Status: ops/status/as6-v222-3-first-experience-effect-review-status.md
- Failure Classes: PRODUCT_EFFECT_UNMEASURED_BY_USERS, PRODUCT_POST_AUTH_DESTINATION_AMBIGUITY_PENDING

## V222.4 Post-auth First Destination Diagnostic
- Artifact: docs/PRODUCT/AS6_POST_AUTH_FIRST_DESTINATION_DIAGNOSTIC_V222_4.md
- Stage Passport: docs/STAGE_PASSPORTS/V222_4_POST_AUTH_FIRST_DESTINATION_DIAGNOSTIC.md
- Runtime: runtime/as6-v222-4-post-auth-first-destination-diagnostic
- Status: ops/status/as6-v222-4-post-auth-first-destination-diagnostic-status.md
- Failure Classes: PRODUCT_POST_AUTH_DESTINATION_NOT_EXPLICIT, PRODUCT_POST_AUTH_DESTINATION_REQUIRES_VALUE_ALIGNMENT_REVIEW

## V222.4 Final Repair Diagnostic
- Failure Class: DIAGNOSTIC_SNAPSHOT_AUTH_FIELD_NAME_FALSE_POSITIVE
- Runtime: runtime/as6-v222-4-post-auth-first-destination-diagnostic
- Control: runtime snapshots must avoid token-like field names even when values are redacted.

## V222.5 Post-auth Destination Strategy
- Artifact: docs/PRODUCT/AS6_POST_AUTH_DESTINATION_STRATEGY_V222_5.md
- Stage Passport: docs/STAGE_PASSPORTS/V222_5_POST_AUTH_DESTINATION_STRATEGY.md
- Runtime: runtime/as6-v222-5-post-auth-command-center
- Status: ops/status/as6-v222-5-post-auth-destination-strategy-status.md
- Failure Classes: PRODUCT_POST_AUTH_DESTINATION_AMBIGUITY, PRODUCT_AUTH_NAVIGATION_VALUE_MISMATCH

## V222.6 Post-auth Destination Effect Review
- Artifact: docs/PRODUCT/AS6_POST_AUTH_DESTINATION_EFFECT_REVIEW_V222_6.md
- Stage Passport: docs/STAGE_PASSPORTS/V222_6_POST_AUTH_DESTINATION_EFFECT_REVIEW.md
- Runtime: runtime/as6-v222-6-post-auth-destination-effect-review
- Status: ops/status/as6-v222-6-post-auth-destination-effect-review-status.md
- Failure Classes: PRODUCT_POST_AUTH_DESTINATION_EFFECT_UNMEASURED_BY_USERS, PRODUCT_FIRST_TIME_COMMAND_CENTER_ORIENTATION_PENDING

## V222.7 Command Center First-time Orientation Diagnostic
- Artifact: docs/PRODUCT/AS6_COMMAND_CENTER_FIRST_TIME_ORIENTATION_DIAGNOSTIC_V222_7.md
- Stage Passport: docs/STAGE_PASSPORTS/V222_7_COMMAND_CENTER_FIRST_TIME_ORIENTATION_DIAGNOSTIC.md
- Runtime: runtime/as6-v222-7-command-center-first-time-orientation
- Status: ops/status/as6-v222-7-command-center-first-time-orientation-status.md
- Failure Classes: PRODUCT_COMMAND_CENTER_FIRST_TIME_ORIENTATION_GAP, PRODUCT_COMMAND_CENTER_NO_VISIBLE_ACTION_SURFACE, PRODUCT_FIRST_TIME_COMMAND_CENTER_ORIENTATION_PENDING

## V222.8 Command Center First-time Orientation
- Artifact: docs/PRODUCT/AS6_COMMAND_CENTER_ORIENTATION_V222_8.md
- Stage Passport: docs/STAGE_PASSPORTS/V222_8_COMMAND_CENTER_ORIENTATION.md
- Runtime: runtime/as6-v222-8-command-center-orientation
- Status: ops/status/as6-v222-8-command-center-orientation-status.md
- Failure Classes: PRODUCT_COMMAND_CENTER_FIRST_TIME_ORIENTATION_GAP, PRODUCT_COMMAND_CENTER_FIRST_ACTION_AMBIGUITY

## V222.9 Command Center Orientation Effect Review
- Artifact: docs/PRODUCT/AS6_COMMAND_CENTER_ORIENTATION_EFFECT_REVIEW_V222_9.md
- Stage Passport: docs/STAGE_PASSPORTS/V222_9_COMMAND_CENTER_ORIENTATION_EFFECT_REVIEW.md
- Runtime: runtime/as6-v222-9-command-center-orientation-effect-review
- Status: ops/status/as6-v222-9-command-center-orientation-effect-review-status.md
- Failure Classes: PRODUCT_COMMAND_CENTER_ORIENTATION_EFFECT_UNMEASURED_BY_USERS, PRODUCT_COMMAND_CENTER_FIRST_ACTION_ANALYTICS_PENDING

## V222.10 First-action Analytics Diagnostic
- Artifact: docs/PRODUCT/AS6_FIRST_ACTION_ANALYTICS_DIAGNOSTIC_V222_10.md
- Stage Passport: docs/STAGE_PASSPORTS/V222_10_FIRST_ACTION_ANALYTICS_DIAGNOSTIC.md
- Runtime: runtime/as6-v222-10-first-action-analytics-diagnostic
- Status: ops/status/as6-v222-10-first-action-analytics-diagnostic-status.md
- Failure Classes: PRODUCT_COMMAND_CENTER_FIRST_ACTION_ANALYTICS_PENDING, PRODUCT_COMMAND_CENTER_FIRST_ACTION_CTA_MISSING, PRODUCT_FIRST_ACTION_ANALYTICS_REQUIRES_EFFECT_REVIEW

## V222.11 AS6 Product Intelligence Foundation
- Artifact: docs/PRODUCT/AS6_PRODUCT_INTELLIGENCE_FOUNDATION_V222_11.md
- Stage Passport: docs/STAGE_PASSPORTS/V222_11_PRODUCT_INTELLIGENCE_FOUNDATION.md
- Runtime: runtime/as6-v222-11-product-intelligence-foundation
- Status: ops/status/as6-v222-11-product-intelligence-foundation-status.md
- Failure Classes: PRODUCT_INTELLIGENCE_FOUNDATION_MISSING, PRODUCT_EVENT_REGISTRY_MISSING, PRODUCT_TELEMETRY_PRIVACY_GUARD_MISSING, PRODUCT_EXTERNAL_ANALYTICS_DRIFT

## V222.12 Command Center First-action Telemetry
- Artifact: docs/PRODUCT/AS6_COMMAND_CENTER_FIRST_ACTION_TELEMETRY_V222_12.md
- Stage Passport: docs/STAGE_PASSPORTS/V222_12_COMMAND_CENTER_FIRST_ACTION_TELEMETRY.md
- Runtime: runtime/as6-v222-12-command-center-first-action-telemetry
- Status: ops/status/as6-v222-12-command-center-first-action-telemetry-status.md
- Failure Classes: PRODUCT_FIRST_ACTION_TELEMETRY_NOT_WIRED, PRODUCT_FIRST_ACTION_EVENT_REGISTRY_DRIFT, PRODUCT_FIRST_ACTION_TELEMETRY_PRIVACY_DRIFT

## V222.13 First-action Telemetry Effect Review
- Artifact: docs/PRODUCT/AS6_FIRST_ACTION_TELEMETRY_EFFECT_REVIEW_V222_13.md
- Stage Passport: docs/STAGE_PASSPORTS/V222_13_FIRST_ACTION_TELEMETRY_EFFECT_REVIEW.md
- Runtime: runtime/as6-v222-13-first-action-telemetry-effect-review
- Status: ops/status/as6-v222-13-first-action-telemetry-effect-review-status.md
- Failure Classes: PRODUCT_FIRST_ACTION_TELEMETRY_RUNTIME_UNVALIDATED, PRODUCT_FIRST_ACTION_METRICS_PENDING, PRODUCT_FIRST_ACTION_INSIGHTS_PENDING, DIAGNOSTIC_COUNTER_FALSE_POSITIVE

## V222.14 Runtime Telemetry Storage Validation
- Artifact: docs/PRODUCT/AS6_RUNTIME_TELEMETRY_STORAGE_VALIDATION_V222_14.md
- Stage Passport: docs/STAGE_PASSPORTS/V222_14_RUNTIME_TELEMETRY_STORAGE_VALIDATION.md
- Runtime: runtime/as6-v222-14-runtime-telemetry-storage-validation
- Status: ops/status/as6-v222-14-runtime-telemetry-storage-validation-status.md
- Failure Classes: PRODUCT_TELEMETRY_RUNTIME_STORAGE_UNVALIDATED, PRODUCT_TELEMETRY_SANITIZATION_RUNTIME_GAP, PRODUCT_TELEMETRY_DISABLE_CONTROL_RUNTIME_GAP, PRODUCT_TELEMETRY_UNREGISTERED_EVENT_RUNTIME_GAP

## V222.15 First-action Metrics Foundation
- Artifact: docs/PRODUCT/AS6_FIRST_ACTION_METRICS_FOUNDATION_V222_15.md
- Stage Passport: docs/STAGE_PASSPORTS/V222_15_FIRST_ACTION_METRICS_FOUNDATION.md
- Runtime: runtime/as6-v222-15-first-action-metrics-foundation
- Status: ops/status/as6-v222-15-first-action-metrics-foundation-status.md
- Failure Classes: PRODUCT_FIRST_ACTION_METRICS_PENDING, PRODUCT_FIRST_ACTION_METRICS_EXPORT_GAP, PRODUCT_FIRST_ACTION_METRICS_RUNTIME_GAP

## V222.16 First-action Insights Foundation
- Artifact: docs/PRODUCT/AS6_FIRST_ACTION_INSIGHTS_FOUNDATION_V222_16.md
- Stage Passport: docs/STAGE_PASSPORTS/V222_16_FIRST_ACTION_INSIGHTS_FOUNDATION.md
- Runtime: runtime/as6-v222-16-first-action-insights-foundation
- Status: ops/status/as6-v222-16-first-action-insights-foundation-status.md
- Failure Classes: PRODUCT_FIRST_ACTION_INSIGHTS_PENDING, PRODUCT_FIRST_ACTION_INSIGHTS_EXPORT_GAP, PRODUCT_FIRST_ACTION_INSIGHTS_RUNTIME_GAP

## V222.17 Product Decision History Evidence Bridge
- Artifact: docs/PRODUCT/AS6_PRODUCT_DECISION_EVIDENCE_BRIDGE_V222_17.md
- Stage Passport: docs/STAGE_PASSPORTS/V222_17_PRODUCT_DECISION_EVIDENCE_BRIDGE.md
- Runtime: runtime/as6-v222-17-product-decision-evidence-bridge
- Status: ops/status/as6-v222-17-product-decision-evidence-bridge-status.md
- Failure Classes: PRODUCT_DECISION_EVIDENCE_BRIDGE_MISSING, PRODUCT_DECISION_EVIDENCE_BRIDGE_EXPORT_GAP, PRODUCT_DECISION_EVIDENCE_BRIDGE_RUNTIME_GAP

## V222.18 Product Decision Evidence Effect Review
- Artifact: docs/PRODUCT/AS6_PRODUCT_DECISION_EVIDENCE_EFFECT_REVIEW_V222_18.md
- Stage Passport: docs/STAGE_PASSPORTS/V222_18_PRODUCT_DECISION_EVIDENCE_EFFECT_REVIEW.md
- Runtime: runtime/as6-v222-18-product-decision-evidence-effect-review
- Status: ops/status/as6-v222-18-product-decision-evidence-effect-review-status.md
- Failure Classes: PRODUCT_DECISION_EVIDENCE_EFFECT_UNREVIEWED, PRODUCT_DECISION_EVIDENCE_VALIDATION_GAP, PRODUCT_DECISION_EVIDENCE_AUTOMATION_PENDING

## V222.19 Decision History Persistence Diagnostic
- Artifact: docs/PRODUCT/AS6_DECISION_HISTORY_PERSISTENCE_DIAGNOSTIC_V222_19.md
- Stage Passport: docs/STAGE_PASSPORTS/V222_19_DECISION_HISTORY_PERSISTENCE_DIAGNOSTIC.md
- Runtime: runtime/as6-v222-19-decision-history-persistence-diagnostic
- Status: ops/status/as6-v222-19-decision-history-persistence-diagnostic-status.md
- Failure Classes: PRODUCT_DECISION_EVIDENCE_PERSISTENCE_UNSPECIFIED, PRODUCT_DECISION_HISTORY_WRITE_TARGET_UNSPECIFIED, PRODUCT_DECISION_EVIDENCE_DURABILITY_GAP

## V222.20 Decision History Evidence Persistence Helper
- Artifact: docs/PRODUCT/AS6_DECISION_HISTORY_EVIDENCE_PERSISTENCE_HELPER_V222_20.md
- Stage Passport: docs/STAGE_PASSPORTS/V222_20_DECISION_HISTORY_EVIDENCE_PERSISTENCE_HELPER.md
- Runtime: runtime/as6-v222-20-decision-history-evidence-persistence-helper
- Status: ops/status/as6-v222-20-decision-history-evidence-persistence-helper-status.md
- Failure Classes: PRODUCT_DECISION_HISTORY_EVIDENCE_APPEND_HELPER_MISSING, PRODUCT_DECISION_HISTORY_APPEND_FORMAT_GAP, PRODUCT_DECISION_HISTORY_APPEND_VALIDATION_GAP

## V222.21 Append Helper Effect Review
- Artifact: docs/PRODUCT/AS6_APPEND_HELPER_EFFECT_REVIEW_V222_21.md
- Stage Passport: docs/STAGE_PASSPORTS/V222_21_APPEND_HELPER_EFFECT_REVIEW.md
- Runtime: runtime/as6-v222-21-append-helper-effect-review
- Status: ops/status/as6-v222-21-append-helper-effect-review-status.md
- Failure Classes: PRODUCT_DECISION_HISTORY_APPEND_EFFECT_UNREVIEWED, PRODUCT_DECISION_HISTORY_AUTO_WRITE_DRIFT, PRODUCT_DECISION_HISTORY_INVALID_APPEND_ACCEPTANCE

## V222.22 First Decision History Evidence Entry
- Artifact: docs/PRODUCT/AS6_FIRST_DECISION_HISTORY_EVIDENCE_ENTRY_V222_22.md
- Stage Passport: docs/STAGE_PASSPORTS/V222_22_FIRST_DECISION_HISTORY_EVIDENCE_ENTRY.md
- Runtime: runtime/as6-v222-22-first-decision-history-evidence-entry
- Status: ops/status/as6-v222-22-first-decision-history-evidence-entry-status.md
