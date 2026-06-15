# AS6 Autonomous Deployment Operations

Rule:

The controller validates whether deployment is allowed, but it does not apply production changes automatically.

Required result before deployment apply:

- AUTONOMOUS_DEPLOYMENT_CONTROLLER=PASS
- AS6_AUTONOMOUS_DEPLOYMENT_CONTROLLER_RESULT=OK

Required evidence:

- runtime/deployment-controller/latest.out

Secrets:

Never print secret values. Use only:

<INSERT_SECRET_HERE>
