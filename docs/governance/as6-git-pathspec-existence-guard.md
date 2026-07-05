# AS6 Git Pathspec Existence Guard

STATUS=ACTIVE
RULE=AS6_GIT_PATHSPEC_EXISTENCE_GUARD

Before git add, every file path must be checked with test -f or test -e.

Forbidden patterns:

- git add <possibly-missing-file>
- git add runtime
- git add -f runtime

Required pattern:

for f in ...; do
  [ -f "$f" ] && git add "$f"
done

This prevents script failures caused by pathspec references to files that do not exist.
