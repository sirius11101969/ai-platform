# AS6 Product Problem Framing from Evidence V222.25

Status: PASS
Stage: V222.25 Product Problem Framing from Evidence Chain
Base Commit: 76cce9f7a4b235e25123c42d8b2c32cb07f093ad
Restore After: AS6_RESTORE_V222_25_PRODUCT_PROBLEM_FRAMING_FROM_EVIDENCE_20260626T033601Z
Readiness: 100% for V221 scope; V222.25 completed

## Confirmed Problem
V222.24 selected PRODUCT_EVIDENCE_CHAIN_DECISION_USE_GAP, but the selected problem had not yet been framed as an actionable user-value improvement.

## Product Problem Frame
- PROBLEM_ID=PRODUCT_EVIDENCE_CHAIN_DECISION_USE_GAP
- PROBLEM_STATEMENT=AS6 has a working Product Intelligence evidence chain, but the product does not yet expose a clear reviewed next action that turns this evidence into a concrete user-value improvement.
- USER_IMPACT=The team can collect and validate evidence, but without a framed next action the evidence chain remains internal infrastructure instead of improving the user's workflow.
- ROOT_CAUSE=The evidence chain was validated before a product-facing decision frame was created.
- SUCCESS_CRITERIA=The next stage must define one minimal user-facing improvement derived from the evidence chain.
- NON_GOALS=No redesign. No new Governance. No backend persistence. No external analytics. No broad refactor.
- NEXT_STAGE=V222.26 Minimal User-Value Improvement Proposal from Evidence

## Candidate Next Improvements
- CANDIDATE_A=Show first-action review hint inside Command Center
- USER_VALUE=Helps user understand what to do next after entering Command Center
- EFFORT=Low
- RISK=Low
- EVIDENCE_LINK=First-action telemetry and orientation chain
- DECISION=Recommended
- 
- CANDIDATE_B=Create internal analytics review page
- USER_VALUE=Helps team inspect product evidence
- EFFORT=Medium
- RISK=Medium
- EVIDENCE_LINK=Product Intelligence chain
- DECISION=Defer because it serves team review before user value
- 
- CANDIDATE_C=Add backend event persistence
- USER_VALUE=Improves durability of analytics
- EFFORT=High
- RISK=Medium
- EVIDENCE_LINK=Runtime storage validation
- DECISION=Defer because backend persistence requires separate diagnostic cycle

## Decision
The next minimal product improvement should be: show a first-action review hint inside Command Center, derived from the existing first-action evidence chain.

## Product Result
AS6 now has an evidence-derived product problem frame and a recommended next user-value improvement.

## Engineering Result
Diagnostic-only stage. No product code, UI, backend, telemetry, metrics, insights, helper or Governance changes.

## Added Diagnostics
- Selected problem framing check.
- User impact check.
- Success criteria check.
- Non-goal boundary check.
- Next-stage linkage check.
- Candidate improvement comparison.

## Added Failure Classes
- PRODUCT_PROBLEM_SELECTED_BUT_NOT_FRAMED
- PRODUCT_EVIDENCE_WITHOUT_USER_VALUE_FRAME
- PRODUCT_IMPROVEMENT_WITHOUT_NON_GOALS

## Added AEC Rules
- Selected product problems must be framed before implementation.
- Product improvements must define user impact, success criteria and non-goals.
- Evidence-derived improvements must prefer the smallest user-facing value step.
