# AS6 CRM Living Space Adapter Root Cause V88

Stage: AS6_CRM_LIVING_SPACE_ADAPTER_V88

Root cause: AS6Shell, /as6-one adapter and shell-zone contract are ready, but CRM still needs a dedicated Living Space route /as6-sales.

Risk: moving CRM by rewriting components would duplicate business logic and create UI drift.

Repair: create AS6SalesShellAdapter that wraps the existing CRM page inside AS6Shell and add /as6-sales route without changing CRM page logic.
