# AS6 Plugin Version Update Manager AEC P25

Failure classes:
- AS6_PLUGIN_VERSION_UPDATE_MANAGER_DRIFT
- AS6_PLUGIN_UPDATE_DETECTION_GAP
- AS6_PLUGIN_UPDATE_ROLLBACK_GAP
- AS6_PLUGIN_VERSION_COMPARISON_GAP

AEC rules:
- Plugin runtime must compare installed and available versions.
- Plugin updates must validate manifest before applying.
- Plugin updates must keep rollback snapshot.
- Marketplace must expose update status and update operation.
