# AS6 Python Bytecode Artifact Policy

Rules:
- __pycache__ directories must never be tracked.
- *.pyc files must never be tracked.
- Python diagnostics may compile helpers, but bytecode artifacts must be removed before validation ends.
- Git status must not contain tracked or untracked pycache artifacts.
