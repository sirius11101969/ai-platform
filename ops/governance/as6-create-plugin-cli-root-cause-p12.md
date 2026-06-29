# AS6 Create Plugin CLI Root Cause P12

Root cause: P11 added Public Extension SDK, but developers still had to manually create plugin folders, manifest files and examples.

Risk: plugin authors can create inconsistent extension structures or bypass SDK helpers.

Repair: add ops/bin/as6-create-plugin and generated plugin diagnostic.
