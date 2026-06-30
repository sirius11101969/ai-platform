# AS6 Signed Package Manager AEC P30

Failure classes:
- AS6_SIGNED_PACKAGE_MANAGER_DRIFT
- AS6_PLUGIN_PACKAGE_IMPORT_GAP
- AS6_PLUGIN_PACKAGE_EXPORT_GAP
- AS6_PLUGIN_PACKAGE_TRUST_VALIDATION_GAP
- AS6_LOCAL_PLUGIN_PACKAGE_REPOSITORY_GAP

AEC rules:
- Plugin packages must use .as6plugin format metadata.
- Package import must validate trust and policy before install.
- Package export must produce manifest and SHA-256 metadata.
- Local package repository must expose saved packages.
