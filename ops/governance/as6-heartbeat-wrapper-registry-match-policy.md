# AS6 Heartbeat Wrapper Registry Match Policy

Rule:

Every diagnostic artifact must have canonical Diagnostic Registry, Coverage Registry and Status Registry linkage.

Required behavior:

- ops/bin/as6-diagnose-universal-heartbeat-wrapper must be discoverable by diagnostic-registration.
- Registry line must use the exact diagnostic path.
- Coverage line must use the exact diagnostic path.
- Status registry must contain the exact diagnostic path.
- Registration drift must be repaired before closing work.
