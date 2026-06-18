# AS6 Generated Python Artifact Hygiene Policy

Rules:
- Generated Python checks must not leave __pycache__ directories.
- Generated Python checks must not leave *.pyc files.
- Python runtime diagnostics must clean transient bytecode artifacts before returning.
- Import WARN may remain visible, but bytecode artifact drift must not fail after cleanup.
