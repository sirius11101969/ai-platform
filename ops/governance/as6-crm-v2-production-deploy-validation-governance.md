# AS6 CRM V2 Production Deploy Validation Governance

- Rule: route-level UI changes are not complete until production HTML/assets prove the new markers exist.
- Rule: build PASS is not equal to production deploy PASS.
- Rule: every new UI page must register production route evidence.
- Failure class: source-route-exists-but-production-serves-old-bundle.
- AEC rule: new-ui-route-requires-production-bundle-marker-validation.
