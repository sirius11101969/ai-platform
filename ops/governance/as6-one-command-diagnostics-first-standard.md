# AS6 One Command Diagnostics First Standard

Mandatory workflow:

Diagnostics -> Root Cause -> Structure -> Change -> Re-Diagnostics -> Diagnostic Artifacts -> Checks -> Controls -> Failure Classes -> AEC Rules -> Diagnostic Registry -> Coverage Registry -> Governance -> State -> Error Registration -> Automation -> Control -> Validation -> Commit -> Push.

Rules:

- Every change must be delivered as one command, one script, one patch, one prompt, or one hybrid command.
- The command must execute the full cycle without additional manual follow-up commands.
- Use one external quoted heredoc.
- Do not use nested heredocs.
- Do not use base64.
- Do not use long python3 scripts.
- Do not print tokens, keys, passwords, or sensitive values.
- Do not request credentials unless strictly required.
- Every new bug, failure class, root cause, architecture drift, deployment drift, monitoring gap, validation gap, rollback gap, governance gap, or security gap must automatically create or update diagnostics, registry, coverage, governance, state, prevention controls, and AEC rules.
- Every response must explicitly list what was added to diagnostics.
- Every one-command patch must print a terminal completion marker before exit.

Primary principle:

One command must do everything from diagnostics to commit and push.
