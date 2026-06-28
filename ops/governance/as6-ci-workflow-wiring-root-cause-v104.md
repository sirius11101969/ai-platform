# AS6 CI Workflow Wiring Root Cause V104

Root cause: V103 created the canonical ops/bin/as6-validate DAG entrypoint, but GitHub Actions does not yet have a dedicated AS6 validation workflow wired to it.

Risk: PR validation can bypass the compact DAG runner and regress back to ad-hoc or legacy validation commands.

Repair: add GitHub Actions workflow that runs npm install/build and ops/bin/as6-validate on push and pull_request.
