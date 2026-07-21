# AS6 Staging Plan Simulation v1

## Symptom

The protected staging pricing page displayed `unsupported YOOKASSA_MODE: disabled`
when an owner tried to test a higher plan.

## Root cause

Staging correctly disabled YooKassa and cleared its credentials, but the pricing
UI and payment controller still expected the production provider checkout flow.
The environment safety contract and the browser test workflow were therefore
incompatible.

## Failure classes

- `AS6_STAGING_PRICING_PRODUCTION_CHECKOUT_COLLISION`
- `AS6_STAGING_REAL_PAYMENT_MUTATION_RISK`
- `AS6_STAGING_TEST_ACTIVATION_FEEDBACK_GAP`
- `AS6_STAGING_PAYMENT_ENV_CANONICALIZATION_GAP`
- `AS6_STAGING_PAYMENT_IMAGE_VALIDATION_GAP`
- `AS6_PLAN_ACTIVATION_STALE_SHELL_STATE`

## Repair

- add a server-side policy that enables simulation only when the environment is
  staging, the explicit simulation flag is enabled, YooKassa is disabled, and
  both YooKassa credentials are empty;
- create a local mock payment, process it immediately, and never call YooKassa;
- return an explicit simulated activation result to the browser;
- label the staging pricing flow as test-only and confirm that no money is
  charged;
- canonicalize the existing staging environment before deployment;
- execute payment policy and service tests inside the immutable staging backend
  image with networking disabled.
- publish a workspace refresh signal after activation and reload Living Shell
  data on same-tab events, cross-tab storage changes, browser return, and focus.

## Safety result

Production checkout behavior is unchanged. The simulation cannot be enabled by
the browser and cannot run when production mode or provider credentials are
present.
