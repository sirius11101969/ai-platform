# AS6 Autonomous Expansion Router

Purpose:

Detect newly observed FAIL, WARN, GAP, DRIFT, INCIDENT, REGRESSION, ROOT_CAUSE and ARCHITECTURE issues and route them into the self-expanding diagnostics framework.

Mandatory behavior:

Detection -> Classification -> Self Expansion -> Diagnostic -> Registry -> Coverage -> Governance -> Prevention -> AEC -> State -> Validation.

Rules:

- The router must never print secrets.
- The router must not require manual registration.
- Every routed class must create or validate a generated diagnostic.
- Every routed class must create or validate registry, coverage, prevention, AEC and state artifacts.
- The router must be callable from the one-command AS6 workflow.
