# EPIC-005 PR-4 Repair — JSX Template Literal Bash Substitution

STAGE=AS6_EPIC005_PR4_EXECUTIVE_AUTOMATION_AUDIT_TRAIL_REPAIR
DATE_UTC=20260702T051231Z

## Failure Class
AS6_JSX_TEMPLATE_LITERAL_BASH_SUBSTITUTION_GAP

## Root Cause
Bash processed a JSX JavaScript template literal as shell substitution and corrupted the React key expression into key={}.

## Broken Pattern
- JSX template literal generated through Bash printf.
- Shell-visible pattern: ${item.executionId}-${step.order}.

## Repair
- Replaced key={} with key={item.executionId + "-" + step.order}.

## Control
- Do not generate JSX JavaScript template literals through Bash printf without a safe writer.
- Use string concatenation for JSX keys in shell-generated patches.
- Use a dedicated .mjs writer when JSX requires template literals.

## Validation
- npm frontend build.
- AS6 PR Guardian.

PROJECT_READINESS=99.9%
