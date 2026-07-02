# AS6 Independent GitHub Verification Rule
RULE_ID=AS6_GOVERNANCE_INDEPENDENT_GITHUB_VERIFICATION_RULE
STATUS=ACTIVE
CHANGE_CLASS=GOVERNANCE
SCOPE=VERIFICATION

## Rule

Final AS6 stage assessments must rely on both runtime journal evidence and independent GitHub verification.

Runtime journal evidence alone is not sufficient for full engineering confirmation when GitHub verification is available.

## Required GitHub Verification

- Repository accessibility.
- Target branch head.
- Exact commit SHA.
- Commit message.
- Commit diff or key changed files.
- Restore tag existence.
- Restore tag points to expected commit.
- Key artifacts exist at verified commit or tag.
- Diagnostic and control scripts exist at verified commit or tag.
- Registry, coverage, governance, state and runtime evidence exist when required by the stage.
- GitHub combined status or workflow status when available.

## Required Final Report Sections

- CONFIRMED_BY_RUNTIME_LOG
- CONFIRMED_BY_GITHUB
- NOT_INDEPENDENTLY_CONFIRMED

## Failure Class

FAILURE_CLASS=AS6_GITHUB_INDEPENDENT_VERIFICATION_MISSING

## AEC Rule

AS6_AEC_INDEPENDENT_GITHUB_VERIFICATION_REQUIRED

## Invariant

No AS6 stage shall be declared fully verified solely from a pasted execution journal when GitHub verification is available.

## Impact

BASELINE_IMPACT=NONE
ARCHITECTURE_IMPACT=NONE
RUNTIME_IMPACT=NONE
COMPATIBILITY=UNCHANGED
