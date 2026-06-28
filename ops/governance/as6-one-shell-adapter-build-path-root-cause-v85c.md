# AS6 ONE Shell Adapter Build Path Root Cause V85C

Root cause: V85B correctly passed shell adapter diagnostics, but build was executed from repository root where package.json does not exist.

Repair: detect actual package.json location and run npm build from that directory.
