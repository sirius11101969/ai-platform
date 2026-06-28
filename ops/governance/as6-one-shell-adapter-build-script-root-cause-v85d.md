# AS6 ONE Shell Adapter Build Script Root Cause V85D

Root cause: V85C detected package.json, but selected a package without npm build script.

Repair: select the package.json that explicitly contains a build script before running npm run build.
