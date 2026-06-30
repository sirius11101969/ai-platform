# AS6 Release Evidence Manifest

Stage: AS6_PLATFORM_V2_PLUGIN_VERSION_UPDATE_MANAGER_P25

Branch: preview/pr-359

Head: 30800dcc81dbfc6aa8c80aea9d07fecb550f7c6d

Target: as6-control-plugin-version-update-manager-p25

Readiness: 99.9999995%

Evidence:
- Git status: runtime/as6-p25-plugin-version-update-manager/release/evidence/git-status.txt
- Validate log: runtime/as6-p25-plugin-version-update-manager/release/evidence/as6-validate.log
- Release gate log: runtime/as6-p25-plugin-version-update-manager/release/evidence/as6-release-gate.log

Results:
- AS6_VALIDATE: PASS
- AS6_RELEASE_GATE: PASS
- BUILD: PASS
