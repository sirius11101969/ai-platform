# AS6 Plugin Marketplace / Extension Runtime AEC P10

Failure classes:
- AS6_PLUGIN_MARKETPLACE_RUNTIME_DRIFT
- AS6_PLUGIN_MANIFEST_INVALID
- AS6_PLUGIN_POLICY_GAP
- AS6_PLUGIN_PERMISSION_ESCALATION
- AS6_PLUGIN_RUNTIME_INSTALL_GAP
- AS6_PLUGIN_BUS_HANDLER_GAP

AEC rules:
- Plugins must have id/title/version/publisher.
- Plugins must not request wildcard permissions.
- Plugins must register widgets/actions/bus handlers through Plugin Runtime.
- Marketplace installation must call Plugin Runtime.
- Plugins must pass Tenant Policy before activation.
