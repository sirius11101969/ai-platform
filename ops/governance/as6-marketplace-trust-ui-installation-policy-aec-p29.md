# AS6 Marketplace Trust UI Installation Policy AEC P29

Failure classes:
- AS6_MARKETPLACE_TRUST_UI_INSTALLATION_POLICY_DRIFT
- AS6_PLUGIN_INSTALL_POLICY_ENFORCEMENT_GAP
- AS6_PLUGIN_TRUST_STATUS_UI_GAP
- AS6_PLUGIN_TRUST_AUDIT_LOG_GAP

AEC rules:
- Marketplace installation must evaluate trust policy before install.
- Developer Console must expose trust status.
- Developer Console must expose install policy mode.
- Trust audit records must be available for blocked/warned installs.
