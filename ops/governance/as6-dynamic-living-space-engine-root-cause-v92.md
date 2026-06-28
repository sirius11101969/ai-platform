# AS6 Dynamic Living Space Engine Root Cause V92

Root cause: V91K finalized registry-driven Living Space routes, but registry data is not yet exposed through a reusable engine for menus, active space lookup, shell policy validation and future Living Space automation.

Risk: future navigation/menu/context integrations can duplicate registry parsing logic and create Living Space UI drift.

Repair: add AS6 Dynamic Living Space Engine utilities and diagnostics while preserving existing route rendering behavior.
