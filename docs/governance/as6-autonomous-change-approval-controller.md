# AS6 Autonomous Change Approval Controller

Purpose:

Validate whether a change is approved for planning/evidence and block automatic production apply without human approval.

Controller:

- ops/bin/as6-autonomous-change-approval-controller

Result contract:

- AS6_CHANGE_APPROVAL=PASS
- AS6_CHANGE_APPROVAL=FAIL
- AS6_CHANGE_APPROVAL_RESULT=OK
- AS6_CHANGE_APPROVAL_RESULT=FAIL
- AS6_CHANGE_APPROVAL_DECISION=<decision>
- AS6_CHANGE_APPROVAL_AUTO_APPLY=NO

Evidence:

- runtime/change-approval/latest.out
- runtime/change-approval/change-approval.env
- runtime/change-approval/change-approval-plan.md
