# AS6 Python Bytecode Staged Deletion Policy

Rules:
- Staged deletion of tracked *.pyc files is allowed during cleanup.
- Added, modified, or untracked *.pyc files are forbidden.
- __pycache__ and *.pyc must not remain tracked after commit.
