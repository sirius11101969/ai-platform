# AS6 CI Validation Governance V105

Stage: AS6_CI_STATUS_BADGE_VALIDATION_GOVERNANCE_V105

Canonical validation entrypoint:
- ops/bin/as6-validate

Canonical workflow:
- .github/workflows/as6-validate.yml

Required CI sequence:
1. checkout
2. setup node
3. npm ci
4. npm run build
5. ops/bin/as6-validate

Governance rules:
- README must show AS6 Validate workflow badge.
- GitHub Actions must call ops/bin/as6-validate.
- Pull requests must trigger AS6 validation.
- Manual validation should use ops/bin/as6-validate instead of direct chained controls.
- Legacy controls remain compatible but are not the canonical validation entrypoint.

Validation marker:
- AS6_CI_STATUS_BADGE_VALIDATION_GOVERNANCE_V105=PASS
