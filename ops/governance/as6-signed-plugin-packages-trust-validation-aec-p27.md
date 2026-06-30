# AS6 Signed Plugin Packages Trust Validation AEC P27

Failure classes:
- AS6_SIGNED_PLUGIN_PACKAGES_TRUST_VALIDATION_DRIFT
- AS6_PLUGIN_PACKAGE_SIGNATURE_GAP
- AS6_PLUGIN_PACKAGE_INTEGRITY_GAP
- AS6_TRUSTED_PUBLISHER_POLICY_GAP
- AS6_REMOTE_PLUGIN_TRUST_STATUS_GAP

AEC rules:
- Remote plugin packages must expose trust status.
- Marketplace must annotate plugin trust.
- Package trust validation must check publisher, signature and SHA-256 metadata.
- Trust validation must not break local fallback mode.
