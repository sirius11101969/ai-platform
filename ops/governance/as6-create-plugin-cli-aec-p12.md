# AS6 Create Plugin CLI AEC P12

Failure classes:
- AS6_CREATE_PLUGIN_CLI_DRIFT
- AS6_GENERATED_PLUGIN_STRUCTURE_GAP
- AS6_GENERATED_PLUGIN_MANIFEST_GAP
- AS6_GENERATED_PLUGIN_SDK_BYPASS
- AS6_PLUGIN_ONBOARDING_AUTOMATION_GAP

AEC rules:
- New generated plugins must use ops/bin/as6-create-plugin.
- Generated plugins must include manifest.js and README.md.
- Generated manifests must use defineAS6Plugin.
- Generated plugins must pass ops/bin/as6-diagnose-generated-plugin.
