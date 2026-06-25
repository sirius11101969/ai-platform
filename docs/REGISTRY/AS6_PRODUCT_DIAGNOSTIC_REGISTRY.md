
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
