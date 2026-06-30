# AS6 Marketplace E2E Plugin Validation Root Cause P22

Root cause: Platform V2 had Marketplace, SDK, CLI, Registry and App wiring, but needed an end-to-end smoke plugin validating the full plugin lifecycle.

Repair: generate p22-marketplace-smoke plugin and validate it through diagnostics, release gate and build.
