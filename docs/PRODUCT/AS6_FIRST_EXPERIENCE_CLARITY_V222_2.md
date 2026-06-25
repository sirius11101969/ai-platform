# AS6 First Experience Clarity V222.2

Status: PASS
Stage: V222.2 First Experience Clarity
Base Commit: 65e465d081d15bc76ff6894db6d00b00519a5e74
Restore After: AS6_RESTORE_V222_2_FIRST_EXPERIENCE_CLARITY_REPAIR_20260625T165516Z
Readiness: 100% for V221 scope; V222 product improvement cycle active

## Confirmed Problem
V222.1B confirmed a broad product surface. The first screen needed a clearer user-value explanation and a clearer first CTA outcome.

## Root Cause
The hero copy used broad platform wording and technical proof labels. Initial replacement also missed source text with non-standard hyphen characters.

## Minimal Change
- Updated hero badge to practical value.
- Updated H1 to explain what AS6 helps users understand.
- Updated lead paragraph to situation, next step and action plan.
- Updated primary CTA to "Получить демо и план".
- Updated secondary CTA to "Посчитать эффект".
- Replaced technical proof labels with user-value proof labels.

## Product Result
The first screen now answers faster: what AS6 does, why it matters and what to do next.

## Engineering Result
One isolated LandingPage copy change; no route, backend, auth, CRM or Governance changes.

## Added Diagnostics
- First screen clarity diagnostic.
- Technical proof label leakage check.
- CTA outcome clarity check.
- Non-standard hyphen copy replacement diagnostic.

## Added Failure Classes
- PRODUCT_FIRST_EXPERIENCE_CLARITY_GAP
- PRODUCT_TECHNICAL_PROOF_LABEL_LEAK
- PRODUCT_COPY_REPLACEMENT_PATTERN_GAP

## Added AEC Rules
- Public first screen must explain user value before technical proof.
- Primary CTA must describe the expected user outcome.
- Copy replacement checks must validate actual rendered source strings, not assumed punctuation.
