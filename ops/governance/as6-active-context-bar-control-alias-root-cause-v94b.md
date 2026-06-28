# AS6 Active Context Bar Control Alias Root Cause V94B

Root cause: V94 control referenced ops/bin/as6-control-registry-driven-navigation-ui-v93, but V93 created ops/bin/as6-control-registry-navigation-ui-v93.

Repair: add compatibility alias and patch V94 control to call the existing V93 control name.
