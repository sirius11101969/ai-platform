# AS6 ONE Shell Adapter Build Selector Root Cause V85E

Root cause: V85D selected package.json from frontend/node_modules because node_modules pruning was incomplete.

Second root cause: runtime is ignored by .gitignore, so runtime evidence must not be committed with normal git add.

Repair: prune every node_modules path, prefer app-level frontend package.json, validate selected build dir is not node_modules, and commit only tracked governance/source/docs artifacts.
