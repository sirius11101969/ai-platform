# AS6 Autonomous Deployment Controller

Purpose:

Validate whether AS6 is allowed to proceed toward deployment under L7 autonomy.

Controller:

- ops/bin/as6-autonomous-deployment-controller

Result contract:

- AUTONOMOUS_DEPLOYMENT_CONTROLLER=PASS
- AUTONOMOUS_DEPLOYMENT_CONTROLLER=FAIL
- AS6_AUTONOMOUS_DEPLOYMENT_CONTROLLER_RESULT=OK
- AS6_AUTONOMOUS_DEPLOYMENT_CONTROLLER_RESULT=FAIL

Policy:

- validates deployment gates
- does not auto-apply production changes
- requires human approval for apply mode

Evidence:

- runtime/deployment-controller/latest.out
