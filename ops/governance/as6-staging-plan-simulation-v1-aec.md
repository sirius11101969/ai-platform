# AS6 Staging Plan Simulation v1 AEC

## Mandatory rules

1. A simulated plan activation is allowed only with
   `AS6_ENVIRONMENT=staging` and `AS6_STAGING_PAYMENT_SIMULATION=true`.
2. Simulation requires `YOOKASSA_MODE=disabled` and empty YooKassa credentials.
3. A simulated payment must be local, use a mock identifier, and perform no
   external mutation or provider request.
4. The browser must explicitly state that activation is a staging test and that
   money is not charged.
5. Production checkout must retain the real provider path without sharing a
   browser-controlled simulation switch.
6. The immutable staging backend image must run the policy and payment service
   tests with networking disabled before containers are replaced.
7. A completed plan activation must invalidate Living Shell workspace state in
   the current tab, restored browser pages, and other open tabs.

## Prevention contract

`ops/bin/as6-control-staging-plan-simulation-v1` is part of Safe Delivery and
must fail when any safety gate, user feedback, test, or registry linkage drifts.
