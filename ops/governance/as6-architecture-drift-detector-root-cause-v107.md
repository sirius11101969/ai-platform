# AS6 Architecture Drift Detector Root Cause V107

Root cause: AS6 has release gate, DAG validation, registries and governance, but architecture drift checks were distributed across individual controls.

Repair: add permanent architecture drift detector in ops/bin and register it through diagnostics, coverage, governance and state.
