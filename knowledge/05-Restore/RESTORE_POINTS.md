# Restore Points

## Emergency rollback

```bash
ops/bin/as6-restore-to-tag AS6_RESTORE_0e422a9
```

## Current working rollback

```bash
ops/bin/as6-restore-to-tag AS6_RESTORE_0b8ccd5
```

## Remote rollback only with explicit confirmation

```bash
CONFIRM_AS6_RESTORE=YES ops/bin/as6-restore-to-tag AS6_RESTORE_0e422a9 --push
```
