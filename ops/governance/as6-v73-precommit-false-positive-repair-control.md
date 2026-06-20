# AS6 V73 Precommit False Positive Repair Control
- Precommit false positive on null-token-initializer may use no-verify only after explicit value-hidden scan passes.
- No runtime artifacts may be staged.
- The only accepted AuthContext token initializer is null-token-initializer.
- Route chunks, build, and production health must pass before commit.
