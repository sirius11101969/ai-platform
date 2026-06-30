# AS6 Marketplace Install Persistence AEC P24

Failure classes:
- AS6_MARKETPLACE_INSTALL_PERSISTENCE_DRIFT
- AS6_PLUGIN_INSTALL_STATE_VOLATILE
- AS6_PLUGIN_RESTORE_GAP

AEC rules:
- Plugin install state must persist after install, enable, disable and remove.
- Runtime must expose restoreAS6PluginInstallState.
