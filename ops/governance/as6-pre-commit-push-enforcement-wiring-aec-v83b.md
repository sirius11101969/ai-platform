# AS6 V83B AEC

Pre-commit/push guard may run in same-cycle mode while validating its own staged enforcement artifacts.
Same-cycle mode must still run registry enforcement, readiness diagnostic evidence, secret scan, runtime staging guard and production health.
Strict mode remains available for normal post-commit guard use.
