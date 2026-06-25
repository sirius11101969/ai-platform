
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
