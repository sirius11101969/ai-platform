# AS6 Diagnostic Status Registry Schema Sync Policy

Canonical schema:

{
  "version": 1,
  "diagnostics": [
    {
      "check": "name",
      "path": "ops/bin/as6-diagnose-name",
      "status_visible": true,
      "source": "auto"
    }
  ]
}

Rule:

Status registry synchronization must update the diagnostics array, not root-level ad-hoc keys.
