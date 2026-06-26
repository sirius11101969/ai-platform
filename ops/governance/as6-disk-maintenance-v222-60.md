# AS6 V222_60 Governance — Disk Maintenance

- Failure class: ROOT_DISK_BACKUP_ACCUMULATION
- Root cause: project_backups_accumulated_until_root_disk_reached_100_percent
- AEC rule: project backup retention must be automated and limited to the latest 3 daily archives unless explicitly changed.
- Docker volumes are not pruned automatically.
- Readiness: 99%.
