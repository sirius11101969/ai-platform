# AS6 Runtime Artifact Staging Policy

Rule:

Runtime artifacts under runtime/ are execution evidence and must not be required for commit completion.

Required behavior:

- Validate runtime artifacts when needed.
- Runtime artifacts must not be staged.
- Do not stage runtime/ paths.
- Do not fail commit because runtime/ is ignored by .gitignore.
- Repository artifacts live in ops/ and docs/.
- Runtime evidence remains local and disposable.
